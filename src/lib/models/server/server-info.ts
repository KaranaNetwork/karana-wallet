export interface ServerInfo {
  assets: {
    decimals: number;
    price: string;
  };
  eip712: {
    chainId: number;
    verifyingContract: string;
    version: string;
  };
  fee: {
    amount: string;
    assetId: string;
    receiver: string;
  };
}
