import { encodeAddress, blake2AsU8a } from '@polkadot/util-crypto';
import * as tinysecp from 'tiny-secp256k1';
import { Buffer } from 'buffer';
import { payments, networks, initEccLib } from 'bitcoinjs-lib';
initEccLib(tinysecp);

// eslint-disable-next-line arrow-body-style
// export const personalSign = async (
//   message: string,
//   address: `0x${string}`,
// ): Promise<`0x${string}`> => {
//   return window.ethereum?.request({
//     method: 'personal_sign',
//     params: [message, address],
//   }) as unknown as `0x${string}`;
// };

export const getPolkadotAddressFromPubKey = (publicKey: string) => {
  let compressed = publicKey;

  if (publicKey.substring(0, 2) === '0x') {
    compressed = publicKey.substring(2);
  }

  if (compressed.length === 130) {
    compressed = compressed.substring(2);
  }

  if (compressed.length === 128) {
    const y = `0x${compressed.substring(64)}`;
    const oneN = BigInt(1);
    // eslint-disable-next-line no-bitwise
    const flag = BigInt(y) & oneN ? '03' : '02';
    compressed = flag + compressed.substring(0, 64);
  }

  if (compressed.length === 66) {
    return encodeAddress(blake2AsU8a(`0x${compressed}`, 256));
  }
  // eslint-disable-next-line max-len
  throw new Error(
    `Public Key needs to be hex string with length: 66(no 0x), 68(with 0x), 128(no 0x), 130, 132(with 0x), but got ${publicKey.length}`,
  );
};

export const getBitcoinAddressFromPubKey = (publicKey: string) => {
  let pk = '';
  if (publicKey.substr(0, 2) === '0x') {
    pk = publicKey.substr(2);
  }
  const script_p2tr = payments.p2tr({
    internalPubkey: Buffer.from(pk, 'hex').subarray(0, 32),
    network: networks.bitcoin,
  });
  const address = script_p2tr.address ?? '';
  return address;
};
