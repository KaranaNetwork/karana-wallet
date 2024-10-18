<template>
  <main-layout>
    <div class="container">
      <div class="title">Batches</div>
      <a-table
        class="table"
        :loading="loading"
        :dataSource="batches"
        :columns="[
          {
            title: 'BatchId',
            key: 'batchId',
            dataIndex: 'batchId',
          },
          {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
          },
          {
            title: 'L1Tx',
            key: 'l1Tx',
          },
          {
            title: 'Blocks',
            key: 'blocks',
          },
          {
            title: 'Txs',
            key: 'txs',
          },
          //{ title: 'Time', key: 'time', dataIndex: 'time' },
        ]"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'blocks'">
            [{{ record.blockHeightStart }} - {{ record.blockHeightEnd }}]
          </template>
          <template v-if="column.key === 'txs'">
            [{{ record.txSidStart }} - {{ record.txSidEnd }}]
          </template>
          <template v-if="column.key === 'status'">
            {{ record.status ?? 'Complete' }}
          </template>
          <template v-if="column.key === 'l1Tx'">
            <div v-for="(v, i) in record.l1Tx" :key="i">
              <span> {{ v[0] }}: </span>
              <a :href="NetworkService.getURL(v[0], v[1])" target="_blank">
                {{ v[1] }}
              </a>
            </div>
          </template>
        </template>
      </a-table>
      <br />
      <a-pagination
        v-model:current="current"
        v-model:page-size="pageSize"
        :total="total"
        :show-total="(total: number) => `Total:${total}`"
        @change="changePage"
        :show-size-changer="false"
        show-less-items
      />
    </div>
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';

import { ref, onMounted } from 'vue';
import request from '@/lib/request/request';

import NetworkService from '@/lib/services/network-service';
import type { Batch } from '@/lib/models/batch/batch';

const loading = ref(false);
const current = ref(1);
const pageSize = ref(25);
const total = ref(0);
const batches = ref<Batch[]>(new Array<Batch>());

onMounted(async () => {
  loading.value = true;
  try {
    const { data, page, totalNumber } = await request.rpc('getBatchList', [current.value]);
    batches.value = data;
    total.value = totalNumber;
    current.value = page;
  } finally {
    loading.value = false;
  }
});

const changePage = async function (nextPage: number, nextPageSize: number) {
  console.log(nextPageSize);
  if (loading.value) {
    return;
  }
  try {
    loading.value = true;
    const { data, totalNumber, page } = await request.rpc('getBatchList', [nextPage]);
    batches.value = data;
    current.value = page;
    total.value = totalNumber;
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.container {
  .title {
    text-align: left;
    background: @secondaryBackgroundColor;
    border-radius: 10px;
    padding: 10px;
    font-weight: bold;
    font-size: 18px;
  }
  .table {
    a {
      color: #ff7700;
    }
  }
}
</style>
