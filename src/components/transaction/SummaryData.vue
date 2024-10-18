<template>
  <div class="data">
    <div class="data-left">
      <div class="card" @click="router.push('/explorer/blocks')">
        <div class="left"></div>
        <div class="center">
          <div class="label">LATEST BLOCK</div>
          <div class="amount">{{ information.blockHeight }}</div>
        </div>
        <div class="right">
          <div class="label">LATEST BATCH</div>
          <div class="amount">{{ information.latestBatchId }}</div>
        </div>
      </div>
      <div class="title">Latest Blocks</div>
      <div
        class="block-row"
        v-for="(block, i) in blocks"
        :key="i"
        @click="
          router.push({
            path: '/explorer/block',
            query: { blockHeight: block.blockHeight },
          })
        "
      >
        <div class="block-row-1">
          <div class="hash">
            {{ block.blockHash }}
          </div>
          <div class="time">
            {{ timeUtil.iso(block.blockTimeStamp * 1000) }}
          </div>
        </div>
        <div class="block-row-2">
          <div class="data-cell">{{ block.txNumber }} transactions</div>
        </div>
      </div>
      <div v-if="loadingBlocks" style="text-align: center">
        <a-spin></a-spin>
      </div>
      <br />
      <div style="text-align: center">
        <a-button class="button-default" @click="openBlocks">More Blocks</a-button>
      </div>
    </div>
    <div class="data-right">
      <div class="card" @click="router.push('/explorer/transactions')">
        <div class="left"></div>
        <div class="center">
          <div class="label">TRANSACTIONS</div>
          <div class="amount">
            {{ information.totalTransactionNumber }}
          </div>
        </div>
        <div class="right">
          <div class="label">MED GAS PRICE</div>
          <div class="amount">{{ BalanceService.humanLize(information.midGasPrice) }}</div>
        </div>
      </div>

      <div class="title">Latest Transactions</div>
      <div
        class="transaction-row"
        v-for="(transaction, i) in transactions"
        :key="i"
        @click="
          router.push({
            path: '/explorer/transaction',
            query: { txId: transaction.txId },
          })
        "
      >
        <div class="transaction-row-1">
          <div class="title">Tx#</div>
          <div class="tx-id">
            {{ transaction.txId }}
          </div>
        </div>
        <div class="transaction-row-2">
          <div class="from">
            <div class="title">TxType</div>
            <div class="from-data">
              {{ transaction.txType }}
            </div>
          </div>
          <div class="block">
            <div class="title">Block:</div>
            <div
              class="block-data"
              @click.stop="
                router.push({
                  path: '/explorer/block',
                  query: { blockHeight: transaction.blockHeight },
                })
              "
            >
              {{ transaction.blockHeight }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="loadingTransactions" style="text-align: center">
        <a-spin></a-spin>
      </div>
      <br />
      <div style="text-align: center">
        <a-button class="button-default" @click="openTransactions">More Transaction</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import router from '@/router';
import timeUtil from '@/lib/utils/time';
import request from '@/lib/request/request';
import BalanceService from '@/lib/services/balance-service';
// import AccountService from "@/lib/services/account-service";
// import { ITransaction } from "@/lib/models/transaction/transaction";

const information = ref({
  blockHash: [],
  blockHeight: 0,
  midGasPrice: 0,
  latestBatchId: 0,
  tokenTypeNumber: 0,
  totalTransactionNumber: 0,
});

interface IBlock {
  blockHash: string;
  blockHeight: number;
  blockTimeStamp: number;
  txNumber: number;
}

interface ITransaction {
  assetId: string;
  gasFee: 4200000;
  txId: string;
  txStatus: string;
  txTimestamp: number;
  txType: string;
  value: string;
  blockHeight: number;
}

const loadingBlocks = ref(false);
const loadingTransactions = ref(false);
const blocks = ref<IBlock[]>([]);
const transactions = ref<ITransaction[]>([]);

onMounted(async () => {
  information.value = await request.rpc('getLatestInformation');
  try {
    loadingBlocks.value = true;
    blocks.value = await request.rpc('getLatestBlocks');
    blocks.value = blocks.value.slice(0, 5);
  } finally {
    loadingBlocks.value = false;
  }
  try {
    loadingTransactions.value = true;
    transactions.value = await request.rpc('getLatestTransactions');
    transactions.value = transactions.value.slice(0, 5);
  } finally {
    loadingTransactions.value = false;
  }
});

const openBlocks = function () {
  router.push('/explorer/blocks');
};

const openTransactions = function () {
  router.push('/explorer/transactions');
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';
.data {
  display: flex;
  justify-content: space-between;
  background-color: @secondaryBackgroundColor;
  gap: 5px;
  padding-bottom: 30px;
  .data-left,
  .data-right {
    flex-grow: 1;
    text-align: left;
    width: 0;
    .card {
      cursor: pointer;
      flex-grow: 1;
      padding: 20px;
      //background: white;
      display: flex;
      text-align: left;
      .center {
        flex-grow: 1;
      }
      margin-bottom: 5px;
    }
    .title {
      //background: white;
      font-size: 16px;
      font-weight: bold;
      padding: 10px;
    }
  }
  .data-left {
    padding-left: 5px;
    .block-row {
      height: 100px;
      margin-bottom: 5px;
      //border-bottom: 10px solid rgb(255, 249, 254);
      background-color: @primaryBackgroundColor;
      cursor: pointer;
      .block-row-1 {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        //background: white;
        gap: 20px;
        .hash {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
        }
        .time {
          white-space: nowrap;
        }
      }
      .block-row-2 {
        display: flex;
        align-items: center;
        justify-content: right;
        gap: 5px;
        padding: 10px;
        //background: white;
        margin-left: 100px;
        .data-cell {
          padding: 10px;
          background: @primaryColor;
          color: white;
          border-radius: 5px;
        }
      }
    }
  }

  .data-right {
    padding-right: 5px;
    .transaction-row {
      height: 100px;
      background-color: @primaryBackgroundColor;
      margin-bottom: 5px;
      //border-bottom: 10px solid;
      cursor: pointer;
      .transaction-row-1 {
        display: flex;
        align-items: center;
        //background: white;
        .tx-id {
          color: #4bbee6;
        }
      }
      .transaction-row-2 {
        display: flex;
        align-items: center;
        //background: white;

        .from {
          display: flex;
          align-items: center;
          .from-data {
            width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .block {
          display: flex;
          align-items: center;
          .block-data {
            color: #4bbee6;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
