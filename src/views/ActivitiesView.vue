<template>
  <main-layout>
    <div class="container">
      <account-address></account-address>
      <div class="body">
        <div class="title">Activities</div>
        <div class="data">
          <div class="table">
            <div class="table-row table-row-header">
              <div class="table-header">SequenceId</div>
              <div class="table-header">Date</div>
              <div class="table-header tx-id">Transaction ID</div>
              <div class="table-header">Method</div>
              <div class="table-header asset-id">Asset Id</div>
              <div class="table-header">Value</div>
              <div class="table-header">Fee</div>
              <div class="table-header">Status</div>
              <div class="talbe-header"></div>
            </div>
            <div v-for="(item, i) in transactions" :key="i" class="table-row table-row-data">
              <div class="table-cell">
                {{ item.sequenceId }}
              </div>
              <div class="table-cell">
                {{ timeUtil.iso(item.txTimestamp * 1000) }}
              </div>
              <div class="table-cell tx-id">
                {{ item.txId }}
              </div>
              <div class="table-cell">{{ item.txType }}</div>
              <div class="table-cell asset-id">
                {{ item.assetId }}
              </div>
              <div class="table-cell">{{ item.value }}</div>
              <div class="table-cell">{{ item.gasFee }}</div>
              <div class="table-cell">
                <a-button shape="round" class="button-green">
                  {{ item.txStatus }}
                </a-button>
              </div>
            </div>
          </div>
        </div>
        <a-empty v-if="transactions.length == 0 && !loading" />
        <a-spin v-if="loading"></a-spin>
        <a-pagination
          v-model:current="page"
          v-model:page-size="pageSize"
          :total="total"
          :show-total="(total: number) => `Total: ${total}`"
          :show-size-changer="false"
          show-less-items
        />
      </div>
    </div>
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';

import { ref, onMounted } from 'vue';
import timeUtil from '@/lib/utils/time';
import type { ITransaction } from '@/lib/models/transaction/transaction';

const loading = ref(false);
const page = ref(1);
const pageSize = ref(25);
const total = ref(0);
const transactions = ref<ITransaction[]>([]);

onMounted(async () => {
  try {
    //await MetamaskService.login();
    loading.value = true;
    //const currentPublicKey = await AccountService.getCurrentPublicKey32();
    // // const rs = await request.rpc("getLatestUserTransactions", [
    // //   currentPublicKey,
    // //   page.value,
    // // ]);
    // transactions.value = _.get(rs, "data");
    // total.value = _.get(rs, "totalNumber");
    // pageSize.value = _.get(rs, "numberPerPage");
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="less" scoped>
.container {
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  .account-info {
    font-size: 16px;
    font-weight: bold;
    color: #858585;
    display: flex;
    align-items: center;
    gap: 20px;
    .copy-button {
      width: 150px;
    }
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .title {
      font-size: 16px;
      color: #858585;
      font-weight: bold;
      text-align: left;
    }
    .data {
      display: flex;
      .table {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
        .table-row {
          flex-grow: 1;
          display: flex;
          align-items: center;
          .table-header,
          .table-cell {
            width: 100px;
          }
        }
        .table-row-header {
          color: #858585;
          font-size: 12px;
          font-weight: bold;
          .asset-id,
          .tx-id {
            width: 300px;
            word-break: break-all;
          }
        }
        .table-row-data {
          height: 50px;
          font-size: 12px;
          color: #858585;
          background: white;
          border-radius: 25px;
          border: 1px solid whitesmoke;
          .asset-id,
          .tx-id {
            width: 300px;
            word-break: break-all;
          }
        }
      }
    }
    .direction {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }
  }
}
</style>
