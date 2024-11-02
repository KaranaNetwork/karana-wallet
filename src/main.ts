import '@/assets/css/reset.less';
import '@/assets/css/main.less';

import { createApp } from 'vue';

import App from '@/App.vue';
import router from '@/router';

import trace from '@/lib/utils/trace';
import Config from '@/lib/config/config';
import store from '@/store/store';
import request from '@/lib/request/request';
import ConfigService from '@/lib/services/config-service';
import Web3Service from '@/lib/services/web3-service';
import AccountService from '@/lib/services/account-service';



(function () {
  trace.setupSDK(Config.name, Config.traceUrl);
  ConfigService.getServerInfo();
  ConfigService.getNetworks();
  Web3Service.discoverWallets().then(() => {
    AccountService.getAccount().then((accounts) => {
      if (store.account?.publicKey) {
        request.rpcWithPath('setAddress', 'setAddress', [store.account?.publicKey])
      }
      console.log('accounts:', accounts);
    });
  });
})();

createApp(App).use(router).mount('#app');
