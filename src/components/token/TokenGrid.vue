<template>
  <div class="token-grid">
    <div class="title">
      <h2>Token List</h2>
      <div class="paginate">
        <div class="count">{{ page }} / {{ total }}</div>
        <div class="actions">
          <div class="action">
            <LeftOutlined />
          </div>
          <div class="action">
            <RightOutlined />
          </div>
        </div>
      </div>
    </div>
    <div class="data">
      <div v-for="(item, i) in _.chunk(list, 4)" :key="i" class="row">
        <div v-for="(token, j) in item" :key="j" class="col col-data" @click="openToken(token)">
          <div>{{ token.name }}</div>
          <div>{{ BalanceService.humanLize(token.amount) }}</div>
        </div>
        <template v-if="item.length < 4">
          <div v-for="k of 4 - item.length" :key="k" class="col empty"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';

import _ from 'lodash';
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import request from '@/lib/request/request';
import store from '@/store/store';
import time from '@/lib/utils/time';
import decimal from '@/lib/utils/decimal';
import AccountService from '@/lib/services/account-service';
import TransactionService from '@/lib/services/transaction-service';
import ConfigService from '@/lib/services/config-service';
import MetamaskService from '@/lib/services/metamask-service';
import BalanceService from '@/lib/services/balance-service';
import type { IToken } from '@/lib/models/token/token';
import type { IOutput } from '@/lib/models/token/output';

import router from '@/router';

const props = defineProps({
  isSelf: { type: Boolean, default: false },
  limit: { type: Number, default: 0 },
});

const loading = ref(false);
const buttonLoading = ref(false);
const page = ref(1);
const pageSize = ref(25);
const total = ref(0);
const list = ref<IToken[]>([]);
const mainToken = ref<IToken>();
const deployModalRef = ref();

const transferOpen = ref(false);
const mintOpen = ref(false);
const currentToken = ref<IToken | undefined>();
const outputs = ref<IOutput[]>([
  {
    amount: '',
    address: '',
  },
]);

onMounted(async () => {
  await current();
});

let lastCurrentPublicKey: string | undefined;
watch(store, async (to) => {
  if (to.account) {
    if (lastCurrentPublicKey !== to.account?.publicKey) {
      lastCurrentPublicKey = to.account?.publicKey;
      if (props.isSelf) {
        if (to.account?.publicKey != '') {
          list.value = await request.rpc('getAccountInfo', [to.account?.publicKey32]);
          list.value.forEach((item) => {
            if (item.assetId.replace('0', '') == 'x') {
              mainToken.value = item;
            }
          });
        }
      }
    }
  }
});

const isTokenMinted = function (token: IToken): boolean {
  return token.progress >= 10000;
};

const current = async function () {
  if (!props.isSelf) {
    try {
      loading.value = true;
      const { data, totalNumber, numberPerPage } = await request.rpc('getTokenList', [page.value]);
      list.value = data;
      total.value = totalNumber;
      pageSize.value = numberPerPage;
      list.value.forEach((item) => {
        if (item.assetId.replace('0', '') == 'x') {
          mainToken.value = item;
        }
      });
      if (props.limit > 0) {
        list.value = list.value.slice(0, props.limit);
      }
    } finally {
      loading.value = false;
    }
  } else {
    list.value = await request.rpc('getAccountInfo', [store.account?.publicKey32]);
    list.value.forEach((item) => {
      if (item.assetId.replace('0', '') == 'x') {
        mainToken.value = item;
      }
    });
  }
};

const changePage = async function (nextPage: number, nextPageSize: number) {
  if (loading.value) {
    return;
  }
  try {
    loading.value = true;
    const { data, totalNumber, numberPerPage } = await request.rpc('getTokenList', [nextPage]);
    list.value = data;
    page.value = nextPage;
    pageSize.value = numberPerPage;
    total.value = totalNumber;
  } finally {
    loading.value = false;
  }
  console.log(nextPageSize);
};

const transferClick = function (token: IToken) {
  if (!store.checkLogin()) {
    return;
  }
  transferOpen.value = true;
  currentToken.value = token;
  outputs.value = [
    {
      amount: '',
      address: '',
    },
  ];
};

const insertOutput = function () {
  outputs.value.push({
    amount: '',
    address: '',
  });
};

const deleteOutput = function (i: number) {
  outputs.value.splice(i, 1);
};

const transfer = async function (token: IToken) {
  if (!store.checkLogin()) {
    return;
  }
  if (buttonLoading.value) {
    return;
  }
  for (const i in outputs.value) {
    const output = outputs.value[i];
    if (
      !(
        output.address.startsWith('0x') &&
        output.address.length == store.account?.publicKey32.length
      )
    ) {
      message.error('address must be a valid account public key');
      return;
    }
    if (!decimal.isValidDecimal(output.amount)) {
      message.error('amount must be a number');
      return;
    }
  }

  try {
    buttonLoading.value = true;
    const chainId = (await ConfigService.getServerInfo()).eip712.chainId;
    const currentChainId = await MetamaskService.ethChainId();
    if (currentChainId != chainId) {
      try {
        await MetamaskService.switchEthereumChain(chainId);
      } catch (e) {
        message.error(_.get(e, 'message'));
      }
    }
    await TransactionService.transfer({
      account: store.account?.address ?? '',
      chainId: chainId,
      publicKey32: store.account?.publicKey32 ?? '',
      assetId: token.assetId,
      outputs: outputs.value.map((item) => {
        return {
          address: item.address,
          amount: BalanceService.withoutAccuracy(item.amount),
        };
      }),
    });
  } finally {
    buttonLoading.value = false;
  }

  message.success('transfer success');
  transferOpen.value = false;
  await time.sleep(2000);
  await current();
};

const openDeploy = async function () {
  if (!store.checkLogin()) {
    return;
  }
  const networks = await ConfigService.getNetworks();
  AccountService.switchNetwork(networks[0]);
  deployModalRef.value.changeType('deploy');
  mintOpen.value = true;
};
const openMint = async function (token: IToken) {
  AccountService.connect();
  const networks = await ConfigService.getNetworks();
  AccountService.switchNetwork(networks[0]);
  deployModalRef.value.changeType('mint');
  deployModalRef.value.changeToken(token);
  mintOpen.value = true;
};

const openToken = function (token: IToken) {
  router.push({
    name: 'token_info',
    query: { id: token.assetId },
  });
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.token-grid {
  text-align: left;
  background-color: @secondaryBackgroundColor;
  padding: 20px;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h2 {
      margin: 0;
      font-size: 20px;
    }
    .paginate {
      display: flex;
      align-items: center;
      gap: 10px;
      .actions {
        display: flex;
        align-items: center;
        gap: 5px;
        .action {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 30px;
          width: 40px;
          background-color: @primaryBackgroundColor;
          border-radius: 10px;
        }
        .action:hover {
          background-color: black;
        }
      }
    }
  }
  .data {
    .row {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      gap: 30px;
      .col {
        width: 0;
        flex-grow: 1;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
        font-weight: bold;
        padding: 20px;
        height: 80px;
        background-color: @primaryBackgroundColor;
        border-radius: 10px;
      }
      .col-data:hover {
        background-color: black;
      }
    }
  }
}
</style>
