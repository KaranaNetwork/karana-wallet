export interface ITransaction {
  sequenceId: number;
  assetId: string;
  gasFee: number;
  txId: string;
  txStatus: string;
  txTimestamp: number;
  txType: string;
  value: unknown;
}

export interface ITransfer {
  assetId: string;
  signature: string;
  inputs: Array<IInput>;
  outputs: Array<IOutput>;
  feeInputs: Array<IInput>;
  feeOutputs: Array<IOutput>;
}

export interface IInput {
  txid: string;
  index: string;
  amount: string;
  address: string;
}

export interface IOutput {
  address: string;
  amount: string;
}
