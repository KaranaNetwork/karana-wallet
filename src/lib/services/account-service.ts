import Account from '@/lib/models/account/account';
import type { TransformerAsset } from '@/lib/models/server/transformer-info';
import type { Options } from '@/lib/request/request';
import MetamaskService from '@/lib/services/metamask-service';
import { getBitcoinAddressFromPubKey, getPolkadotAddressFromPubKey } from '@/lib/utils/crypto';
import time from '@/lib/utils/time';
import store from '@/store/store';
import { extractPublicKey } from '@metamask/eth-sig-util';
import { message } from 'ant-design-vue';
import _ from 'lodash';
import type Network from '../models/server/network';

export default class AccountService {
  static isAccountLoading = false;

  static chainNames = {
    substrate: 'substrate',
    bitcion: 'bitcoin',
  };

  static connect() {
    if (!store.account?.isComplete) {
      store.showConnect();
    }
  }

  static async switchNetwork(network: Network, options?: Options) {
    try {
      await MetamaskService.switchEthereumChain(+network.chainId, {
        ...options,
        isAlert: false,
        ignoreTraceError: true,
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code == 4902) {
        try {
          await MetamaskService.addEthereumChain(network, { ...options, isAlert: false });
        } catch (addError: any) {
          if (addError.code != 4902) {
            message.error(switchError.message);
            throw addError;
          }
        }
      } else {
        message.error(switchError.message);
        throw switchError;
      }
    }
    if (store.account) {
      store.account.chainId = +network.chainId;
    }
  }

  static async watchAsset(asset: TransformerAsset, options?: Options) {
    await MetamaskService.watchAsset(
      {
        type: 'ERC20',
        options: {
          address: asset.localToken,
          symbol: asset.name,
          decimals: store.serverInfo?.assets.decimals ?? 12,
          image: '',
        },
      },
      options,
    );
  }

  static async getAccount(options?: Options) {
    while (this.isAccountLoading) {
      await time.sleep(100);
    }
    if (!store.account) {
      try {
        this.isAccountLoading = true;
        const accounts = await MetamaskService.accounts(options);
        if (accounts && accounts.length > 0) {
          const accountAddress = accounts[0];
          const account = this.getLoginAccountData(accountAddress);
          if (account && account.isComplete) {
            store.setAccount(account);
          }
        }
      } finally {
        this.isAccountLoading = false;
      }
    }
    return store.account;
  }

  // static async login(options?: Options): Promise<Account> {
  //   while (this.isAccountLoading) {
  //     await time.sleep(100);
  //   }
  //   try {
  //     this.isAccountLoading = true;
  //     const account = await MetamaskService.login(options);

  //     return account;
  //   } finally {
  //     this.isAccountLoading = false;
  //     console.log('account-service: login');
  //   }
  // }

  static logout() {
    localStorage.removeItem('loginAccount');
    localStorage.removeItem('account:data:' + store.account?.address);
    store.setAccount(null);
  }

  static setLoginAccountData(account: Account) {
    localStorage.setItem('account:data:' + account.address, JSON.stringify(account));
    if (account.isComplete) {
      store.setAccount(account);
    }
  }

  static getLoginAccountData(accountAddress: string) {
    const s = localStorage.getItem('account:data:' + accountAddress);
    if (s) {
      try {
        const data = JSON.parse(s);
        const account = new Account();
        account.address = _.get(data, 'address', '');
        account.chainId = _.get(data, 'chainId', 0);
        account.chains = _.get(data, 'chains', []);
        account.publicKey = _.get(data, 'publicKey', '');
        account.hasPermission = _.get(data, 'hasPermission', false);
        store.setAccount(account);
        return account;
      } catch {
        console.log('parse error');
      }
    }
    return null;
  }

  static setLoginAccountAddress(accountAddress: string) {
    localStorage.setItem('loginAccount', accountAddress);
  }

  static getLoginAccountAddress() {
    return localStorage.getItem('loginAccount');
  }

  static async getCurrentPublicKey(): Promise<string | undefined> {
    return store.account?.publicKey;
  }

  static async getCurrentPublicKey32(): Promise<string | undefined> {
    return store.account?.publicKey32;
  }

  // static async getPublicKey(accountAddress: `0x${string}`, options?: Options): Promise<string> {
  //   const key = 'account:publickey:' + accountAddress;
  //   let publicKey = localStorage.getItem(key);
  //   if (publicKey != '' && publicKey != null) {
  //     return publicKey;
  //   }
  //   console.log('getPublicKeyWithoutCache:params:', accountAddress);
  //   publicKey = await AccountService.getPublicKeyWithoutCache(accountAddress, options);
  //   console.log('after getPublicKeyWithoutCache:publicKey:', publicKey);
  //   localStorage.setItem(key, publicKey);
  //   return publicKey;
  // }

  static async getPublicKeyWithoutCache(
    accountAddress: `0x${string}`,
    options?: Options,
  ): Promise<string> {
    const message = 'Get public key';
    console.log('personalSign:params:', message, accountAddress);
    const signature = await MetamaskService.personalSign(message, accountAddress, options);
    console.log('after personalSign:sign:', signature);
    const publicKey = extractPublicKey({
      data: message,
      signature,
    }) as `0x${string}`;
    return publicKey;
  }

  static getPolkadotAddress(accountPublicKey: string): string {
    return getPolkadotAddressFromPubKey(accountPublicKey);
  }

  static getBitcoinAddress(accountPublicKey: string): string {
    return getBitcoinAddressFromPubKey(accountPublicKey);
  }

  static getCurrentChainId() {
    return store.currentChainId;
  }

  static getCurrentNetwork(): string {
    return store.chains[store.currentChainId] ?? 'Unknown Network';
  }

  static checkNetwrok(): boolean {
    if ([1, 11155111].indexOf(store.currentChainId) < 0) {
      return false;
    }
    return true;
  }

  static checkNetwrokOrAlert(): boolean {
    if (!this.checkNetwrok()) {
      message.error(
        `only support ${MetamaskService.chains[1]} and ${
          MetamaskService.chains[11155111]
        }, but current network is, ${
          MetamaskService.chains[store.currentChainId]
        }, please change the network`,
      );
      return false;
    }
    return true;
  }
}
