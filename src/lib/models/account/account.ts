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
}
