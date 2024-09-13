import _ from 'lodash';
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { Context } from '@opentelemetry/api';
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
}

class Request {
  public rpcUrl(path: string): string {
    return path.startsWith('http://') || path.startsWith('https://')
      ? path
      : pathUtil.join(Config.rpcUrl, path);
  }

  public apiUrl(path: string): string {
    return path.startsWith('http://') || path.startsWith('https://')
      ? path
      : pathUtil.join(Config.apiUrl, path);
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

  public async post(path: string, params?: object) {
    const url = this.apiUrl(path);
    const instance = axiosInstance;
    const response = await instance.post(url, params, {
      headers: {},
    });
    const data = response.data;
    if (_.get(data, 'code') != 0) {
      throw new Error('error: ' + _.get(data, 'message'));
    }
    return _.get(data, 'data', {});
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
      trace.recordError(span, _.get(e, ['response', 'data', 'error']) ?? _.get(e, 'message'));
      span.setAttribute('rpc.status', _.get(e, ['response', 'status']) ?? 'none');
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
