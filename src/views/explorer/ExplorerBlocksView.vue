<template>
  <main-layout>
    <div class="blocks">
      <div class="title">Blocks</div>
      <a-table
        :loading="loading"
        :dataSource="blocks"
        :columns="[
          {
            title: 'BlockHeight',
            key: 'blockHeight',
            dataIndex: 'blockHeight',
          },
          { title: 'Hash', key: 'blockHash', dataIndex: 'blockHash' },
          { title: 'TxNumber', key: 'txNumber', dataIndex: 'txNumber' },
          { title: 'Time', key: 'blockTimeStamp', dataIndex: 'blockTimeStamp' },
        ]"
        :pagination="false"
        :customRow="rowClick"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'blockHash'">
            {{ record.blockHash }}
          </template>
          <template v-if="column.key === 'blockTimeStamp'">
            {{ timeUtil.iso(record.blockTimeStamp * 1000) }}
          </template>
        </template>
      </a-table>
      <a-pagination
        v-model:current="page"
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
<script lang="ts" setup>
import MainLayout from '@/components/layout/MainLayout.vue';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import timeUtil from '@/lib/utils/time';
import request from '@/lib/request/request';
import type { IBlock } from '@/lib/models/block/block';

const loading = ref(false);
const page = ref(1);
const pageSize = ref(25);
const total = ref(0);
const blocks = ref<IBlock[]>([]);
const router = useRouter();

onMounted(async () => {
  loading.value = true;
  try {
    const { data, totalNumber, numberPerPage } = await request.rpc('getBlockList', [page.value]);
    blocks.value = data;
    console.log(data);
    total.value = totalNumber;
    pageSize.value = numberPerPage;
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
    const { data, totalNumber, numberPerPage } = await request.rpc('getBlockList', [nextPage]);
    blocks.value = data;
    page.value = nextPage;
    total.value = totalNumber;
    pageSize.value = numberPerPage;
  } finally {
    loading.value = false;
  }
};

function rowClick(record: IBlock, index: number) {
  return {
    onclick: () => {
      console.log(record, index);
      router.push({
        path: '/explorer/block',
        query: { blockHeight: record.blockHeight },
      });
    },
  };
}
</script>

<style lang="less" scoped>
.blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .title {
    text-align: left;
    background: #25272c;
    border-radius: 10px;
    padding: 10px;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>
