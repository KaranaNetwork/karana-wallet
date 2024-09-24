import _ from 'lodash';
import axios, { AxiosError, type AxiosRequestConfig, type Method } from 'axios';
import type { Context, Span } from '@opentelemetry/api';
import { message } from 'ant-design-vue';

import store from '@/store/store';
import Config from '@/lib/config/config';
import pathUtil from '@/lib/utils/path';
import objectUtil from '@/lib/utils/object';
import trace from '@/lib/utils/trace';
import EditMedia from '@/lib/models/media/edit-media';

const axiosInstance = axios.create();

export interface Options {
  ctx?: Context;
  isAlert?: boolean;
  ignoreTraceError?: boolean;
  withTraceparent?: boolean;
}

class Request {
  public apiUrl(path: string): string {
    return path.startsWith('http://') || path.startsWith('https://')
      ? path
      : pathUtil.join(Config.apiUrl, path);
  }
  public rpcUrl(path: string): string {
    return path.startsWith('http://') || path.startsWith('https://')
      ? path
      : pathUtil.join(Config.rpcUrl, path);
  }
  public traUrl(path: string): string {
    return path.startsWith('http://') || path.startsWith('https://')
      ? path
      : pathUtil.join(Config.traUrl, path);
  }

  public cdn(path: string): string {
    if (!path || path == '') {
      return '';
    }
    const s =
      path.startsWith('http://') ||
      path.startsWith('blob:http://') ||
      path.startsWith('https://') ||
      path.startsWith('blob:https://') ||
      path.startsWith('data:')
        ? path
        : pathUtil.join(Config.cdnUrl, path);
    return s;
  }

  public setAxiosSpanRequestAttributes(span: Span, config: AxiosRequestConfig) {
    span.setAttribute('location.origin', location.origin);
    span.setAttribute('location.href', location.href);
    span.setAttribute('request.method', config.method?.toUpperCase() ?? 'GET');
    span.setAttribute('request.url', config.url ?? '');
    span.setAttribute('account.address', store.account?.address ?? '');
    span.setAttribute('account.publickKey32', store.account?.publicKey32 ?? '');
    if (config.url && URL.canParse(config.url)) {
      const url = new URL(config.url);
      span.setAttribute('request.protocol', url.protocol);
      span.setAttribute('request.host', url.host);
      span.setAttribute('request.port', url.port);
      span.setAttribute('request.path', url.pathname);
      span.setAttribute('request.query', url.search);
    }
  }

  public setAxiosSpanResponseErrorAttributes(span: Span, e: unknown) {
    trace.recordError(span, _.get(e, ['response', 'data', 'error']) ?? _.get(e, 'message'));
    span.setAttribute('response.status', _.get(e, ['response', 'status']) ?? 'none');
    span.setAttribute('response.data', _.get(e, ['response', 'data']));
  }

  public async axios(config: AxiosRequestConfig, options?: Options) {
    const instance = axiosInstance;
    const span = trace
      .getTracer()
      .startSpan(config.method + ':' + config.url?.split('?')[0], {}, options?.ctx);
    this.setAxiosSpanRequestAttributes(span, config);
    try {
      const withTraceparent = options?.withTraceparent ?? false;
      if (withTraceparent) {
        if (config.headers) {
          config.headers['traceparent'] = trace.traceparent(span);
          config.headers['tracestate'] = trace.tracestate(span);
        } else {
          config.headers = {
            traceparent: trace.traceparent(span),
            tracestate: trace.tracestate(span),
          };
        }
      }
      const response = await instance.request(config);
      span.setAttribute('response.status', response.status);
      return response;
    } catch (e: any) {
      this.setAxiosSpanResponseErrorAttributes(span, e);
      throw e;
    } finally {
      span.end();
    }
  }

  public async request(method: Method, path: string, data?: any, options?: Options): Promise<any> {
    const isAlert = options?.isAlert ?? true;
    let url = path;
    if (method == 'get' || method == 'GET') {
      const queryString = new URLSearchParams(data).toString();
      if (queryString != '') {
        if (url.indexOf('?') > 0) {
          url += '&' + queryString;
        } else {
          url += '?' + queryString;
        }
      }
      data = undefined;
    }
    try {
      const response = await this.axios({
        method: method,
        data: data,
        url: url,
      });
      return response.data;
    } catch (e: unknown) {
      if (isAlert) {
        message.error(
          _.get(e, ['response', 'data', 'error']) ?? _.get(e, 'message') ?? 'unknown error',
        );
      }
      throw e;
    }
  }

  public async post(path: string, data?: object, options?: Options) {
    return await this.request('POST', path, data, options);
  }

  public async get(path: string, query?: object, options?: Options) {
    return await this.request('GET', path, query, options);
  }

  public async fetch(url: string, options?: Options) {
    const span = trace.getTracer().startSpan('fetch:' + url.split('?')[0], undefined, options?.ctx);
    span.setAttribute('fetch.url', url);
    span.setAttribute('location.href', location.href);
    span.setAttribute('account.address', store.account?.address ?? '');
    span.setAttribute('account.publicKey32', store.account?.publicKey32 ?? '');
    try {
      const resp = await fetch(url);
      span.setAttribute('rpc.status', resp.status);
      if (resp.status >= 400) {
        trace.recordError(span, 'fetch error');
      }
      return resp;
    } catch (e) {
      trace.recordError(span, _.get(e, 'message') ?? '');
      message.error(_.get(e, 'message') ?? 'network error');
      throw e;
    } finally {
      span.end();
    }
  }

  public async rpc(name: string, params?: object, options?: Options) {
    const url = this.rpcUrl('/');
    const instance = axiosInstance;
    const id = new Date().getTime();
    const span = trace.getTracer().startSpan('rpc:' + name, undefined, options?.ctx);
    span.setAttribute('location.href', location.href);
    span.setAttribute('account.address', store.account?.address ?? '');
    span.setAttribute('account.publicKey32', store.account?.publicKey32 ?? '');
    span.setAttribute('rpc.url', url);
    span.setAttribute('rpc.id', id);
    span.setAttribute('rpc.method', name);
    span.setAttribute('rpc.params', JSON.stringify(params));
    try {
      const response = await instance.post(url, {
        jsonrpc: '2.0',
        method: name,
        params: params,
        id: id,
      });
      let data = response.data;
      span.setAttribute('rpc.status', response.status);
      span.setAttribute('rpc.data', JSON.stringify(data));
      data = objectUtil.camelCaseKeys(data);
      if (_.isEmpty(_.get(data, 'jsonrpc'))) {
        throw new AxiosError(
          'internal error: ' + data,
          _.get(data, 'ERR_BAD_REQUEST'),
          undefined,
          undefined,
          response,
        );
      } else if (!_.isEmpty(_.get(data, 'error'))) {
        throw new AxiosError(
          _.get(data, 'error.message'),
          _.get(data, 'ERR_BAD_REQUEST'),
          undefined,
          undefined,
          response,
        );
      }
      const result = _.get(data, 'result');
      return result;
    } catch (e: any) {
      this.setAxiosSpanResponseErrorAttributes(span, e);
      message.error(_.get(e, 'message') ?? e);
      throw e;
    } finally {
      span.end();
    }
  }

  public async put(
    path: string,
    file: File,
    config: AxiosRequestConfig<File> | undefined = { timeout: 0 },
  ) {
    const url = this.apiUrl(path);
    const instance = axiosInstance;
    await instance.put(url, file, config);
  }

  public errMessage(e: unknown): string {
    if (e instanceof AxiosError) {
      if (!_.isEmpty(e.response?.data.error)) {
        e.message = e.response?.data.error;
      }
      return e.message;
    } else if (e instanceof Error) {
      return e.message;
    }
    return _.toString(e);
  }

  public async uploadEditMedia(editMedia: EditMedia) {
    const data = await this.presignedUrl({
      path: editMedia.path,
    });
    console.log(data);
    const uploadUrl = _.get(data, 'uploadUrl');
    const accessUrl = _.get(data, 'accessUrl');
    const contentType = _.get(data, 'contentType', '');
    await request.put(uploadUrl, editMedia.file, {
      timeout: 0,
      headers: {
        'Content-Type': contentType,
      },
    });

    editMedia.editSrc = accessUrl;
    editMedia.isUploaded = 1;
    return {
      uploadUrl: uploadUrl,
      accessUrl: accessUrl,
    };
  }

  public async presignedUrl(params: { path: string }) {
    return await request.post('/media/presignedUrl', params);
  }

  public async balanceOf(assetId: string, accountAddress: string, options?: Options) {
    return (await this.rpc('balanceOf', [assetId, accountAddress], options)) as string;
  }
}

const request = new Request();
export default request;
