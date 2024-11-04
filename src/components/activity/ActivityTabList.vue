<template>
  <div class="activities">
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
    <br />
    <br />
    <div class="activity-table">
      <div v-if="activeActivity == 'mint'">
        <a-table
          class="table"
          :columns="[
            { title: 'Transactions ID', dataIndex: 'assetId' },
            { title: 'Token', dataIndex: 'name' },
            { title: 'Quantity', dataIndex: 'mintAmount' },
            { title: 'Date', dataIndex: 'deployTime' },
            { title: 'Status', dataIndex: 'progress' },
          ]"
          :dataSource="mintPageData?.list"
          :loading="mintLoading"
        ></a-table>
      </div>
      <div v-if="activeActivity == 'deploy'">
        <a-table
          class="table"
          :columns="[
            { title: 'Transactions ID', dataIndex: 'assetId' },
            { title: 'Token', dataIndex: 'name' },
            { title: 'Date', dataIndex: 'deployTime' },
            { title: 'Status', dataIndex: 'progress' },
          ]"
          :dataSource="deployPageData?.list"
          :loading="deployLoading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'assetId'">
              {{ text.middleEllipsis(record.assetId, 10) }}
            </template>
            <template v-if="column.dataIndex === 'deployTime'">
              {{ time.iso(record.deployTime * 1000) }}
            </template>
          </template>
        </a-table>
      </div>
      <div v-if="activeActivity == 'transform'">
        <a-table
          class="table"
          :columns="[
            { key: 'type' },
            { title: 'form' },
            { title: 'to' },
            { title: 'Transaction ID' },
            { title: 'Date' },
            { title: 'Status' },
          ]"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'type'">
              <a-select v-model:value="transactionType" style="width: 120px">
                <a-select-option value="all">All</a-select-option>
                <a-select-option value="deposit upgrade">deposit upgrade</a-select-option>
                <a-select-option value="withdraw downgrade">withdraw downgrade</a-select-option>
              </a-select>
            </template>
          </template>
        </a-table>
      </div>
      <div v-if="activeActivity == 'send'">
        <a-table
          class="table"
          :columns="[
            { title: 'Transactions ID' },
            { title: 'Amount' },
            { title: 'Send Address' },
            { title: 'Receive Address' },
            { title: 'Date' },
            { title: 'Status' },
          ]"
        ></a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import text from '@/lib/utils/text';
import time from '@/lib/utils/time';
import Config from '@/lib/config/config';
import store from '@/store/store';
import request from '@/lib/request/request';



const activeActivity = ref('mint');
const transactionType = ref('all');

const mintPageData = ref();
const mintLoading = ref(false);
const deployPageData = ref();
const deployLoading = ref(false);

const changeActivity = async function (key: string) {
  activeActivity.value = key;
  if (key == 'mint') {
    if (!mintPageData.value) {
      await mints();
    }
  } else if (key == 'deploy') {
    if (!deployPageData.value) {
      await deploies();
    }
  }
};

const deploies = async function () {
  try {
    deployLoading.value = true;
    const resp = await request.get(Config.nextUrl + '/v1/token/user/list', {
      address: store.account?.publicKey32,
    });
    deployPageData.value = resp.data;
  } finally {
    deployLoading.value = false;
  }
};

const mints = async function () {
  try {
    mintLoading.value = true;
    const resp = await request.get(Config.nextUrl + '/v1/token/mint/tx', {
      address: store.account?.publicKey32,
    });
    mintPageData.value = resp.data;
    console.log(mintPageData.value);
  } finally {
    mintLoading.value = false;
  }
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.activities {
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
  .activity-table {
    .table:hover {
      cursor: pointer;
    }
  }
}
</style>
