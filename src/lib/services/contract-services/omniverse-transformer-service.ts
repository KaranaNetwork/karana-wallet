import store from '@/store/store';

import type { Options } from '@/lib/request/request';
import ContractRequest from '@/lib/request/contract-request';
import Web3Request from '@/lib/request/web3-request';

import MetamaskService from '@/lib/services/metamask-service';
import Web3Service from '@/lib/services/web3-service';
import type { ITransfer } from '@/lib/models/transaction/transaction';
import Account from '@/lib/models/account/account';

export interface ToOmniverseRecord {
  txid: string;
  amount: string;
  recipient: string;
  timestamp: string;
}

export interface ToLocalRecord {
  txid: string;
  txData: string;
  publicKey: string;
  amount: string;
  timestamp: string;
}

export interface TransformingRecord {
  txid: string;
  amount: string;
  timestamp: string;
  state: TransformingState;
  direction: TransformingDirection;
}

export enum TransformingState {
  Pending,
  Claimable,
  Settled,
}

export enum TransformingDirection {
  LocalToOmniverse,
  OmniverseToLocal,
}

export default class OmniverseTransformerService {
  contractAddress: string;
  account: Account;
  options?: Options;
  contract: ContractRequest;
  web3: Web3Request;

  constructor(contractAddress: string, account: Account, options?: Options) {
    this.contractAddress = contractAddress;
    this.account = account;
    this.options = options;
    const web3 = Web3Service.metamask;
    this.web3 = new Web3Request(web3, options);
    const contract = new web3.eth.Contract(
      store.transformerInfo?.abi.transformer as any,
      contractAddress,
    );
    this.contract = new ContractRequest(contract, options);
  }

  async getPubkey(): Promise<string> {
    return await this.contract.methods.getPubkey();
  }

  async getAssetId(): Promise<string> {
    return await this.contract.methods.getAssetId();
  }

  async getLocalTokenAddress(): Promise<string> {
    return await this.contract.methods.getLocalTokenAddress();
  }

  /**
   * Get claimable transaction number
   */
  async getClaimableNumber(): Promise<bigint> {
    return await this.contract.methods.getClaimableNumber(this.account.address);
  }

  /**
   * Get transforming records
   * @param settled Get settled list or not
   * @param index From which position to start query
   * @return records The record list
   * @return curIndex At which position the query is
   * @return ended If curIndex == totalNumber - 1, the query is to the end
   */
  async getTransformingRecords(
    settled: boolean,
    index: number = 0,
  ): Promise<{
    records: Array<TransformingRecord>;
    curIndex: number;
    ended: boolean;
  }> {
    const totalNumber = await this.contract.methods.getTransformingRecordNumber(
      this.account.address,
    );
    console.log('totalNumber', totalNumber);
    if (totalNumber == 0n) {
      return {
        records: [],
        curIndex: 0,
        ended: true,
      };
    }
    let transformingRecords: any;
    if (settled) {
      transformingRecords = await this.contract.methods.getTransformingRecordsSuccessful(
        this.account.address,
        '0',
      );
    } else {
      transformingRecords = await this.contract.methods.getTransformingRecords(
        this.account.address,
        '0',
      );
    }
    const records = new Array<TransformingRecord>();
    console.log('getTransformingRecords', transformingRecords[1], transformingRecords);
    for (let i = 0; i < transformingRecords[1]; i++) {
      const record = transformingRecords[0][i];
      console.log('record', i, record);
      const value: TransformingRecord = {
        txid: record.txid,
        amount: record.amount.toString(),
        timestamp: record.timestamp.toString(),
        state: record.state,
        direction: record.direction,
      };
      records.push(value);
    }

    const curIndex = parseInt(transformingRecords[2]);
    return {
      records,
      curIndex,
      ended: BigInt(curIndex) == totalNumber - 1n,
    };
  }

  /**
   * Get total transaction number of converting from local to omniverse
   */
  // async getLocalToOmniverseTxNumber(): Promise<string> {
  //   return (
  //     (await this.contract.methods
  //       .getLocalToOmniverseTxNumber(this.account.address)
  //       .call()) as bigint
  //   ).toString();
  // }

  /**
   *
   * @param index Get at most 10 transactions starting the index in reverted order
   * For example, there are 100 transactions [0, 1, ..., 99]
   * getLocalToOmniverseRecords(10) will return [90, 89, ..., 81]
   */
  // async getLocalToOmniverseRecords(index: string): Promise<Array<ToOmniverseRecord>> {
  //   const records = (await this.contract.methods
  //     .getLocalToOmniverseRecords(this.account.address, index)
  //     .call()) as any;

  //   const ret: Array<ToOmniverseRecord> = new Array<ToOmniverseRecord>();
  //   for (let i = 0; i < records.length; i++) {
  //     ret.push({
  //       txid: records[i].txid,
  //       amount: (records[i].amount as bigint).toString(),
  //       recipient: records[i].recipient,
  //       timestamp: records[i].timestamp.toString(),
  //     });
  //   }
  //   return ret;
  // }

  /**
   * Get total transaction number of converting from omniverse to local
   */
  // async geOmniverseToLocalTxNumber(): Promise<string> {
  //   return (
  //     (await this.contract.methods
  //       .geOmniverseToLocalTxNumber(this.account.address)
  //       .call()) as bigint
  //   ).toString();
  // }

  /**
   *
   * @param index Get at most 10 transactions starting the index in reverted order
   * For example, there are 100 transactions [0, 1, ..., 99]
   * getOmniverseToLocalRecords(10) will return [90, 89, ..., 81]
   */
  // async getOmniverseToLocalRecords(index: string): Promise<Array<ToLocalRecord>> {
  //   const records = (await this.contract.methods
  //     .getOmniverseToLocalRecords(this.account.address, index)
  //     .call()) as any;

  //   const ret: Array<ToLocalRecord> = new Array<ToLocalRecord>();
  //   for (let i = 0; i < records.length; i++) {
  //     ret.push({
  //       txid: records[i].txid,
  //       txData: records[i].txData,
  //       publicKey: records[i].publicKey,
  //       amount: (records[i].amount as bigint).toString(),
  //       timestamp: records[i].timestamp.toString(),
  //     });
  //   }
  //   return ret;
  // }

  /**
   * @notice Returns gas fee of converting omniverse to local
   * @returns ethNetFee: Gas fee payed to Ethereum Network with unit ETH
   * @returns platformFee: Gas fee payed to Karana Network with unit KARANA
   */
  async getConvertToLocalGasFee(): Promise<{
    ethNetFee: string;
    platformFee: string;
  }> {
    const gas = store.transformerInfo?.fee.convertToLocalGas ?? 0;
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
      await this.web3.eth.calculateFeeData();
    const fee = gas * (parseInt(maxFeePerGas!.toString()) / 10 ** 18);
    return {
      ethNetFee: fee.toString(),
      platformFee: store.serverInfo!.fee.amount,
    };
  }

  /**
   * @notice Returns gas fee of converting local to omniverse
   * @returns ethNetFee: Gas fee payed to Ethereum Network with unit ETH
   * @returns platformFee: Gas fee payed to Karana Network with unit ETH
   */
  async getConvertToOmniverseGasFee(): Promise<{
    ethNetFee: string;
    platformFee: string;
  }> {
    const gas = store.transformerInfo?.fee.convertToOmniverseGas ?? 0;
    const platformFee = store.transformerInfo?.fee.convertToLocalNetworkFee ?? 0;
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas, baseFeePerGas } =
      await this.web3.eth.calculateFeeData();
    const fee = gas * (parseInt(maxFeePerGas!.toString()) / 10 ** 18);
    return {
      ethNetFee: fee.toString(),
      platformFee: platformFee.toString(),
    };
  }

  async convertToOmniverse(amount: string) {
    const data = await this.contract.methods.convertToOmniverse(this.account.publicKey32, amount);
    const gasLimit = await this.web3.eth.estimateGas({
      from: this.account.address,
      to: this.contractAddress,
      data,
    });
    console.log('gasLimit', gasLimit);

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.web3.eth.calculateFeeData();

    const params = [
      {
        from: this.account.address,
        to: this.contractAddress,
        gasLimit: gasLimit.toString(16),
        maxFeePerGas: (maxFeePerGas as bigint).toString(16),
        maxPriorityFeePerGas: (maxPriorityFeePerGas as bigint).toString(16),
        data,
      },
    ];
    await MetamaskService.request({ method: 'eth_sendTransaction', params }, this.options);
  }

  async convertToLocal(transferTx: ITransfer) {
    const tx = {
      assetId: transferTx.assetId,
      signature: transferTx.signature,
      inputs: transferTx.inputs.map((input: any) => {
        return {
          txid: input.txid,
          index: input.index,
          amount: input.amount,
          omniAddress: input.address,
        };
      }),
      outputs: transferTx.outputs.map((output: any) => {
        return { amount: output.amount, omniAddress: output.address };
      }),
      feeInputs: transferTx.feeInputs.map((input: any) => {
        return {
          txid: input.txid,
          index: input.index,
          amount: input.amount,
          omniAddress: input.address,
        };
      }),
      feeOutputs: transferTx.feeOutputs.map((output: any) => {
        return { amount: output.amount, omniAddress: output.address };
      }),
    };

    console.log('tx:', tx);
    const data = await this.contract.methods.convertToLocal(tx, this.account.publicKey);

    const gasLimit = await this.web3.eth.estimateGas({
      from: this.account.address,
      to: this.contractAddress,
      data,
    });
    console.log('gasLimit', gasLimit);

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.web3.eth.calculateFeeData();

    const params = [
      {
        from: this.account.address,
        to: this.contractAddress,
        gasLimit: gasLimit.toString(16),
        maxFeePerGas: (maxFeePerGas as bigint).toString(16),
        maxPriorityFeePerGas: (maxPriorityFeePerGas as bigint).toString(16),
        data,
      },
    ];

    await MetamaskService.request({ method: 'eth_sendTransaction', params }, this.options);
  }

  async claim(txid: string) {
    const data = await this.contract.methods.claim(txid);
    const gasLimit = await this.web3.eth.estimateGas({
      from: this.account.address,
      to: this.contractAddress,
      data,
    });
    //console.log('gasLimit', gasLimit);
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.web3.eth.calculateFeeData();
    const params = [
      {
        from: this.account.address,
        to: this.contractAddress,
        gasLimit: gasLimit.toString(16),
        maxFeePerGas: (maxFeePerGas as bigint).toString(16),
        maxPriorityFeePerGas: (maxPriorityFeePerGas as bigint).toString(16),
        data,
      },
    ];
    await MetamaskService.request({ method: 'eth_sendTransaction', params }, this.options);
  }

  async claimAll() {
    const data = await this.contract.methods.claimAll();
    const gasLimit = await this.web3.eth.estimateGas({
      from: this.account.address,
      to: this.contractAddress,
      data,
    });
    console.log('gasLimit', gasLimit);

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.web3.eth.calculateFeeData();

    const params = [
      {
        from: this.account.address,
        to: this.contractAddress,
        gasLimit: gasLimit.toString(16),
        maxFeePerGas: (maxFeePerGas as bigint).toString(16),
        maxPriorityFeePerGas: (maxPriorityFeePerGas as bigint).toString(16),
        data,
      },
    ];

    await MetamaskService.request({ method: 'eth_sendTransaction', params }, this.options);
  }
}
