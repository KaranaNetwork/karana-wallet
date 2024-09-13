import _ from 'lodash';
import { message } from 'ant-design-vue';
import hexUtil from '@/lib/utils/hex';
import MetamaskService from '@/lib/services/metamask-service';
import store from '@/store/store';
import type { Options } from '@/lib/request/request';

export default class SignService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getDeployHashData(tx: any): string {
    let hashData = '';
    hashData += hexUtil.intArrayToHex(tx.metadata.salt);
    hashData += hexUtil.stringToHex(tx.metadata.name).padEnd(24 * 2, '0');
    hashData += hexUtil.intArrayToHex(tx.metadata.deployer);
    hashData += hexUtil.bigIntToHexLE(tx.metadata.total_supply, 32);
    hashData += hexUtil.bigIntToHexLE(tx.metadata.limit, 32);
    hashData += hexUtil.bigIntToHexLE(tx.metadata.price, 32);
    for (const input of tx.fee_inputs) {
      hashData += hexUtil.intArrayToHex(input.txid);
      hashData += hexUtil.bigIntToHexLE(input.index, 16);
      hashData += hexUtil.intArrayToHex(input.address);
      hashData += hexUtil.bigIntToHexLE(input.amount, 32);
    }
    for (const output of tx.fee_outputs) {
      hashData += hexUtil.intArrayToHex(output.address);
      hashData += hexUtil.bigIntToHexLE(output.amount, 32);
    }
    return hashData;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getMintHashData(tx: any): string {
    let hashData = '';
    hashData += hexUtil.intArrayToHex(tx.asset_id);
    for (const output of tx.outputs) {
      hashData += hexUtil.intArrayToHex(output.address);
      hashData += hexUtil.bigIntToHexLE(output.amount, 32);
    }
    for (const input of tx.fee_inputs) {
      hashData += hexUtil.intArrayToHex(input.txid);
      hashData += hexUtil.bigIntToHexLE(input.index, 16);
      hashData += hexUtil.intArrayToHex(input.address);
      hashData += hexUtil.bigIntToHexLE(input.amount, 32);
    }
    for (const output of tx.fee_outputs) {
      hashData += hexUtil.intArrayToHex(output.address);
      hashData += hexUtil.bigIntToHexLE(output.amount, 32);
    }
    return hashData;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getTransferHashData(tx: any): string {
    let hashData = '';
    hashData += hexUtil.intArrayToHex(tx.asset_id);
    for (const input of tx.inputs) {
      hashData += hexUtil.intArrayToHex(input.txid);
      hashData += hexUtil.bigIntToHexLE(input.index, 16);
      hashData += hexUtil.intArrayToHex(input.address);
      hashData += hexUtil.bigIntToHexLE(input.amount, 32);
    }
    for (const output of tx.outputs) {
      hashData += hexUtil.intArrayToHex(output.address);
      hashData += hexUtil.bigIntToHexLE(output.amount, 32);
    }
    for (const input of tx.fee_inputs) {
      hashData += hexUtil.intArrayToHex(input.txid);
      hashData += hexUtil.bigIntToHexLE(input.index, 16);
      hashData += hexUtil.intArrayToHex(input.address);
      hashData += hexUtil.bigIntToHexLE(input.amount, 32);
    }
    for (const output of tx.fee_outputs) {
      hashData += hexUtil.intArrayToHex(output.address);
      hashData += hexUtil.bigIntToHexLE(output.amount, 32);
    }
    return hashData;
  }

  static async deploySign(
    account: string,
    chainId: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): Promise<string> {
    const msgParams = {
      domain: {
        // This defines the network, in this case, Mainnet.
        chainId: chainId,
        // Give a user-friendly name to the specific contract you're signing for.
        name: 'Omniverse Transaction',
        // Add a verifying contract to make sure you're establishing contracts with the proper entity.
        verifyingContract: store.serverInfo?.eip712.verifyingContract,
        // This identifies the latest version.
        version: store.serverInfo?.eip712.version,
      },

      // This defines the message you're proposing the user to sign, is dapp-specific, and contains
      // anything you want. There are no required fields. Be as explicit as possible when building out
      // the message schema.
      message: {
        salt: data.metadata.salt,
        name: data.metadata.name,
        deployer: data.metadata.deployer,
        limit: data.metadata.limit,
        price: data.metadata.price,
        total_supply: data.metadata.total_supply,
        fee_inputs: data.fee_inputs,
        fee_outputs: data.fee_outputs,
      },
      // This refers to the keys of the following types object.
      primaryType: 'Deploy',
      types: {
        // This refers to the domain the contract is hosted on.
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Deploy: [
          { name: 'salt', type: 'bytes8' },
          { name: 'name', type: 'string' },
          { name: 'deployer', type: 'bytes32' },
          { name: 'limit', type: 'uint128' },
          { name: 'price', type: 'uint128' },
          { name: 'total_supply', type: 'uint128' },
          { name: 'fee_inputs', type: 'Input[]' },
          { name: 'fee_outputs', type: 'Output[]' },
        ],
        Input: [
          { name: 'txid', type: 'bytes32' },
          { name: 'index', type: 'uint32' },
          { name: 'amount', type: 'uint128' },
          { name: 'address', type: 'bytes32' },
        ],
        Output: [
          { name: 'amount', type: 'uint128' },
          { name: 'address', type: 'bytes32' },
        ],
      },
    };
    const toSign = JSON.stringify(msgParams);
    console.log('toSign:', toSign);
    try {
      const sign = await MetamaskService.ethSignTypedDataV4(account, toSign);
      message.success('sign success');
      return sign;
    } catch (e) {
      console.log('e:', e);
      if (_.get(e, 'code') == -32603) {
        message.error('please change the network: ' + _.get(e, 'message'));
        message.error('please change the network');
      } else if (_.get(e, 'message')) {
        console.log(_.get(e, 'message'));
        message.error(_.get(e, 'message'));
      } else {
        console.log('sign error');
        message.error('sign error');
      }
      throw e;
    }
  }

  static async mintSign(account: string, chainId: number, data: unknown) {
    const msgParams = {
      domain: {
        // This defines the network, in this case, Mainnet.
        chainId: chainId,
        // Give a user-friendly name to the specific contract you're signing for.
        name: 'Omniverse Transaction',
        // Add a verifying contract to make sure you're establishing contracts with the proper entity.
        verifyingContract: store.serverInfo?.eip712.verifyingContract,
        // This identifies the latest version.
        version: store.serverInfo?.eip712.version,
      },

      // This defines the message you're proposing the user to sign, is dapp-specific, and contains
      // anything you want. There are no required fields. Be as explicit as possible when building out
      // the message schema.
      message: data,
      // This refers to the keys of the following types object.
      primaryType: 'Mint',
      types: {
        // This refers to the domain the contract is hosted on.
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Mint: [
          { name: 'asset_id', type: 'bytes32' },
          { name: 'outputs', type: 'Output[]' },
          { name: 'fee_inputs', type: 'Input[]' },
          { name: 'fee_outputs', type: 'Output[]' },
        ],
        Input: [
          { name: 'txid', type: 'bytes32' },
          { name: 'index', type: 'uint32' },
          { name: 'amount', type: 'uint128' },
          { name: 'address', type: 'bytes32' },
        ],
        Output: [
          { name: 'amount', type: 'uint128' },
          { name: 'address', type: 'bytes32' },
        ],
      },
    };
    const toSign = JSON.stringify(msgParams);
    console.log('toSign:', toSign);
    try {
      const sign = await MetamaskService.ethSignTypedDataV4(account, toSign);
      message.success('sign success');
      return sign;
    } catch (e) {
      console.log(e);
      if (_.get(e, 'code') == -32603) {
        message.error('please change the network: ' + _.get(e, 'message'));
      } else if (_.get(e, 'message')) {
        message.error(_.get(e, 'message'));
      } else {
        message.error('sign error');
      }
      throw e;
    }
  }

  static async transferSign(account: string, chainId: number, data: unknown, options?: Options) {
    const msgParams = {
      domain: {
        // This defines the network, in this case, Mainnet.
        chainId: chainId,
        // Give a user-friendly name to the specific contract you're signing for.
        name: 'Omniverse Transaction',
        // Add a verifying contract to make sure you're establishing contracts with the proper entity.
        verifyingContract: store.serverInfo?.eip712.verifyingContract,
        // This identifies the latest version.
        version: store.serverInfo?.eip712.version,
      },

      // This defines the message you're proposing the user to sign, is dapp-specific, and contains
      // anything you want. There are no required fields. Be as explicit as possible when building out
      // the message schema.
      message: data,
      // This refers to the keys of the following types object.
      primaryType: 'Transfer',
      types: {
        // This refers to the domain the contract is hosted on.
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Transfer: [
          { name: 'asset_id', type: 'bytes32' },
          { name: 'inputs', type: 'Input[]' },
          { name: 'outputs', type: 'Output[]' },
          { name: 'fee_inputs', type: 'Input[]' },
          { name: 'fee_outputs', type: 'Output[]' },
        ],
        Input: [
          { name: 'txid', type: 'bytes32' },
          { name: 'index', type: 'uint32' },
          { name: 'amount', type: 'uint128' },
          { name: 'address', type: 'bytes32' },
        ],
        Output: [
          { name: 'amount', type: 'uint128' },
          { name: 'address', type: 'bytes32' },
        ],
      },
    };
    const toSign = JSON.stringify(msgParams);
    const sign = await MetamaskService.ethSignTypedDataV4(account, toSign, options);
    return sign;
    // console.log('toSign:', toSign);
    // try {
    //   const sign = await MetamaskService.ethSignTypedDataV4(account, toSign, options);
    //   //message.success('sign success');
    //   return sign;
    // } catch (e) {
    //   console.log(e);
    //   if (_.get(e, 'code') == -32603) {
    //     message.error('please change the network: ' + _.get(e, 'message'));
    //   } else if (_.get(e, 'message')) {
    //     message.error(_.get(e, 'message'));
    //   } else {
    //     message.error('sign error');
    //   }
    //   throw e;
    // }
  }
}
