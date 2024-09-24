import Web3 from 'web3';
import store from '@/store/store';

export default class Web3Service {
  static loading = false;
  static metamask: Web3;

  static async discoverWallets() {
    const providers = await Web3.requestEIP6963Providers();
    for (const [key, value] of providers as any) {
      /* Based on your DApp's logic show use list of providers and get selected provider's UUID from user for injecting its EIP6963ProviderDetail.provider EIP1193 object into web3 object */
      if (value.info.name === 'MetaMask') {
        store.setWallet(value.info);
        this.metamask = new Web3(value.provider);
        this.metamask.provider?.on('accountsChanged', (accounts) => {
          console.log('accountsChanged', accounts);
          if (accounts[0] != store.account?.address) {
            store.setAccount(null);
          }
        });
        this.metamask.provider?.on('chainChanged', (chianId) => {
          console.log('chainChanged', chianId);
        });
        this.metamask.provider?.on('disconnect', () => {
          console.log('disconnected');
        });
      }
    }
  }

  static async getMetamask() {
    return this.metamask;
  }
}
