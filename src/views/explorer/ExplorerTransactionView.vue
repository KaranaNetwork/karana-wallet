<template>
  <main-layout>
    <div class="container">
      <a-tabs v-model:activeKey="activeKey" class="tab">
        <a-tab-pane key="1" tab="Overview" style="height: 200px">
          <div class="overview">
            <table class="table">
              <tr>
                <td class="table-header">Transaction Hash:</td>
                <td class="table-data">{{ txId }} <copy-button :text="txId"></copy-button></td>
              </tr>
              <tr>
                <td class="table-header">Status:</td>
                <td class="table-data">Success</td>
              </tr>
              <tr>
                <td class="table-header">Type:</td>
                <td class="table-data">
                  {{ _.get(transaction, 'tx.operation.type') }}
                </td>
              </tr>
              <tr>
                <td class="table-header">Asset Id:</td>
                <td class="table-data">
                  {{ _.get(transaction, 'assetId') }}
                  <copy-button :text="_.get(transaction, 'assetId')"></copy-button>
                </td>
              </tr>
              <tr>
                <td class="table-header">Timestamp:</td>
                <td class="table-data">
                  {{ _.get(transaction, 'tx.createdAt') }}
                </td>
              </tr>
              <tr>
                <td class="table-header">Transaction Fee:</td>
                <td class="table-data">
                  {{ BalanceService.humanLize(_.get(transaction, 'gasFee') ?? '0') }}
                </td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="Gas Input" force-render>
          <div>
            <a-table
              :columns="[
                { title: 'Tx', key: 'txid', dataIndex: 'txid' },
                { title: 'Index', key: 'index', dataIndex: 'index' },
                {
                  title: 'Address',
                  key: 'address',
                  dataIndex: 'address',
                },
                {
                  title: 'Amount',
                  key: 'amount',
                  dataIndex: 'amount',
                },
              ]"
              :data-source="_.get(transaction, 'tx.operation.feeInputs')"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'txid'">
                  {{ record.txid }}
                </template>
                <template v-if="column.key === 'address'">
                  {{ record.address }}
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="Gas Output">
          <div>
            <a-table
              :columns="[
                {
                  title: 'Address',
                  key: 'address',
                  dataIndex: 'address',
                },
                {
                  title: 'Amount',
                  key: 'amount',
                  dataIndex: 'amount',
                },
              ]"
              :data-source="_.get(transaction, 'tx.operation.feeOutputs')"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'address'">
                  {{ record.address }}
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" tab="Input" force-render>
          <div>
            <a-table
              :columns="[
                { title: 'Tx', key: 'txid', dataIndex: 'txid' },
                { title: 'Index', key: 'index', dataIndex: 'index' },
                {
                  title: 'Address',
                  key: 'address',
                  dataIndex: 'address',
                },
                {
                  title: 'Amount',
                  key: 'amount',
                  dataIndex: 'amount',
                },
              ]"
              :data-source="_.get(transaction, 'tx.operation.inputs')"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'txid'">
                  {{ record.txid }}
                </template>
                <template v-if="column.key === 'address'">
                  {{ record.address }}
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="5" tab="Output">
          <div>
            <a-table
              :columns="[
                {
                  title: 'Address',
                  key: 'address',
                  dataIndex: 'address',
                },
                {
                  title: 'Amount',
                  key: 'amount',
                  dataIndex: 'amount',
                },
              ]"
              :data-source="_.get(transaction, 'tx.operation.outputs')"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'address'">
                  {{ record.address }}
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </main-layout>
</template>
<script lang="ts" setup>
import MainLayout from '@/components/layout/MainLayout.vue';

import _ from 'lodash';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import hexUtil from '@/lib/utils/hex';
import request from '@/lib/request/request';
import BalanceService from '@/lib/services/balance-service';

const route = useRoute();
const txId = route.query.txId as string;
const activeKey = ref('1');
const transaction = ref<unknown | null>(null);

onMounted(async () => {
  transaction.value = await request.rpc('getTransactionDetail', [hexUtil.padding0x(txId)]);
});
</script>

<style lang="less" scoped>
.container {
  flex-grow: 1;
  background: #1b1d21;
  display: flex;
  flex-direction: column;
  padding: 0 50px;
  .tab {
    flex-grow: 1;
  }
  .overview {
    display: flex;
    .table {
      color: white;
      flex-grow: 1;
      text-align: left;
      font-size: 18px;
      font-weight: bold;
      tr {
        height: 50px;
      }
      .table-header {
        width: 350px;
      }
      .table-header,
      .table-data {
        border-bottom: solid 1px #25272c;
      }
    }
  }
}
</style>
