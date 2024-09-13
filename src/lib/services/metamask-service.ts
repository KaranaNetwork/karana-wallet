import _ from 'lodash';
import type { Options } from '@/lib/request/request';
import { message } from 'ant-design-vue';
import hexUtil from '@/lib/utils/hex';
import trace from '@/lib/utils/trace';
import store from '@/store/store';
import Network from '@/lib/models/server/network';
import Web3Service from '@/lib/services/web3-service';

export default class MetamaskService {
  static readonly chains: _.Dictionary<string> = {
    1: 'Ethereum main network (Mainnet)',
    59144: 'Linea Mainnet network',
    5: 'Goerli test network',
    11155111: 'Sepolia test network',
    59140: 'Linea Goerli test network',
    1337: 'Localhost test networks',
  };

  // static async connect(options?: Options): Promise<Account> {
  //   const accounts = await this.requestAccounts(options);
  //   if (!_.isEmpty(accounts)) {
  //     return await store.setAccountByAddress(accounts[0]);
  //   }
  //   throw new Error('account is not exists');
  // }

  // static async login(options?: Options): Promise<Account> {
  //   const accounts = await this.accounts(options);
  //   if (_.isEmpty(accounts)) {
  //     const account = await this.connect(options);
  //     return account;
  //   }
  //   const account = await store.setAccountByAddress(accounts[0]);
  //   return account;
  // }

  static async request(
    data: {
      method: string;
      params?: unknown[] | Record<string, unknown> | undefined;
    },
    options?: Options,
  ) {
    const span = trace.getTracer().startSpan('metamask:' + data.method, undefined, options?.ctx);
    span.setAttribute('account.address', store.account?.address ?? '');
    span.setAttribute('account.publicKey32', store.account?.publicKey32 ?? '');
    span.setAttribute('metamask.method', data.method);
    span.setAttribute('metamask.params', JSON.stringify(data.params));
    try {
      const metamask = await Web3Service.getMetamask();
      if (!metamask) {
        throw new Error('metamask bridge not initalized');
      }
      const resp = await metamask?.provider?.request({
        method: data.method,
        params: data.params,
      });
      return resp;
    } catch (e: any) {
      trace.recordError(span, _.get(e, 'message'));
      span.setAttribute('response.code', _.get(e, 'code', 'none'));
      const isAlert = options?.isAlert ?? true;
      if (isAlert) {
        message.error(_.get(e, 'message'));
      }
      throw e;
    } finally {
      span.end();
    }
  }

  static async accounts(options?: Options) {
    return this.request({ method: 'eth_accounts' }, options) as unknown as string[];
  }

  static async requestAccounts(options?: Options) {
    return this.request(
      {
        method: 'eth_requestAccounts',
        params: [],
      },
      options,
    ) as unknown as string[];
  }

  static async getPermissions(options?: Options) {
    return this.request(
      {
        method: 'wallet_getPermissions',
        params: [],
      },
      options,
    ) as unknown as unknown[];
  }

  static async requestPermissions(options?: Options) {
    return this.request(
      {
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      },
      options,
    );
  }

  static async personalSign(
    message: string,
    address: `0x${string}`,
    options?: Options,
  ): Promise<`0x${string}`> {
    return this.request(
      {
        method: 'personal_sign',
        params: [message, address],
      },
      options,
    ) as unknown as `0x${string}`;
  }

  static async ethSignTypedDataV4(
    account: string,
    data: string,
    options?: Options,
  ): Promise<string> {
    const sign = await this.request(
      {
        method: 'eth_signTypedData_v4',
        params: [hexUtil.padding0x(account), data],
      },
      options,
    );
    return sign as unknown as string;
  }

  static async ethChainId(options?: Options): Promise<number> {
    const chainId = await this.request({ method: 'eth_chainId' }, options);
    store.setCurrentChainId(parseInt(chainId as unknown as string));
    return parseInt(chainId as unknown as string);
  }

  static async switchEthereumChain(chainId: number, options?: Options) {
    await this.request(
      {
        // Or window.ethereum if you don't support EIP-6963.
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexUtil.intToHex(chainId) }],
      },
      options,
    );
  }

  static async addEthereumChain(network: Network, options?: Options) {
    await this.request(
      {
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexUtil.intToHex(+network.chainId),
            chainName: network.chainName,
            rpcUrls: [network.rpc],
            nativeCurrency: {
              name: network.chainName,
              symbol: network.symbol.trim().substring(0, 6),
              decimals: 18,
            },
            blockExplorerUrls: null,
          },
        ],
      },
      options,
    );
  }
}
