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
    name: string;
    local: string;
    localBalance?: string;
    omniverse: string;
    omniverseBalance?: string;
    transformer: string;
    icon: string;
  }[];
}
