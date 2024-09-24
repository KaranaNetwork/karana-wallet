export default class Config {
  public static readonly name = 'test.omnicoins.net';
  public static readonly apiUrl = '/';
  public static readonly rpcUrl = 'https://server.test.omnicoins.net';
  public static readonly traUrl = 'https://transformer.test.omnicoins.net';
  public static readonly cdnUrl = 'https://omniverse-metadata.s3.amazonaws.com';
  public static readonly traceUrl = 'https://grpc.trace.karana.network/v1/traces';
  public static readonly transformerUrl =
    'https://omniverse-dev.s3.amazonaws.com/config/preview/transformer.json';
  public static readonly networksUrl =
    'https://omniverse-dev.s3.amazonaws.com/config/preview/networks.json';
}
