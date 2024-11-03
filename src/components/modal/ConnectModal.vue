<template>
  <a-modal v-model:open="open" with="800" :footer="null" :mask-closable="false" :z-index="10000">
    <h1>Connect your wallet</h1>
    <div class="connect-body">
      <div class="discovered-wallets">
        <h3 class="title">Discovered wallets:</h3>
        <div class="wallets">
          <div
            class="wallet"
            v-for="(wallet, i) in store.wallets"
            :key="i"
            @click="connectWallet(wallet)"
          >
            <a-spin v-if="loading" size="large" />
            <img v-else style="width: 50px; height: 50px" :src="wallet.icon" />
            <div>{{ wallet.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <a-modal v-model:open="openStep" :footer="null" :mask-closable="false">
      <h1>Connect your wallet</h1>
      <div class="step-body">
        <div class="step">
          <div class="icon">
            <template v-if="!loading || step > 1">
              <RightCircleOutlined class="icon-current" v-if="step == 1" />
              <CheckCircleOutlined class="icon-success" v-else-if="step > 1" />
            </template>
            <template v-else-if="step == 1">
              <a-spin size="large" />
            </template>
          </div>
          <div class="info">
            <h2 class="title">Authenticate your wallet</h2>
            <div class="description">
              Verify ownership of your wallet to get public key for our platform.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="icon">
            <template v-if="!loading || step > 2">
              <RightCircleOutlined class="icon-current" v-if="step == 2" />
              <CheckCircleOutlined class="icon-success" v-else-if="step > 2" />
            </template>
            <template v-else-if="step == 2">
              <a-spin size="large" />
            </template>
          </div>
          <div class="info">
            <h2 class="title">Request permissions</h2>
            <div class="description">Request permissions of metamask.</div>
          </div>
        </div>
        <a-button v-if="step == 1" class="button-blue" @click="login(1)" :loading="loading">
          Authenticate your wallet
        </a-button>
        <a-button
          v-else-if="step == 2"
          class="button-blue"
          @click="login(2)"
          :loading="loading"
        >
          Request Permissions
        </a-button>
        <a-button v-if="step == 3" class="button-blue" @click="closeStep">
          Connection successful
        </a-button>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CheckCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
import store from '@/store/store';
import AccountService from '@/lib/services/account-service';
import MetamaskService from '@/lib/services/metamask-service';
import Account from '@/lib/models/account/account';
import AccountChain from '@/lib/models/account/account-chain';
import type { IWallet } from '@/lib/models/wallet/wallet';
import trace from '@/lib/utils/trace';

const open = defineModel('open', { default: false });
const openStep = ref(false);
const loading = ref(false);
const account = ref<Account>(new Account());
const address = ref<string>('');

let localAccount: Account | null;

const step = computed(() => {
  let step = 1;
  if (account.value.address != '' && account.value.publicKey != '') {
    step = 2;
  }
  if (account.value.address != '' && account.value.publicKey != '' && account.value.hasPermission) {
    step = 3;
  }
  return step;
});

const connectWallet = async function (wallet: IWallet) {
  if (loading.value) {
    return;
  }
  const span = trace.startSpan('login:connect');
  const ctx = trace.contextFromParent(span);
  try {
    loading.value = true;
    switch (wallet.name) {
      case 'MetaMask':
        {
          const accounts = await MetamaskService.requestAccounts({ ctx: ctx });
          address.value = accounts[0];
          if (AccountService.getLoginAccountAddress() != address.value) {
            AccountService.setLoginAccountAddress(address.value);
          }
          localAccount = AccountService.getLoginAccountData(address.value);
          if (localAccount) {
            const permissions = await MetamaskService.getPermissions({ ctx: ctx });
            localAccount.hasPermission = permissions.length > 0 ? true : false;
            account.value = localAccount;
          }
          open.value = false;
          openStep.value = true;
        }
        break;
    }
  } finally {
    span.end();
    loading.value = false;
  }
};

const login = async function (step: number = 1) {
  if (step < 2) {
    await authenticate();
  }
  if (step < 3) {
    await requestPermissions();
  }
  AccountService.setLoginAccountData(account.value);
};

const authenticate = async function () {
  const span = trace.startSpan('login:authenticate');
  if (!localAccount) {
    account.value = new Account();
    account.value.address = address.value;
  }
  span.setAttribute('account.address', address.value);
  try {
    loading.value = true;
    const publicKey = await AccountService.getPublicKeyWithoutCache(
      address.value as `0x${string}`,
      {
        ctx: trace.contextFromParent(span),
      },
    );
    account.value.publicKey = publicKey;
    account.value.chains[AccountService.chainNames.substrate] = new AccountChain(
      AccountService.chainNames.substrate,
      AccountService.getPolkadotAddress(account.value.publicKey),
    );
    account.value.chains[AccountService.chainNames.bitcion] = new AccountChain(
      AccountService.chainNames.bitcion,
      AccountService.getBitcoinAddress(account.value.publicKey),
    );
  } finally {
    loading.value = false;
    span.end();
  }
};

const requestPermissions = async function () {
  const span = trace.startSpan('login:requestPermissions');
  span.setAttribute('account.address', account.value.address);
  try {
    loading.value = true;
    await MetamaskService.requestPermissions({ ctx: trace.contextFromParent(span) });
    account.value.hasPermission = true;
    console.log('step:', step.value);
  } finally {
    loading.value = false;
    span.end();
  }
};

const closeStep = function () {
  openStep.value = false;
};
</script>

<style lang="less" scoped>
.connect-body {
  .discovered-wallets {
    .wallets {
      display: flex;
      gap: 10px;
      .wallet {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 114px;
        height: 114px;
        border: 1px solid gray;
        border-radius: 10px;
      }
    }
  }
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 30px;
  .step {
    display: flex;
    gap: 10px;
    .icon {
      width: 50px;
      height: 50px;
      font-size: 45px;
      .icon-success {
        color: lightgreen;
      }
    }
    .info {
      align-items: center;
      gap: 10px;
    }
  }
}
</style>
