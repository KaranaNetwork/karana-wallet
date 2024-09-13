import { ApiPromise, HttpProvider } from '@polkadot/api';

// export const httpProvider = new HttpProvider('http://localhost:9911');
export const httpProvider = new HttpProvider('http://localhost:9933');

export const apiPromise = ApiPromise.create({
  provider: httpProvider,
  noInitWarn: true,
});
