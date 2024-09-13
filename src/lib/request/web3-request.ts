import _ from 'lodash';
import { message } from 'ant-design-vue';
import Web3, { type Transaction, type BlockNumberOrTag, type Bytes } from 'web3';

import trace from '@/lib/utils/trace';
import store from '@/store/store';
import type { Options } from '@/lib/request/request';

class Eth {
  public readonly web3Request: Web3Request;
  public constructor(web3Request: Web3Request) {
    this.web3Request = web3Request;
  }
  public async estimateGas(transaction: Transaction, blockNumber?: BlockNumberOrTag) {
    return await this.web3Request.ethCall('estimateGas', [transaction, blockNumber]);
  }

  public async calculateFeeData() {
    return await this.web3Request.ethCall('calculateFeeData');
  }

  public async getTransactionReceipt(transactionHash: Bytes, options?: Options) {
    return await this.web3Request.ethCall('getTransactionReceipt', [transactionHash], options);
  }
}

export default class Web3Request {
  public readonly web3: Web3;
  public readonly options?: Options;
  public readonly eth = new Eth(this);

  public constructor(web3: Web3, options?: Options) {
    this.web3 = web3;
    this.options = options;
  }

  public async ethCall(
    method: string,
    params: Array<unknown> = [],
    options?: Options,
  ): Promise<any> {
    const span = trace
      .getTracer()
      .startSpan('web3:eth:' + method, undefined, this.options?.ctx ?? options?.ctx);
    span.setAttribute('location.href', location.href);
    span.setAttribute('account.address', store.account?.address ?? '');
    span.setAttribute('account.publicKey32', store.account?.publicKey32 ?? '');
    span.setAttribute('web3.eth.method', method);
    span.setAttribute('web3.eth.params', JSON.stringify(params));
    try {
      return await (this.web3.eth as any)[method](...params);
    } catch (e) {
      trace.recordError(span, _.get(e, 'message') ?? 'unknow', options?.ignoreTraceError);
      const isAlert = options?.isAlert ?? true;
      if (isAlert) {
        message.error(_.get(e, 'message') ?? 'web3.eth call error');
      }
      throw e;
    } finally {
      span.end();
    }
  }
}
