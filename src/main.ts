import '@/assets/css/reset.less';
import '@/assets/css/main.less';

import { createApp } from 'vue';

import App from '@/App.vue';
import router from '@/router';

import trace from '@/lib/utils/trace';
import ConfigService from '@/lib/services/config-service';
import Config from '@/lib/config/config';
import Web3Service from '@/lib/services/web3-service';
import AccountService from './lib/services/account-service';

(function () {
  trace.setupSDK(Config.name, Config.traceUrl);
  ConfigService.getServerInfo();
  ConfigService.getTransformerInfo();
  ConfigService.getNetworks();
  Web3Service.discoverWallets().then(() => {
    AccountService.getAccount().then((accounts) => {
      console.log('accounts:', accounts);
    });
  });
})();

createApp(App).use(router).mount('#app');
