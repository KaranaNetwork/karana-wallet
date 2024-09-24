<template>
  <main-layout>
    <div class="container">
      <template v-if="store.account && store.account.isComplete">
        <account-nav> </account-nav>
        <div class="account-title">Omniverse Account</div>
        <account-address></account-address>
        <div class="chains">
          <div class="chains-table">
            <div class="chains-row">
              <div class="header title-name">Chain Name</div>
              <div class="header title-address">Local Address</div>
            </div>
            <div v-if="store.account" class="chains-row chains-row-data">
              <div class="cell chain-name">
                {{ store.account?.chains[AccountService.chainNames.substrate]?.name }}
              </div>
              <div class="cell chain-address">
                <a-tooltip>
                  <template #title>
                    {{ store.account?.chains[AccountService.chainNames.substrate]?.address ?? '' }}
                  </template>
                  {{
                    text.middleEllipsis(
                      store.account?.chains[AccountService.chainNames.substrate]?.address ?? '',
                    )
                  }}
                </a-tooltip>
                <copy-button
                  :text="store.account?.chains[AccountService.chainNames.substrate]?.address ?? ''"
                ></copy-button>
              </div>
            </div>
            <div class="chains-row chains-row-data">
              <div class="cell chain-name">
                {{ store.account?.chains[AccountService.chainNames.bitcion]?.name }}
              </div>
              <div class="cell chain-address">
                <a-tooltip>
                  <template #title>
                    {{ store.account?.chains[AccountService.chainNames.bitcion]?.address ?? '' }}
                  </template>
                  {{
                    text.middleEllipsis(
                      store.account?.chains[AccountService.chainNames.bitcion]?.address ?? '',
                    )
                  }}
                </a-tooltip>
                <copy-button
                  :text="store.account?.chains[AccountService.chainNames.bitcion]?.address ?? ''"
                ></copy-button>
              </div>
            </div>
            <div class="chains-row chains-row-data">
              <div class="cell chain-name">Eth</div>
              <div class="cell chain-address">
                <a-tooltip>
                  <template #title>
                    {{ store.account?.address }}
                  </template>
                  {{ text.middleEllipsis(store.account?.address ?? '') }}
                </a-tooltip>
                <copy-button :text="store.account?.address ?? ''"></copy-button>
              </div>
            </div>
          </div>
        </div>
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
import TokensView from '@/components/token/TokensView.vue';
import TransactionTable from '@/components/transaction/TransactionTable.vue';
import CopyButton from '@/components/media/CopyButton.vue';

import { ref, onMounted, watch } from 'vue';
import store from '@/store/store';
import router from '@/router';
import text from '@/lib/utils/text';
import AccountService from '@/lib/services/account-service';
import request from '@/lib/request/request';
import type { ITransaction } from '@/lib/models/transaction/transaction';

const information = ref({
  blockHash: [],
  blockHeight: 0,
  midGasPrice: 0,
  tokenTypeNumber: 0,
  totalTransactionNumber: 0,
});

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
.container {
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  .account-title {
    color: #ff7700;
    font-weight: bold;
    font-size: 16px;
    text-align: left;
  }
  .chains {
    display: flex;
    .chains-table {
      flex-grow: 1;
      display: flex;
      gap: 10px;
      flex-direction: column;
      align-items: stretch;
      .chains-row {
        flex-grow: 1;
        display: flex;
        gap: 50px;

        align-items: center;
        .header {
          font-weight: bold;
        }
        .title-name,
        .chain-name {
          width: 400px;
          text-align: left;
          padding-left: 300px;
        }
        .title-address,
        .chain-address {
          text-align: left;
          flex-grow: 1;
        }
      }
      .chains-row-data {
        height: 50px;
        background: #25272c;
        border-radius: 25px;
        //border: 1px solid whitesmoke;

        .chain-name {
          font-size: 12;
          color: #858585;
        }
        .chain-address {
          color: #78c9b3;
          font-weight: bold;
          font-family: 'Courier New';
        }
      }
    }
  }
  .body {
    display: flex;
    flex-direction: column;
    .name {
      display: flex;
      color: #ff7700;
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
      background-color: #25272c;
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
