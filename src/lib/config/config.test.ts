export default class Config {
  public static title = 'Karana Testnet';
  public static readonly name = 'test.karana.network';
  public static readonly apiUrl = '/';
  public static readonly rpcUrl = 'https://server.test.karana.network';
  public static readonly traUrl = 'https://transformer.test.karana.network';
  public static readonly cdnUrl = 'https://omniverse-metadata.s3.amazonaws.com';
  public static readonly bitcoinLocalUrl = 'http://explorer.bitcoin.karana.network';
  public static readonly traceUrl = 'https://grpc.trace.karana.network/v1/traces';
  // public static readonly transformerUrl =
  //   'https://omniverse-dev.s3.amazonaws.com/config/v0.3.1/transformer.json';
  public static readonly networksUrl =
    'https://omniverse-dev.s3.amazonaws.com/config/v0.3.1/networks.json';
}
