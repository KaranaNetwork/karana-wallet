<template>
  <main-layout>
    <div class="transactions">
      <div class="title">Transactions</div>
      <a-table
        :loading="loading"
        :dataSource="transactions"
        :columns="columns"
        :pagination="false"
        :customRow="rowClick"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'assetId'">
            {{ record.assetId }}
          </template>
          <template v-if="column.key === 'txId'">
            {{ record.txId }}
          </template>
          <template v-if="column.key === 'txTimestamp'">
            {{ timeUtil.iso(record.txTimestamp * 1000) }}
          </template>
          <template v-if="column.key === 'gasFee'">
            {{ BalanceService.humanLize(record.gasFee) }}
          </template>
        </template>
      </a-table>
      <a-pagination
        v-model:current="page"
        v-model:page-size="pageSize"
        :total="total"
        :show-total="(total: number) => `Total:${total}`"
        :show-size-changer="false"
        show-less-items
        @change="changePage"
      />
    </div>
  </main-layout>
</template>
<script lang="ts" setup>
import MainLayout from '@/components/layout/MainLayout.vue';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import timeUtil from '@/lib/utils/time';
import request from '@/lib/request/request';
import BalanceService from '@/lib/services/balance-service';
import type { ITransaction } from '@/lib/models/transaction/transaction';

const columns = [
  {
    title: 'SequenceId',
    key: 'sequenceId',
    dataIndex: 'sequenceId',
    width: 120,
  },
  {
    title: 'TX',
    key: 'txId',
    dataIndex: 'txId',
    ellipsis: true,
  },
  {
    title: 'AssetId',
    key: 'assetId',
    dataIndex: 'assetId',
    ellipsis: true,
  },
  { title: 'Type', key: 'txType', dataIndex: 'txType', width: 100 },
  { title: 'GasFee', key: 'gasFee', dataIndex: 'gasFee', width: 100 },
  {
    title: 'status',
    key: 'txStatus',
    dataIndex: 'txStatus',
    width: 120,
  },
  { title: 'Time', key: 'txTimestamp', dataIndex: 'txTimestamp' },
];

const loading = ref(false);
const page = ref(1);
const pageSize = ref(25);
const total = ref(0);
const transactions = ref<ITransaction[]>([]);
const router = useRouter();

onMounted(async () => {
  try {
    loading.value = true;
    const { data, totalNumber, numberPerPage } = await request.rpc('getTransactionList', [
      page.value,
    ]);
    transactions.value = data;
    total.value = totalNumber;
    pageSize.value = numberPerPage;
  } finally {
    loading.value = false;
  }
});

const changePage = async function (nextPage: number, nextPageSize: number) {
  if (loading.value) {
    return;
  }
  try {
    loading.value = true;
    const { data, totalNumber, numberPerPage } = await request.rpc('getTransactionList', [
      nextPage,
    ]);
    transactions.value = data;
    pageSize.value = numberPerPage;
    page.value = nextPage;
    total.value = totalNumber;
  } finally {
    loading.value = false;
  }
  console.log(nextPageSize);
};

function rowClick(record: ITransaction, index: number) {
  return {
    onclick: () => {
      console.log(record, index);
      router.push({
        path: '/explorer/transaction',
        query: { txId: record.txId },
      });
    },
  };
}
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.transactions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .title {
    text-align: left;
    background: @secondaryBackgroundColor;
    border-radius: 10px;
    padding: 10px;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>
