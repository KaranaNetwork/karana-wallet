import _ from 'lodash';
import { message } from 'ant-design-vue';
import { Contract } from 'web3';

import type { Options } from '@/lib/request/request';
import trace from '@/lib/utils/trace';
import store from '@/store/store';

class Methods {
  public readonly contractRequest: ContractRequest;
  public constructor(contractRequest: ContractRequest) {
    this.contractRequest = contractRequest;
  }

  public async balanceOf(accountAddress: string) {
    return (await this.contractRequest.methodCall('balanceOf', [accountAddress])) as bigint;
  }

  public async name() {
    return (await this.contractRequest.methodCall('name')) as string;
  }

  public async symbol() {
    return (await this.contractRequest.methodCall('symbol')) as string;
  }

  public async decimals() {
    return (await this.contractRequest.methodCall('decimals')) as number;
  }

  public async approve(spender: string, amount: string) {
    return await this.contractRequest.methodCall('approve', [spender, amount], {
      call: 'encodeABI',
    });
  }

  public async getPubkey() {
    return (await this.contractRequest.methodCall('getPubkey')) as string;
  }

  public async getAssetId() {
    return (await this.contractRequest.methodCall('getAssetId')) as string;
  }

  public async getLocalTokenAddress() {
    return (await this.contractRequest.methodCall('getLocalTokenAddress')) as string;
  }

  public async getClaimableNumber(accountAddress: string) {
    return (await this.contractRequest.methodCall('getClaimableNumber', [
      accountAddress,
    ])) as bigint;
  }

  public async getTransformingRecordNumber(accountAddress: string) {
    return (await this.contractRequest.methodCall('getTransformingRecordNumber', [
      accountAddress,
    ])) as bigint;
  }

  public async getTransformingRecordsSuccessful(accountAddress: string, cursor: string) {
    return await this.contractRequest.methodCall('getTransformingRecords', [
      accountAddress,
      cursor,
      true,
    ]);
  }

  public async getTransformingRecords(accountAddress: string, cursor: string) {
    return await this.contractRequest.methodCall('getTransformingRecords', [
      accountAddress,
      cursor,
      false,
    ]);
  }

  public async convertToOmniverse(accountPublickKey32: string, amount: string) {
    return await this.contractRequest.methodCall(
      'convertToOmniverse',
      [accountPublickKey32, amount],
      {
        call: 'encodeABI',
      },
    );
  }

  public async convertToLocal(transaction: any, accountPublicKey: string) {
    return await this.contractRequest.methodCall(
      'convertToLocal',
      [transaction, accountPublicKey],
      {
        call: 'encodeABI',
      },
    );
  }

  public async claim(transactionId: string) {
    return await this.contractRequest.methodCall('claim', [transactionId], {
      call: 'encodeABI',
    });
  }

  public async claimAll() {
    return await this.contractRequest.methodCall('claimAll', [], {
      call: 'encodeABI',
    });
  }
}

export default class ContractRequest {
  public readonly contract: Contract<never>;
  public readonly options?: Options;
  public readonly methods = new Methods(this);

  public constructor(contract: Contract<never>, options?: Options) {
    this.contract = contract;
    this.options = options;
  }

  public startMethodSpan(
    method: string,
    params: Array<unknown> = [],
    options?: Options & {
      call?: string;
    },
  ) {
    const span = trace
      .getTracer()
      .startSpan(
        'contract:method:' + method + ':' + (options?.call ?? 'call'),
        undefined,
        this.options?.ctx ?? options?.ctx,
      );
    span.setAttribute('location.href', location.href);
    span.setAttribute('account.address', store.account?.address ?? '');
    span.setAttribute('account.publicKey32', store.account?.publicKey32 ?? '');
    span.setAttribute('contract.method', method);
    span.setAttribute('contract.params', JSON.stringify(params));
    return span;
  }

  public method(method: string, params: Array<unknown> = []) {
    return this.contract.methods[method](...params);
  }

  public async methodCall(
    method: string,
    params: Array<unknown> = [],
    options?: Options & {
      call?: string;
    },
  ): Promise<any> {
    const span = this.startMethodSpan(method, params, options);
    try {
      const call = options?.call ?? 'call';
      const data = await (this.method(method, params) as any)[call]();
      return data;
    } catch (e) {
      trace.recordError(span, _.get(e, ['response', 'data', 'error']) ?? _.get(e, 'message'));
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
