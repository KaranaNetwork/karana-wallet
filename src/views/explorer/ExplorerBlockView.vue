<template>
  <main-layout>
    <div class="container">
      <a-tabs v-model:activeKey="activeKey" class="tab">
        <a-tab-pane key="1" tab="Overview" style="height: 200px">
          <div class="overview">
            <table class="table">
              <tr>
                <td class="table-header">Block Height:</td>
                <td class="table-data">{{ _.get(block, 'blockHeight') }}</td>
              </tr>
              <tr>
                <td class="table-header">Timestamp:</td>
                <td class="table-data">
                  {{ timeUtil.iso(_.get(block, 'blockTimeStamp', 0) * 1000) }}
                </td>
              </tr>
              <tr>
                <td class="table-header">Batch Hash:</td>
                <td class="table-data">
                  {{ _.get(block, 'blockHash') }}
                  <copy-button :text="_.get(block, 'blockHash')"></copy-button>
                </td>
              </tr>
              <tr>
                <td class="table-header">Status:</td>
                <td class="table-data">
                  {{ _.get(block, 'commitments', []).length > 0 ? 'Confirmed' : 'Committing' }}
                </td>
              </tr>
              <tr>
                <td class="table-header">Transactions:</td>
                <td class="table-data">
                  <div v-for="(tx, i) in txes" :key="i">
                    <div>
                      TxID:
                      <a
                        @click="
                          router.push({
                            path: '/explorer/transaction',
                            query: {
                              txId: _.get(tx, 'txId'),
                            },
                          })
                        "
                      >
                        {{ _.get(tx, 'txId') }}
                      </a>
                      <copy-button :text="_.get(tx, 'txId')"></copy-button>
                    </div>
                    <div>
                      <div>gasFee: {{ BalanceService.humanLize(_.get(tx, 'gasFee', 0) ?? 0) }}</div>
                      <div>
                        {{ timeUtil.iso(_.get(tx, 'txTimestamp', 0) * 1000) }}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </main-layout>
</template>
<script lang="ts" setup>
import MainLayout from '@/components/layout/MainLayout.vue';

import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import timeUtil from '@/lib/utils/time';
import request from '@/lib/request/request';
import BalanceService from '@/lib/services/balance-service';

const route = useRoute();
const router = useRouter();
const activeKey = ref('1');
const blockHeight = (route.query.blockHeight ?? '') as string;
const block = ref<unknown | null>(null);

const txes = computed(() => {
  return _.get(block.value, 'txs', []);
});

const l1Link = function (type: string, hash: string): string {
  let s = '';
  switch (type) {
    case 'BITCOIN':
      s = `https://blockstream.info/tx/${hash}`;
      break;
    case 'BITCOIN_TESTNET':
      s = `https://blockstream.info/testnet/tx/${hash}`;
      break;
    case 'BITCOIN_LOCAL':
      s = `https://blockstream.info/testnet/tx/${hash}`;
      break;
    case 'SEPOLIA':
      s = `https://sepolia.etherscan.io/tx/${hash}`;
      break;
    case 'ETHEREUM':
      s = `https://etherscan.io/tx/${hash}`;
      break;
    case 'ETHEREUM_LOCAL':
      s = `https://etherscan.io/tx/${hash}`;
      break;
  }
  return s;
};
console.log(l1Link);

onMounted(async () => {
  block.value = await request.rpc('getBlock', [+blockHeight]);
});
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';
.container {
  flex-grow: 1;
  background: @primaryBackgroundColor;
  display: flex;
  flex-direction: column;
  padding: 0 50px;
  .tab {
    flex-grow: 1;
  }
  .overview {
    display: flex;
    .table {
      flex-grow: 1;
      text-align: left;
      font-size: 18px;
      font-weight: bold;
      color: white;
      tr {
        height: 50px;
      }
      .table-header {
        width: 350px;
      }
      .table-header,
      .table-data {
        border-bottom: solid 1px @secondaryBackgroundColor;
      }
    }
  }
}
</style>
