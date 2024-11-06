import Model from "@/lib/models/model";

export interface IToken {
  amount: string;
  assetId: string;
  deployTime: number;
  name: string;
  progress: number;
  mintAmount: string;
}

export default class Token extends Model {
  id = '';
  tokenName = '';
  assetId = '';
  currentSupply = '';
  totalSupply = '';
  mintAmount = '';
  price = '';
  holderCount = 0;
  status = 0;
  serviceFeeReceiver = '';
}