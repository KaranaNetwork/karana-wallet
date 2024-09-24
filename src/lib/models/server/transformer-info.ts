export interface TransformerInfo {
  abi: {
    erc20: unknown;
    transformer: unknown;
  };
  fee: {
    convertToOmniverseGas: number;
    convertToLocalGas: number;
    convertToLocalNetworkFee: number;
  };
  list: {
    id: string;
    name: string;
    localToken: string;
    localBalance?: string;
    omniToken: string;
    omniverseBalance?: string;
    transformerContract: string;
    chainName: string;
  }[];
}
