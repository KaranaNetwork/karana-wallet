<template>
  <main-layout>
    <div class="token-info" v-if="token">
      <div class="title">{{ _.get(token, 'metadata.name') }}</div>
      <div class="body">
        <div class="row">
          <div class="data-item">
            <a-progress :percent="percent" strokeColor="#ff7700"></a-progress>
          </div>
        </div>
        <div class="row">
          <div class="icon"><BankOutlined /></div>
          <div class="data-item">
            <div class="label">Asset ID</div>
            <div style="color: #ff7700">
              <a-tooltip>
                <template #title>{{ _.get(token, 'assetId', '') }}</template>
                {{ text.middleEllipsis(_.get(token, 'assetId', '')) }}
              </a-tooltip>
              <copy-button :text="_.get(token, 'assetId', '')"></copy-button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><WalletFilled /></div>
          <div class="data-item">
            <div class="label">Current Supply</div>
            <div style="color: green">
              {{ BalanceService.humanLize(_.get(token, 'metadata.currentSupply')) }}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><WalletOutlined /></div>
          <div class="data-item">
            <div class="label">Total Supply</div>
            <div>{{ BalanceService.humanLize(_.get(token, 'metadata.totalSupply')) }}</div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><ThunderboltOutlined /></div>
          <div class="data-item">
            <div class="label">Per-Mint Amount</div>
            <div style="color: red">
              {{ BalanceService.humanLize(_.get(token, 'metadata.mintAmount')) }}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><DollarOutlined /></div>
          <div class="data-item">
            <div class="label">Price</div>
            <div>{{ BalanceService.humanLize(_.get(token, 'metadata.price')) }}</div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><UserOutlined /></div>
          <div class="data-item">
            <div class="label">Deployer</div>
            <div>
              <a-tooltip>
                <template #title>
                  {{ _.get(token, 'metadata.deployer', '') }}
                </template>
                {{ text.middleEllipsis(_.get(token, 'metadata.deployer', '')) }}
              </a-tooltip>
              <copy-button :text="_.get(token, 'metadata.deployer', '')"></copy-button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><UserOutlined /></div>
          <div class="data-item">
            <div class="label">Deploy Transaction ID</div>
            <div>
              <a-tooltip>
                <template #title>
                  {{ _.get(token, 'metadata.deployTxid', '') }}
                </template>
                {{ text.middleEllipsis(_.get(token, 'metadata.deployTxid', '')) }}
              </a-tooltip>
              <copy-button :text="_.get(token, 'metadata.deployTxid', '')"></copy-button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="icon"><FieldTimeOutlined /></div>
          <div class="data-item">
            <div class="label">Time</div>
            <div>
              {{ time.iso(_.get(token, 'metadata.timestamp', 0) * 1000) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="other-info">
      <a-row class="row" justify="space-around">
        <a-col class="col" :span="7">
          <div class="gutter-box">Coming Soon Coming Soon</div>
        </a-col>
        <a-col class="col" :span="7"><div class="gutter-box"></div></a-col>
        <a-col class="col" :span="7"><div class="gutter-box"></div></a-col>
      </a-row>
    </div>
  </main-layout>
</template>
<script setup lang="ts">
import CopyButton from '@/components/media/CopyButton.vue';

import _ from 'lodash';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  BankOutlined,
  DollarOutlined,
  WalletOutlined,
  WalletFilled,
  ThunderboltOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import request from '@/lib/request/request';
import time from '@/lib/utils/time';
import text from '@/lib/utils/text';
import BalanceService from '@/lib/services/balance-service';

const route = useRoute();
let id = route.query.id as string;
const token = ref();

const percent = computed(() => {
  return +(
    (_.get(token.value, 'metadata.currentSupply') / _.get(token.value, 'metadata.totalSupply')) *
    100
  ).toFixed(2);
});
onMounted(async () => {
  token.value = await request.rpc('getTokenDetail', [id]);
});
</script>
<style lang="less">
.token-info {
  margin: 10px;
  padding: 10px;
  background-color: #25272c;
  border-radius: 5px;
  .title {
    text-align: left;
    font-weight: bold;
    font-size: 20px;
    padding: 10px 0;
  }
  .body {
    display: flex;
    flex-direction: column;
    text-align: left;
    gap: 2.5px;
    .row {
      height: 50px;
      padding: 10px;
      background-color: #1b1d21;
      display: flex;
      gap: 10px;
      .icon {
        width: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .data-item {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        .label {
          font-weight: bold;
        }
      }
    }
  }
}
.other-info {
  margin: 10px;
  padding: 10px;
  background-color: #25272c;
  border-radius: 5px;
  .row {
    .col,
    .gutter-row {
      height: 50px;
      background-color: #1b1d21;
      display: flex;
      align-items: center;
      justify-content: center;
      .gutter-box {
        background-color: #1b1d21;
        padding: 5px;
      }
    }
  }
}
</style>
