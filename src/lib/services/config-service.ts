import store from '@/store/store';
import time from '@/lib/utils/time';
import request, { type Options } from '@/lib/request/request';
import { createModels } from '@/lib/models/model';
import Network from '@/lib/models/server/network';
//import type { TransformerInfo } from '@/lib/models/server/transformer-info';
import type { ServerInfo } from '@/lib/models/server/server-info';
import Config from '@/lib/config/config';

export default class ConfigService {
  static async getServerInfo(options?: Options): Promise<ServerInfo> {
    let serverInfo = store.serverInfo;
    if (!serverInfo) {
      const data = await request.rpc('getNetworkParameters', options);
      serverInfo = data as ServerInfo;
      store.setServerInfo(serverInfo);
    }
    return serverInfo;
  }

  // static async getTransformerInfo(options?: Options): Promise<TransformerInfo> {
  //   let transformerInfo = store.transformerInfo;
  //   if (!transformerInfo) {
  //     const resp = await request.fetch(
  //       Config.transformerUrl + '?v=' + time.currentTimestamp(),
  //       options,
  //     );
  //     const data = await resp.json();
  //     transformerInfo = data as TransformerInfo;
  //     store.setTransformerInfo(transformerInfo);
  //   }
  //   return transformerInfo;
  // }

  static async getNetworks(options?: Options) {
    let networks = store.networks;
    if (networks.length == 0) {
      const resp = await request.fetch(
        Config.networksUrl + '?v=' + time.currentTimestamp(),
        options,
      );
      const data = await resp.json();
      networks = createModels(Network, data);
      for (const network of networks) {
        store.setChain(network);
      }
      store.setNetworks(networks);
    }
    return networks;
  }
}
