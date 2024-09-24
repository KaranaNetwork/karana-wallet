import Model from '@/lib/models/model';

export enum TransformingState {
  Pending = 0,
  Claimable = 1,
  Settled = 2,
}

export enum TransformingDirection {
  LocalToOmniverse = 0,
  OmniverseToLocal = 1,
}

export default class TransformRecord extends Model {
  id: string = '';
  transformerId: string = '';
  txBegin: string = '';
  blockBegin: number = 0;
  amount: string = '';
  chainName: string = '';
  ethAccount: string = '';
  table: string = '';
  timestampBegin: number = 0;
  state: TransformingState = 0;
  direction: TransformingDirection = 0;
}
