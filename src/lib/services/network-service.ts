import Config from '@/lib/config/config';

export default class NetworkService {
  public static networkConfig = {
    ArbitrumSepolia: {},
    BITCOIN_LOCAL: {},
  };

  public static getURL(networkType: string, value: string): string {
    let url = '';
    switch (networkType) {
      case 'ArbitrumSepolia':
        url = `https://sepolia.arbiscan.io/tx/${value}`;
        break;
      case 'BITCOIN_LOCAL':
        url = `${Config.bitcoinLocalUrl}/tx/${value}`;
        break;
      case 'ETHEREUM_LOCAL':
        url = `https://moonbase.moonscan.io/tx/${value}`
    }
    return url;
  }
}
