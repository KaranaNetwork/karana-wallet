<template>
  <div class="data">
    <div class="table">
      <a-row class="table-row table-row-header">
        <a-col class="table-header" :span="2">SequenceId</a-col>
        <a-col class="table-header" :span="4">Date</a-col>
        <a-col class="table-header tx-id" :span="5">Transaction ID</a-col>
        <a-col class="table-header" :span="2">Method</a-col>
        <a-col class="table-header asset-id" :span="5">Asset Id</a-col>
        <a-col class="table-header" :span="2">Value</a-col>
        <a-col class="table-header" :span="2">Fee</a-col>
        <a-col class="table-header" :span="2">Status</a-col>
      </a-row>
      <a-row v-for="(item, i) in transactions" :key="i" class="table-row table-row-data">
        <a-col class="table-cell" :span="2">
          {{ item.sequenceId }}
        </a-col>
        <a-col class="table-cell" :span="4">
          {{ timeUtil.iso(item.txTimestamp * 1000) }}
        </a-col>
        <a-col class="table-cell tx-id" :span="5">
          <a-tooltip>
            <template #title>{{ item.txId }}</template>
            {{ text.middleEllipsis(item.txId) }}
          </a-tooltip>
          <copy-button :text="item.txId"></copy-button>
        </a-col>
        <a-col class="table-cell" :span="2">
          {{ item.txType }}
        </a-col>
        <a-col class="table-cell asset-id" :span="5">
          <a-tooltip>
            <template #title>{{ item.assetId }}</template>
            {{ text.middleEllipsis(item.assetId) }}
          </a-tooltip>
          <copy-button :text="item.assetId"></copy-button>
        </a-col>
        <a-col class="table-cell" :span="2">{{ BalanceService.humanLize(item.value ?? 0) }}</a-col>
        <a-col class="table-cell" :span="2">{{ BalanceService.humanLize(item.gasFee ?? 0) }}</a-col>
        <a-col class="table-cell" :span="2">
          <a-button shape="round" class="button-green">
            {{ item.txStatus }}
          </a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import CopyButton from '@/components/media/CopyButton.vue';

import { type PropType } from 'vue';
import timeUtil from '@/lib/utils/time';
import text from '@/lib/utils/text';
import BalanceService from '@/lib/services/balance-service';
import type { ITransaction } from '@/lib/models/transaction/transaction';

defineProps({
  page: { type: Number, default: 1 },
  transactions: { type: Array as PropType<ITransaction[]>, default: () => [] },
});
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';
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
      color: white;
      background: @primaryBackgroundColor;
      border-radius: 25px;
      .asset-id,
      .tx-id {
        width: 300px;
        word-break: break-all;
      }
    }
  }
}
</style>
