export interface Batch {
  batchId: number;
  blockHeightEnd: number;
  blockHeightStart: number;
  txSidEnd: number;
  txSidStart: number;
  l1Tx: string[][];
}
