<template>
  <main-layout>
    <div class="container">
      <template v-if="store.account && store.account.isComplete">
        <div class="account-title">Account</div>
        <div class="account">
          <div class="avatar">
            <img class="avatar-image" src="@/assets/image/coin.webp" />
          </div>
          <div class="info">
            <div class="account-address">
              {{ text.middleEllipsis(store.account.address, 5) }}
              <copy-button :text="store.account.address"></copy-button>
            </div>
            <div class="dollar"></div>
          </div>
        </div>
        <account-address></account-address>
        <a-tabs v-model:activeKey="activeKey" class="tab">
          <a-tab-pane key="assets" tab="Assets">
            <token-grid :is-self="true"></token-grid>
            <div class="want">
              Want to Deploy your own Omniverse Token,
              <a @click="() => {}">click here</a>
            </div>
          </a-tab-pane>
          <a-tab-pane key="activities" tab="Activities" force-render>
            <div class="activity-buttons">
              <a-button
                class="button-dark-outlined"
                :class="activeActivity == 'mint' ? 'active' : ''"
                @click="changeActivity('mint')"
              >
                Mint
              </a-button>
              <a-button
                class="button-dark-outlined"
                :class="activeActivity == 'deploy' ? 'active' : ''"
                @click="changeActivity('deploy')"
              >
                Deploy
              </a-button>
              <a-button
                class="button-dark-outlined"
                :class="activeActivity == 'transform' ? 'active' : ''"
                @click="changeActivity('transform')"
              >
                Transform
              </a-button>
              <a-button
                class="button-dark-outlined"
                :class="activeActivity == 'send' ? 'active' : ''"
                @click="changeActivity('send')"
              >
                Send
              </a-button>
            </div>
          </a-tab-pane>
        </a-tabs>

        <div class="body">
          <div class="name" style="margin-bottom: 10px">My Tokens</div>
          <tokens-view v-if="store.account" :is-self="true"></tokens-view>
          <div style="margin-top: 10px">
            <a-button class="button-default" @click="showAll">show all</a-button>
          </div>
          <div class="name" style="margin-bottom: 10px">Activities</div>
          <a-card class="transaction">
            <transaction-table :transactions="transactions"></transaction-table>
            <a-empty v-if="transactions.length == 0 && !loading" />
            <a-spin v-if="loading"></a-spin>
            <br />
            <a-pagination
              v-model:current="page"
              v-model:page-size="pageSize"
              :total="total"
              :show-total="(total: number) => `Total: ${total}`"
              @change="changePage"
              :show-size-changer="false"
              show-less-items
            />
          </a-card>
        </div>
      </template>
      <template v-else>
        <div style="display: flex; justify-content: center; align-items: end">
          <a-button class="button-blue" @click="store.showConnect()">Connect Wallet</a-button>
        </div>
      </template>
    </div>
  </main-layout>
</template>
<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import TokenGrid from '@/components/token/TokenGrid.vue';
import TokensView from '@/components/token/TokensView.vue';
import AccountAddress from '@/components/account/AccountAddress.vue';
import TransactionTable from '@/components/transaction/TransactionTable.vue';
import CopyButton from '@/components/media/CopyButton.vue';

import { ref, onMounted, watch } from 'vue';
import store from '@/store/store';
import router from '@/router';
import text from '@/lib/utils/text';
import request from '@/lib/request/request';
import type { ITransaction } from '@/lib/models/transaction/transaction';

const information = ref({
  blockHash: [],
  blockHeight: 0,
  midGasPrice: 0,
  latestBatchId: 0,
  tokenTypeNumber: 0,
  totalTransactionNumber: 0,
});

const activeKey = ref('assets');
const activeActivity = ref('mint');

const page = ref(1);
const pageSize = ref(25);
const total = ref(0);
const loading = ref(false);
const transactions = ref<ITransaction[]>([]);

watch(
  () => store.account,
  (to, from) => {
    if (from == null && to != null) {
      changePage(1);
    }
  },
);

onMounted(async () => {
  information.value = await request.rpc('getLatestInformation');
  if (store.account?.publicKey32) {
    await changePage(1);
  }
});

const changeActivity = function (key: string) {
  activeActivity.value = key;
};

const changePage = async function (nextPage: number, nextPageSize: number = 10) {
  if (loading.value) {
    return;
  }
  console.log('loading: ', loading.value);
  try {
    loading.value = true;
    const { data, totalNumber, numberPerPage } = await request.rpc('getLatestUserTransactions', [
      store.account?.publicKey32,
      nextPage,
    ]);
    page.value = nextPage;
    pageSize.value = numberPerPage;
    console.log('data: ', data);
    transactions.value = data;
    total.value = totalNumber;
  } finally {
    loading.value = false;
  }
  console.log('loading: ', loading.value);
};
const showAll = function () {
  router.push('/tokens');
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.container {
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  text-align: left;
  .account-title {
    color: @primaryColor;
    font-weight: bold;
    font-size: 16px;
    text-align: left;
  }
  .account {
    display: flex;
    gap: 20px;
    align-items: center;
    .avatar {
      .avatar-image {
        height: 50px;
        width: 50px;
        border-radius: 25px;
      }
    }
    .info {
      .account-address {
        font-size: 16px;
      }
      .dollar {
        line-height: 25px;
        font-size: 25px;
        height: 25px;
      }
    }
  }

  .tab:deep(.ant-tabs-tab) {
    font-size: 25px;
    font-weight: bold;
  }

  .tab {
    .want {
      font-size: 20px;
      a {
        text-decoration: underline;
      }
    }
    .activity-buttons {
      display: flex;
      gap: 20px;
      .button-dark-outlined {
        width: 120px;
        font-weight: normal;
      }
      .active {
        color: @primaryColor;
        border-color: @primaryColor;
      }
    }
  }

  .body {
    display: flex;
    flex-direction: column;
    .name {
      display: flex;
      color: @primaryColor;
      font-weight: bold;
      font-size: 16px;
    }
    .cards {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      .card-body {
        display: flex;
        justify-content: space-around;
        white-space: pre-wrap;
        .amount {
          height: 100px;
          width: 100px;
          border: 10px solid purple;
          border-radius: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .label {
          display: flex;
          align-items: center;
          width: 120px;
          font-weight: bold;
        }
      }
    }
    .show-all-button {
      border: none;
      color: white;
      border-radius: 50px;
      width: 150px;
      background: linear-gradient(to bottom, #fb769c, #7758bb);
    }
    .account-info {
      font-size: 16px;
      font-weight: bold;
      color: #858585;
      display: flex;
      align-items: center;
      text-align: left;
      gap: 20px;
      .copy-button {
        border: none;
        color: white;
        border-radius: 50px;
        width: 150px;
        background: linear-gradient(to bottom, #fb769c, #7758bb);
      }
    }
    .transaction {
      background-color: @secondaryBackgroundColor;
      border: none;
      .direction {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 10px;
      }
    }
  }
}
</style>
