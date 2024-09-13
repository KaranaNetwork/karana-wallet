import hex from '@/lib/utils/hex';
import AccountChain from '@/lib/models/account/account-chain';

export default class Account {
  address = '';
  publicKey = '';
  chainId = 0;
  hasPermission = false;
  chains: _.Dictionary<AccountChain> = {};

  get publicKey32() {
    return hex.padding0x(this.publicKey).substring(0, 66);
  }

  get step() {
    if (this.address != '') {
      if (this.publicKey != '') {
        if (this.hasPermission) {
          return 3;
        }
        return 2;
      }
      return 1;
    }
    return 0;
  }

  get isComplete() {
    return this.step >= 3;
  }
}
