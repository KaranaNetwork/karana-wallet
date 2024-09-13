import _ from 'lodash';
import { reactive } from 'vue';

import hex from '@/lib/utils/hex';
import MetamaskService from '@/lib/services/metamask-service';
import AccountService from '@/lib/services/account-service';
import Account from '@/lib/models/account/account';
import AccountChain from '@/lib/models/account/account-chain';
import Network from '@/lib/models/server/network';
import type { ServerInfo } from '@/lib/models/server/server-info';
import type { TransformerInfo } from '@/lib/models/server/transformer-info';
import type { IWallet } from '@/lib/models/wallet/wallet';

class StoreData {
  serverInfo: ServerInfo | null = null;
  transformerInfo: TransformerInfo | null = null;
  networks: Network[] = [];
  wallets: IWallet[] = [];
  account: Account | null = null;

  public setAccount(account: Account | null) {
    this.account = account;
  }

  public setAccountChainId(chianId: number) {
    const account = this.account;
    if (account) {
      account.chainId = chianId;
      this.account = account;
    }
  }

  currentChainId = 0;
  chains: _.Dictionary<string> = {
    1: 'Ethereum main network (Mainnet)',
    59144: 'Linea Mainnet network',
    5: 'Goerli test network',
    11155111: 'Karana test network',
    59140: 'Linea Goerli test network',
    1337: 'Karana Network',
  };

  public setChain(network: Network) {
    this.chains[network.chainId] = network.chainName;
  }

  public setCurrentChainId(chainId: number) {
    this.currentChainId = chainId;
  }

  public setServerInfo(serverInfo: ServerInfo) {
    this.serverInfo = serverInfo;
  }

  public setTransformerInfo(transformerInfo: TransformerInfo) {
    this.transformerInfo = transformerInfo;
  }

  public setNetworks(networks: Network[]) {
    this.networks = networks;
  }

  public setWallet(wallet: IWallet) {
    let ok = true;
    for (const item of this.wallets) {
      if (item.uuid == wallet.uuid) {
        ok = false;
      }
    }
    if (ok) {
      this.wallets.push(wallet);
    }
  }

  isShowDeploy = false;
  public showDeploy() {
    this.isShowDeploy = true;
  }
  public hideDeploy() {
    this.isShowDeploy = false;
  }

  isShowConnect = false;
  public showConnect() {
    this.isShowConnect = true;
  }
  public hideConnect() {
    this.isShowConnect = false;
  }
  public checkLogin(): boolean {
    if (this.account?.isComplete) {
      return true;
    }
    this.isShowConnect = true;
    return false;
  }
}

const store = reactive(new StoreData());
export default store;
