<template>
  <main-layout>
    <div class="swap">
      <a
        class="search-bar"
        :class="+claimableNumber > 0 ? 'search-bar-active' : ''"
        @click="openHistory"
      >
        <div class="icon"><HistoryOutlined /></div>
        <div class="title">
          <span v-if="+claimableNumber > 0">
            You have {{ claimableNumber }} transform to claim</span
          >
          <span v-else>see transaction history</span>
        </div>
        <div class="action"><ArrowRightOutlined /></div>
      </a>
      <div class="change-card">
        <div class="title">
          <span v-if="swapType == 'down'"> Transform Omniverse Asset to Local Asset </span>
          <span v-else-if="swapType == 'up'"> Transform Local Asset to Omniverse Asset </span>
        </div>
        <br />
        <div class="exchange-items" :style="itemsStyle">
          <div class="l1">
            <div class="header">
              <div>
                <a-button class="button-blue" style="height: 45px; width: 260px; text-align: left">
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      font-size: 22px;
                    "
                  >
                    <span> {{ swapType == 'up' ? 'From' : 'To' }}: ETH Testnet </span>
                    <CaretDownOutlined v-if="false" />
                  </div>
                </a-button>
              </div>
              <div>
                Balance:
                {{ BalanceService.humanLize(l1Balance) }}
                {{ transformerInfo?.list[transformIndex].name }}
              </div>
            </div>
            <div class="body">
              <a-input
                v-if="swapType == 'up'"
                class="huge"
                size="large"
                placeholder="Enter amount"
                v-model:value="upAmount"
                @input="handleAmountInput"
              >
                <template #addonBefore>
                  <a @click="openSearch('l1Token')">
                    {{ transformerInfo?.list[transformIndex].name }}
                    <CaretDownOutlined />
                  </a>
                </template>
                <template #addonAfter>
                  <a @click="toMax">Max</a>
                </template>
              </a-input>
              <a-input v-else class="huge" size="large" placeholder="" :disabled="true">
                <template #addonBefore>
                  <div>
                    {{ transformerInfo?.list[transformIndex].name }}
                  </div>
                </template>
              </a-input>
              <div class="error" v-if="isOverLimitL1 && swapType == 'up'">
                Insufficient {{ transformerInfo?.list[transformIndex].name }}. Please add more funds
                to {{ transformerInfo?.list[transformIndex].name }}.
              </div>
            </div>
          </div>
          <a class="change-button" @click="change">
            <RetweetOutlined class="change-icon" style="font-size: 20px; cursor: pointer" />
          </a>
          <div class="l2">
            <div class="header">
              <div>
                <a-button class="button-blue" style="height: 45px; width: 260px; text-align: left">
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      font-size: 22px;
                    "
                  >
                    <span> {{ swapType == 'down' ? 'From' : 'To' }}: {{ currentCoin }} </span>
                  </div>
                </a-button>
              </div>
              <div>
                Balance:
                {{
                  BalanceService.humanLize(
                    transformerInfo?.list[transformIndex].omniverseBalance ?? 0,
                  )
                }}
                {{ transformerInfo?.list[transformIndex].name }}
              </div>
            </div>
            <div class="body">
              <a-input
                v-if="swapType == 'down'"
                class="huge"
                size="large"
                placeholder="Enter amount"
                v-model:value="downAmount"
                @input="handleAmountInput"
              >
                <template #addonBefore>
                  <a @click="openSearch('l2Token')">
                    {{ transformerInfo?.list[transformIndex].name }}
                    <CaretDownOutlined />
                  </a>
                </template>
                <template #addonAfter>
                  <a style="cursor: pointer" @click="toMax">Max</a>
                </template>
              </a-input>
              <a-input v-else class="huge" size="large" placeholder="" :disabled="true">
                <template #addonBefore>
                  <div>
                    {{ transformerInfo?.list[transformIndex].name }}
                  </div>
                </template>
              </a-input>
              <div class="error" v-if="isOverLimitL2 && swapType == 'down'">
                Insufficient {{ transformerInfo?.list[transformIndex].name }}. Please add more funds
                to {{ transformerInfo?.list[transformIndex].name }}.
              </div>
            </div>
          </div>
        </div>
        <br />
        <div v-if="store.transformerInfo?.list" style="display: flex; justify-content: end">
          <a style="color: #4096ff" @click="addTokenToMetamask">
            <span v-if="addTokenToMetamaskLoading"><LoadingOutlined /></span>
            Add token {{ store.transformerInfo?.list[transformIndex].name }} to Metamask
          </a>
        </div>
        <br />
        <div class="gas-fees" v-show="fees">
          <div class="row">
            <div class="left">Transform fee</div>
            <div class="right">
              {{ BalanceService.humanLize(fees?.platformFee ?? 0) }}
              {{ transformerInfo?.list[transformIndex].name }}
            </div>
          </div>
          <div class="row">
            <div class="left">Eth fee</div>
            <div class="right">{{ BalanceService.humanLize(fees?.ethNetFee ?? 0) }} ETH</div>
          </div>
          <div class="row">
            <div class="left">You will receive</div>
            <div class="right">{{ amount }} {{ transformerInfo?.list[transformIndex].name }}</div>
          </div>
        </div>
        <br />
        <div
          v-if="!store.account?.isComplete"
          style="display: flex; flex-direction: column; gap: 20px"
        >
          <a-button
            class="button-blue"
            style="flex-grow: 1; height: 50px; font-size: 22px"
            @click="connect"
            :loading="isConnecting"
          >
            CONNECT WALLET
          </a-button>
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 20px">
          <a-button
            v-if="swapType == 'up'"
            class="button-blue"
            style="flex-grow: 1; height: 50px; font-size: 22px"
            @click="transformClick"
            :disabled="isConnecting || isOverLimitL1 || !isValidAmount(upAmount)"
          >
            Transform
          </a-button>
          <a-button
            v-if="swapType == 'down'"
            class="button-blue"
            style="flex-grow: 1; height: 50px; font-size: 22px"
            @click="transformClick"
            :disabled="isConnecting || isOverLimitL2 || !isValidAmount(downAmount)"
          >
            Transform
          </a-button>
        </div>
      </div>
    </div>
    <a-modal
      v-model:open="isSearchOpen"
      :title="searchTitle"
      :closable="true"
      :footer="null"
      :mask-closable="false"
    >
      <div class="modal-body">
        <div class="search">
          <a-input size="large" v-model:value="keyword">
            <template #addonBefore>
              <SearchOutlined style="color: white" />
            </template>
          </a-input>
        </div>
        <br />
        <div v-if="transformerInfo" class="list">
          <template v-for="(item, i) in transformerInfo.list" :key="i">
            <div
              class="item"
              @click="changeToken(i)"
              style="cursor: pointer"
              v-show="item.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0"
            >
              <div class="avatar">
                <LoadingOutlined v-if="isChanging && changingIndex == i" />
                <a-image
                  v-else
                  :src="coinsrc"
                  alt="''"
                  :width="60"
                  :height="60"
                  style="border-radius: 30px"
                  :preview="false"
                />
              </div>
              <div class="content">
                <div class="name">{{ item.name }}</div>
                <div class="description">{{ item.name }}</div>
              </div>
              <div class="tail">
                {{
                  swapType == 'up'
                    ? BalanceService.humanLize(transformerInfo?.list[i].localBalance ?? 0)
                    : BalanceService.humanLize(transformerInfo?.list[i].omniverseBalance ?? 0)
                }}
                {{ item.name }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </a-modal>
    <a-modal
      v-model:open="isConfirmOpen"
      title="Review"
      :closable="true"
      :footer="null"
      :mask-closable="false"
    >
      <div class="confirm-body">
        <div class="time">
          {{ time.iso(time.currentTimestamp()) }}
        </div>
        <div class="row">
          <div class="left">From</div>
          <div class="right">{{ from }}</div>
        </div>
        <div class="row">
          <div class="left">To</div>
          <div class="right">{{ to }}</div>
        </div>
        <div class="row-start">
          <step-view
            v-if="swapType == 'up'"
            :current="upStep"
            :status="upStatus"
            :items="[
              {
                title: 'switch network',
                description: 'switch to karana network',
              },
              {
                title: 'Sign Transaction',
                description: 'sign transaction data',
              },
              {
                title: 'Wait Transaction Receipt',
                description: 'wait transaction receipt complete',
              },
              {
                title: 'Send Transaction',
                description: 'confirm send transaction',
              },
            ]"
          ></step-view>
          <step-view
            v-if="swapType == 'down'"
            :current="downStep"
            :status="downStatus"
            :items="[
              {
                title: 'switch network',
                description: 'switch to karana network',
              },
              {
                title: 'Sign',
                description: 'sign transaction data',
              },
              {
                title: 'Send Transaction',
                description: 'confirm send transaction',
              },
            ]"
          ></step-view>
        </div>
        <div class="row">
          <div class="left">Transform fee</div>
          <div class="right">
            {{ BalanceService.humanLize(fees?.platformFee ?? 0) }}
            {{ transformerInfo?.list[transformIndex].name }}
          </div>
        </div>
        <div class="row">
          <div class="left"></div>
          <div class="right">{{ fees?.ethNetFee }} ETH</div>
        </div>
        <div class="row">
          <div class="left">You will receive</div>
          <div class="right">{{ amount }} {{ transformerInfo?.list[transformIndex].name }}</div>
        </div>
        <div class="row">
          <div class="left"></div>
          <div class="right"></div>
        </div>
        <div class="row-start">
          <a-checkbox v-model:checked="confirmChecked"></a-checkbox>
          <div>
            I understand that after claiming my funds, I’ll have to send another transaction on
            Ethereum and pay another Ethereum fee
          </div>
        </div>
        <div class="row-center">
          <a-button
            class="button-blue"
            :loading="isConnecting"
            :disabled="!confirmChecked"
            @click="confirmClick"
          >
            confirm and send
          </a-button>
        </div>
      </div>
    </a-modal>
    <a-modal
      v-model:open="isTransactionDetailOpen"
      title="Transaction Details"
      :footer="null"
      :mask-closable="false"
    >
      <div class="tarnsaction-detail-body">
        <div class="card">
          <div class="time">
            {{ time.iso(+(transformingRecord?.timestampBegin ?? 0)) }}
          </div>
          <div class="amount">
            {{ BalanceService.humanLize(transformingRecord?.amount ?? 0) }}
            {{ transformerInfo?.list[transformIndex].name }}
          </div>
        </div>
        <div class="card">
          <div class="direction">
            <div>{{ transformingRecord ? fromName(transformingRecord) : '' }}</div>
            <div>-></div>
            <div>{{ transformingRecord ? toName(transformingRecord) : '' }}</div>
          </div>
        </div>
        <div class="card">
          <div class="row">
            <div class="state">
              <div class="ok"></div>
              <div>Transaction initiated on {{ transformerInfo?.list[transformIndex].name }}</div>
            </div>
            <div></div>
          </div>
          <div class="row">
            <div class="state">
              <div
                :class="
                  TransformingState.Settled == transformingRecord?.state ||
                  TransformingState.Claimable == transformingRecord?.state
                    ? 'ok'
                    : 'no'
                "
              ></div>
              <div>Claim withdraw</div>
            </div>
            <div></div>
          </div>
          <div class="row">
            <div class="state">
              <div
                :class="TransformingState.Settled == transformingRecord?.state ? 'ok' : 'no'"
              ></div>
              <div>Funds arrived on Ethereum</div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </a-modal>
    <a-drawer
      v-model:open="isHistoryOpen"
      class="history"
      root-class-name="history"
      :width="1024"
      title=""
      placement="right"
      :mask-closable="false"
    >
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="Pending transactions">
          <div class="history-body">
            <div class="history-notify" v-if="+claimableNumber > 0">
              <div>You have {{ claimableNumber }} transaction</div>
              <a-button
                v-if="false"
                class="button-blue"
                @click="claimAll"
                :loading="getActionLoading('claim:all')"
                :disabled="
                  getActionDisabled('claim:all') ||
                  pendingTransactionPageData.items.filter((record) => {
                    return record.state == TransformingState.Claimable;
                  }).length == 0
                "
              >
                CLAIM ALL
              </a-button>
            </div>
            <div class="table" v-if="pendingTransactionPageData.items.length > 0">
              <a-row class="table-header">
                <a-col :span="4">TIME</a-col>
                <a-col :span="6">TOKEN</a-col>
                <a-col :span="3">FROM</a-col>
                <a-col :span="3">TO</a-col>
                <a-col :span="4">STATUS</a-col>
                <a-col :span="4">ACTION</a-col>
              </a-row>
              <a-divider style="background-color: grey" />
              <a-row
                class="table-data"
                v-for="(item, i) in pendingTransactionPageData.items"
                :key="i"
                @click="openTransformDetail(item)"
              >
                <a-col :span="4"> {{ time.iso(+item.timestampBegin) }} </a-col>
                <a-col :span="6">
                  {{ recordName(item) + ': ' + BalanceService.humanLize(item.amount) }}
                </a-col>
                <a-col :span="3">{{ fromName(item) }}</a-col>
                <a-col :span="3">{{ toName(item) }}</a-col>
                <a-col :span="4">{{ stateName(item.state) }}</a-col>
                <a-col :span="4">
                  <a-button
                    v-if="item.direction == TransformingDirection.OmniverseToLocal"
                    class="button-blue"
                    @click.stop="claimOne(item)"
                    :loading="getActionLoading('claim:' + item.id)"
                    :disabled="
                      item.state != TransformingState.Claimable ||
                      getActionDisabled('claim:' + item.id)
                    "
                  >
                    CLAIM
                  </a-button>
                </a-col>
              </a-row>
              <a-pagination
                :current="pendingTransactionPageData.page + 1"
                v-model:page-size="pendingTransactionPageData.pageNumber"
                :total="pendingTransactionPageData.total"
                @change="changePendingHistory"
                show-less-items
              />
            </div>
            <div v-else>Looks like no transactions here yet</div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="Settled transactions">
          <div class="history-body">
            <div class="table" v-if="settledTransactionPageData.items.length > 0">
              <a-row class="table-header">
                <a-col :span="4">TIME</a-col>
                <a-col :span="6">TOKEN</a-col>
                <a-col :span="3">FROM</a-col>
                <a-col :span="3">TO</a-col>
                <a-col :span="4">STATUS</a-col>
              </a-row>
              <a-divider style="background-color: grey" />
              <a-row
                class="table-data"
                v-for="(item, i) in settledTransactionPageData.items"
                :key="i"
                @click="openTransformDetail(item)"
              >
                <a-col :span="4"> {{ time.iso(+item.timestampBegin) }} </a-col>
                <a-col :span="6">
                  {{ recordName(item) + ': ' + BalanceService.humanLize(item.amount) }}
                </a-col>
                <a-col :span="3">{{ fromName(item) }}</a-col>
                <a-col :span="3">{{ toName(item) }}</a-col>
                <a-col :span="4">{{ stateName(item.state) }}</a-col>
                <a-col :span="4"> </a-col>
              </a-row>
              <a-pagination
                :current="settledTransactionPageData.page + 1"
                v-model:page-size="settledTransactionPageData.pageNumber"
                :total="settledTransactionPageData.total"
                @change="changeSettledHistory"
                show-less-items
              />
            </div>
            <div v-else>Looks like no transactions here yet</div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-drawer>
  </main-layout>
</template>

<script lang="ts" setup>
import coinsrc from '@/assets/image/coin.webp';
import {
  RetweetOutlined,
  CaretDownOutlined,
  SearchOutlined,
  HistoryOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
} from '@ant-design/icons-vue';
import StepView from '@/components/step/StepView.vue';

import _ from 'lodash';
import type { Context } from '@opentelemetry/api';
import { ref, onMounted, onUnmounted, computed, nextTick, watch, type CSSProperties } from 'vue';
import { message } from 'ant-design-vue';
import store from '@/store/store';
import time from '@/lib/utils/time';
import decimal from '@/lib/utils/decimal';
import trace from '@/lib/utils/trace';
import request, { type Options } from '@/lib/request/request';
import OmniverseTransformerService from '@/lib/services/contract-services/omniverse-transformer-service';
import TransactionService from '@/lib/services/transaction-service';
import ERC20TokenService from '@/lib/services/contract-services/erc20-token-service';
import ConfigService from '@/lib/services/config-service';
import BalanceService from '@/lib/services/balance-service';
import AccountService from '@/lib/services/account-service';
import type { TransformerInfo } from '@/lib/models/server/transformer-info';
import transformerRequest from '@/lib/request/transformer-request';
import TransformRecord, {
  TransformingState,
  TransformingDirection,
} from '@/lib/models/transform/transform-record';
import TransformRecordPageData from '@/lib/models/transform/transform-record-page-data';

const isConnecting = ref(false);
const connectingAction = ref('');

const isChanging = ref(false);
const changingIndex = ref(-1);

const keyword = ref('');
const swapType = ref('up');
const searchType = ref('');
const isSearchOpen = ref(false);
const isConfirmOpen = ref(false);
const isHistoryOpen = ref(false);
const isTransactionDetailOpen = ref(false);
const confirmChecked = ref(false);
const activeKey = ref('1');

const transformerInfo = ref<TransformerInfo>();

const claimableNumber = ref('0');
const upAmount = ref('');
const downAmount = ref('');
const fees = ref<{
  ethNetFee: string;
  platformFee: string;
} | null>(null);

const upStep = ref(-1);
const upStatus = ref('process');
const downStep = ref(-1);
const downStatus = ref('process');

const transformIndex = ref(0);

let calculateGasFeeTime = 0;

const pendingTransactionPageData = ref<TransformRecordPageData>(new TransformRecordPageData());

const settledTransactionPageData = ref<TransformRecordPageData>(new TransformRecordPageData());

const transformingRecord = ref<TransformRecord>();

const currentCoin = computed(() => {
  return transformerInfo.value?.list[transformIndex.value].name;
});

const itemsStyle = computed(() => {
  const style: CSSProperties = {};
  if (swapType.value == 'up') {
    style.flexDirection = 'column';
  } else {
    style.flexDirection = 'column-reverse';
  }
  return style;
});

const searchTitle = computed(() => {
  if (searchType.value == 'l1' || searchType.value == 'l2') {
    return 'Select Network';
  }
  return 'Select Token';
});

const l1Balance = computed(() => {
  return transformerInfo.value?.list[transformIndex.value].localBalance ?? 0;
});

const isOverLimitL1 = computed(() => {
  const amount = BalanceService.withoutAccuracy(
    !isValidAmount(upAmount.value) ? 0 : upAmount.value,
  );
  const balance = decimal.sub(
    l1Balance.value,
    BalanceService.withoutAccuracy(fees.value?.ethNetFee ?? 0),
  );
  return decimal.compareTo(amount, balance) > 0 || +l1Balance.value == 0;
});

const l2Balance = computed(() => {
  return transformerInfo.value?.list[transformIndex.value].omniverseBalance ?? 0;
});

const isOverLimitL2 = computed(() => {
  const amount = BalanceService.withoutAccuracy(
    !isValidAmount(downAmount.value) ? 0 : downAmount.value,
  );
  const balance = decimal.sub(l2Balance.value, fees.value?.platformFee ?? 0);
  return decimal.compareTo(amount, balance) > 0 || +l2Balance.value == 0;
});

const from = computed(() => {
  return swapType.value == 'up' ? 'Ethereum' : currentCoin.value;
});
const to = computed(() => {
  return swapType.value == 'up' ? currentCoin.value : 'Ethereum';
});

const amount = computed(() => {
  return swapType.value == 'up' ? upAmount.value : downAmount.value;
});

watch(
  () => store.account,
  async (to, from) => {
    if (from == null && to) {
      afterAccountLoaded();
    } else {
      refreshBalances(transformIndex.value);
    }
  },
);

let intervalRefreshOmniverseBalance = setInterval(async () => {
  await refreshOmniverseBalance(transformIndex.value);
}, 60000);
let intervalRefreshEthBalance = setInterval(async () => {
  await refreshEthBalance(transformIndex.value);
}, 60000);

onMounted(async () => {
  transformerInfo.value = await transformerRequest.getTransformers();
  if (store.account && store.account.isComplete) {
    await afterAccountLoaded();
  }
});

onUnmounted(() => {
  clearInterval(intervalRefreshOmniverseBalance);
  clearInterval(intervalRefreshEthBalance);
});

const isValidAmount = function (amount: string) {
  return !(_.isEmpty(amount) || +amount == 0 || !decimal.isValidDecimal(amount));
};

const getActionLoading = function (action: string): boolean {
  if (connectingAction.value == action) {
    return isConnecting.value;
  }
  return false;
};
const getActionDisabled = function (action: string): boolean {
  if (connectingAction.value == action) {
    return false;
  }
  return isConnecting.value;
};

const afterAccountLoaded = async function () {
  const span = trace.startSpan('transform:afterAccountLoaded');
  const ctx = trace.contextFromParent(span);
  try {
    await switchNetwork(0, { ctx: ctx });
    await refreshBalances(transformIndex.value, { ctx: ctx });
  } finally {
    span.end();
  }
};

const switchNetwork = async function (i: number, options?: { ctx?: Context }) {
  const networks = await ConfigService.getNetworks(options);
  if (networks.length > 0) {
    await AccountService.switchNetwork(networks[0], options);
  }
};

const addTokenToMetamaskLoading = ref(false);
const addTokenToMetamask = async function () {
  if (addTokenToMetamaskLoading.value) {
    return;
  }
  try {
    addTokenToMetamaskLoading.value = true;
    const i = transformIndex.value;
    const asset = transformerInfo.value?.list[i];
    if (asset) {
      await AccountService.watchAsset(asset);
      message.success(`Add token ${asset.name} success`);
    }
  } finally {
    addTokenToMetamaskLoading.value = false;
  }
};

const refreshBalances = async function (i: number, options?: { ctx?: Context }) {
  await Promise.all([refreshOmniverseBalance(i, options), refreshEthBalance(i, options)]);
};

const refreshOmniverseBalance = async function (i: number, options?: { ctx?: Context }) {
  if (!transformerInfo.value?.list[i]) {
    return;
  }
  if (store.account && store.account.isComplete) {
    const span = trace.startSpan('transform:refreshOmniverseBalance', undefined, options?.ctx);
    const ctx = trace.contextFromParent(span);
    try {
      const coin = transformerInfo.value.list[i];
      const amount = await request.balanceOf(coin.omniToken, store.account.publicKey32, {
        ctx: ctx,
      });
      transformerInfo.value.list[i].omniverseBalance = amount;
    } finally {
      span.end();
    }
  } else {
    transformerInfo.value.list[i].omniverseBalance = '0';
  }
  //store.setTransformerInfo(transformerInfo.value);
};

const refreshEthBalance = async function (i: number, options?: { ctx?: Context }) {
  if (!transformerInfo.value?.list[i]) {
    return;
  }
  if (store.account && store.account.isComplete) {
    const span = trace.startSpan('transform:refreshEthBalance', undefined, options?.ctx);
    const ctx = trace.contextFromParent(span);
    try {
      const coin = transformerInfo.value.list[i];
      const transformerSvc = new OmniverseTransformerService(
        coin.transformerContract,
        store.account,
        {
          ctx: ctx,
        },
      );
      claimableNumber.value =
        (
          await transformerRequest.getClaimableNumber(
            { ethAccount: store.account.address },
            options,
          )
        ).count + '';
      const localTokenAddress = await transformerSvc.getLocalTokenAddress();
      const erc20Svc = new ERC20TokenService(localTokenAddress, store.account, { ctx: ctx });
      const balance = (await erc20Svc.balanceOf()).toString();
      transformerInfo.value.list[i].localBalance = balance;
    } finally {
      span.end();
    }
  } else {
    transformerInfo.value.list[i].localBalance = '0';
  }
  store.setTransformerInfo(transformerInfo.value);
};

const changeToken = async function (i: number) {
  if (isChanging.value) {
    return;
  }
  isChanging.value = true;
  changingIndex.value = i;
  const span = trace.startSpan('transform:change:token');
  const ctx = trace.contextFromParent(span);
  try {
    await switchNetwork(i, { ctx: ctx });
    await refreshBalances(i, { ctx: ctx });
    transformIndex.value = i;
    isSearchOpen.value = false;
  } finally {
    span.end();
    isChanging.value = false;
  }
};

const connect = async function () {
  store.showConnect();
};

const handleAmountInput = function () {
  nextTick(() => {
    upAmount.value = fixInputNumber(upAmount.value);
    downAmount.value = fixInputNumber(downAmount.value);
    calculateGasFeeDelay();
  });
};

const fixInputNumber = function (text: string): string {
  let s = text.replace(/[^0-9\\.]/g, '');
  let a = s.split('.');
  if (a.length > 2) {
    console.log(a);
    s = a.shift() + '.' + a.join('');
  }

  a = s.split('.');
  if (a[0].length > 30) {
    a[0] = a[0].substring(0, 30);
  }
  if (a[1] && a[1].length > 12) {
    a[1] = a[1].substring(0, 12);
  }
  s = a.join('.');
  return s;
};

const calculateGasFeeDelay = async function () {
  fees.value = null;

  calculateGasFeeTime = new Date().getTime();
  await time.sleep(1000);
  const now = new Date().getTime();
  if (now - calculateGasFeeTime > 900) {
    await calculateGasFee();
  }
};

const calculateGasFee = async function () {
  if (store.account?.isComplete) {
    if (swapType.value == 'up' && isValidAmount(upAmount.value)) {
      const transformer = new OmniverseTransformerService(
        transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
        store.account,
      );
      const fee = await transformer.getConvertToOmniverseGasFee();
      fees.value = fee;
      return fee;
    } else if (swapType.value == 'down' && isValidAmount(downAmount.value)) {
      const transformer = new OmniverseTransformerService(
        transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
        store.account,
      );
      const fee = await transformer.getConvertToLocalGasFee();
      fees.value = fee;
      return fee;
    }
  }
  fees.value = null;
};

const toMax = async function () {
  const fee = await calculateGasFee();
  if (swapType.value == 'up') {
    upAmount.value = BalanceService.withAccuracy(
      decimal.sub(l1Balance.value, BalanceService.withoutAccuracy(fee?.ethNetFee ?? '0')),
    );
  } else if (swapType.value == 'down') {
    downAmount.value = BalanceService.withAccuracy(
      decimal.sub(l2Balance.value, fee?.platformFee ?? '0'),
    );
  }
};

const change = function () {
  if (swapType.value == 'up') {
    swapType.value = 'down';
  } else {
    swapType.value = 'up';
  }
  upAmount.value = '0';
  downAmount.value = '0';
  fees.value = null;
};

const openSearch = function (type: string) {
  isSearchOpen.value = true;
  searchType.value = type;
};

const up = async function () {
  const account = store.account;
  if (!account?.isComplete) {
    return;
  }
  if (upAmount.value == '' || +upAmount.value == 0) {
    message.error('Please enter your amount');
    return;
  }
  const span = trace.startSpan('transform:up');
  span.setAttribute('transform.amount', upAmount.value);
  span.setAttribute(
    'transform.address',
    transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
  );
  span.setAttribute('transform.name', transformerInfo.value?.list[transformIndex.value].name ?? '');
  span.setAttribute(
    'transform.local',
    transformerInfo.value?.list[transformIndex.value].localToken ?? '',
  );
  span.setAttribute(
    'transform.localBalance',
    transformerInfo.value?.list[transformIndex.value].localBalance ?? '',
  );
  span.setAttribute(
    'transform.omniverse',
    transformerInfo.value?.list[transformIndex.value].omniToken ?? '',
  );
  span.setAttribute(
    'transform.omniverseBalance',
    transformerInfo.value?.list[transformIndex.value].omniverseBalance ?? '',
  );
  const ctx = trace.contextFromParent(span);
  try {
    isConnecting.value = true;
    span.setAttribute('account.address', account.address);
    span.setAttribute('account.publicKey32', account.publicKey32);
    upStatus.value = 'wait';
    upStep.value = 0;
    await switchNetwork(transformIndex.value, { ctx: ctx });
    upStep.value = 1;
    const transformer = new OmniverseTransformerService(
      transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
      account,
      { ctx: ctx },
    );
    const localTokenAddress = await transformer.getLocalTokenAddress();
    const erc20 = new ERC20TokenService(localTokenAddress, account, { ctx: ctx });
    const tx = await erc20.approve(
      transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
      BalanceService.withoutAccuracy(upAmount.value),
    );
    upStep.value = 2;
    if (tx) {
      await erc20.waitForTransactionReceipt(tx as unknown as string);
    }
    upStep.value = 3;
    await transformer.convertToOmniverse(BalanceService.withoutAccuracy(upAmount.value));
    upStep.value = 4;
    //const transformService = new TransformService({ ctx: ctx });
    // await transformService.up({
    //   account: account,
    //   transformerAddress: transformerInfo.value?.list[transformIndex.value].transformer ?? '',
    //   amount: BalanceService.withoutAccuracy(upAmount.value),
    // });
    upAmount.value = '0';
  } catch (e) {
    upStatus.value = 'error';
    trace.recordError(span, _.get(e, 'message') ?? 'unknown');
    throw e;
  } finally {
    span.end();
    isConnecting.value = false;
  }
  message.success('transaction success');
};

const down = async function () {
  const account = store.account;
  if (!account?.isComplete) {
    return;
  }
  if (downAmount.value == '' || +downAmount.value == 0) {
    message.error('Please enter your amount');
    return;
  }
  const span = trace.startSpan('transform:down');
  span.setAttribute('transform.amount', downAmount.value);
  span.setAttribute(
    'transform.address',
    transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
  );
  span.setAttribute('transform.name', transformerInfo.value?.list[transformIndex.value].name ?? '');
  span.setAttribute(
    'transform.local',
    transformerInfo.value?.list[transformIndex.value].localToken ?? '',
  );
  span.setAttribute(
    'transform.localBalance',
    transformerInfo.value?.list[transformIndex.value].localBalance ?? '',
  );
  span.setAttribute(
    'transform.omniverse',
    transformerInfo.value?.list[transformIndex.value].omniToken ?? '',
  );
  span.setAttribute(
    'transform.omniverseBalance',
    transformerInfo.value?.list[transformIndex.value].omniverseBalance ?? '',
  );
  const ctx = trace.contextFromParent(span);
  try {
    isConnecting.value = true;
    span.setAttribute('account.address', account.address);
    span.setAttribute('account.publicKey32', account.publicKey32);

    downStatus.value = 'wait';
    downStep.value = 0;
    await switchNetwork(transformIndex.value, { ctx: ctx });

    downStep.value = 1;
    const transformer = new OmniverseTransformerService(
      transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
      account,
      { ctx: ctx },
    );
    const target = await transformer.getPubkey();
    const txData = await TransactionService.constructTransfer(
      {
        accountAddress: account.address,
        chainId: account.chainId,
        publicKey32: account.publicKey32,
        assetId: transformerInfo.value?.list[transformIndex.value].omniToken ?? '',
        outputs: [
          {
            address: target,
            amount: BalanceService.withoutAccuracy(downAmount.value),
          },
        ],
      },
      { ctx: ctx },
    );

    downStep.value = 2;
    await transformer.convertToLocal(txData);

    await TransactionService.sendTransaction('Transfer', txData, { ctx: ctx });
    downStep.value = 3;

    /*
    const transformService = new TransformService({ ctx: ctx });
    await transformService.down({
      transformerAddress: transformerInfo.value?.list[transformIndex.value].transformer ?? '',
      account: account,
      amount: BalanceService.withoutAccuracy(downAmount.value),
      tokenAssetId: transformerInfo.value?.list[transformIndex.value].omniverse ?? '',
    });
    */
    downAmount.value = '0';
    downStatus.value = 'finish';
    message.success('transaction success');
  } catch (e) {
    downStatus.value = 'error';
    trace.recordError(span, _.get(e, 'message') ?? 'unknown');
    //message.error(_.get(e, 'message') ?? 'unknown');
    throw e;
  } finally {
    span.end();
    isConnecting.value = false;
  }
};

const transformClick = async function () {
  await calculateGasFee();
  downStep.value = -1;
  upStep.value = -1;
  downStatus.value = 'wait';
  upStatus.value = 'wait';
  isConfirmOpen.value = true;
};

const confirmClick = async function () {
  if (swapType.value == 'up') {
    await up();
  } else if (swapType.value == 'down') {
    await down();
  }
  isConfirmOpen.value = false;
  await time.sleep(1000);
  await refreshBalances(transformIndex.value);
  await time.sleep(5000);
  await refreshBalances(transformIndex.value);
};

const openHistory = async function () {
  const account = store.account;
  if (!account?.isComplete) {
    return;
  }
  isHistoryOpen.value = true;
  await refreshHistory();
};

const refreshHistory = async function (options?: Options) {
  const account = store.account;
  const item = transformerInfo.value?.list[transformIndex.value];
  if (account && item) {
    pendingTransactionPageData.value = await transformerRequest.getPendingRecords(
      { ethAccount: account.address, page: pendingTransactionPageData.value.page },
      options,
    );
    console.log('pendingTransactionPageData.value: ', pendingTransactionPageData.value);
    settledTransactionPageData.value = await transformerRequest.getSettledRecords(
      { ethAccount: account.address, page: pendingTransactionPageData.value.page },
      options,
    );

    //const transformer = new OmniverseTransformerService(item.transformerContract, account, options);
    claimableNumber.value =
      (await transformerRequest.getClaimableNumber({ ethAccount: account.address }, options))
        .count + '';
    //pendingTransactionPageData.value = await transformer.getTransformingRecords(false);
    //settledTransactionPageData.value = await transformer.getTransformingRecords(true);
  }
};

const changePendingHistory = async function (page: number, pageSize: number) {
  if (store.account) {
    pendingTransactionPageData.value = await transformerRequest.getPendingRecords({
      ethAccount: store.account.address,
      page: page - 1,
    });
  }
};

const changeSettledHistory = async function (page: number, pageSize: number) {
  if (store.account) {
    settledTransactionPageData.value = await transformerRequest.getSettledRecords({
      ethAccount: store.account.address,
      page: page - 1,
    });
  }
};

const claimAll = async function () {
  const account = store.account;
  if (!account?.isComplete) {
    return;
  }
  connectingAction.value = 'claim:all';
  const span = trace.startSpan('claim:all');
  const ctx = trace.contextFromParent(span);
  span.setAttribute('transform.name', transformerInfo.value?.list[transformIndex.value].name ?? '');
  span.setAttribute(
    'transform.address',
    transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
  );
  try {
    isConnecting.value = true;
    span.setAttribute('account.address', account.address);
    span.setAttribute('account.publicKey32', account.publicKey32);
    const transformer = new OmniverseTransformerService(
      transformerInfo.value?.list[transformIndex.value].transformerContract ?? '',
      account,
      {
        ctx: ctx,
      },
    );
    await transformer.claimAll();
    const originRecords = pendingTransactionPageData.value.items;
    for (let i = 0; i < 12; i++) {
      await time.sleep(5000);
      await refreshHistory({ ctx: ctx });
      let has = false;
      let changed = false;
      for (const originRecord of originRecords) {
        for (const record of pendingTransactionPageData.value.items) {
          if (originRecord.id == record.id) {
            has = true;
            if (record.state != originRecord.state) {
              changed = true;
            }
          }
        }
      }
      if (!has || changed) {
        break;
      }
    }
  } finally {
    span.end();
    isConnecting.value = false;
  }
};

const claimOne = async function (transformingRecord: TransformRecord) {
  const account = store.account;
  if (!account?.isComplete) {
    return;
  }
  const transform = store.getTransform(transformingRecord.transformerId);
  connectingAction.value = 'claim:' + transformingRecord.id;
  const span = trace.startSpan('claim:one');
  const ctx = trace.contextFromParent(span);
  span.setAttribute('transform.name', transform?.name ?? '');
  span.setAttribute('transform.address', transform?.transformerContract ?? '');
  span.setAttribute('claim.id', transformingRecord.id);
  span.setAttribute('claim.amount', transformingRecord.amount);
  try {
    isConnecting.value = true;
    const transformer = new OmniverseTransformerService(
      transform?.transformerContract ?? '',
      account,
      {
        ctx: ctx,
      },
    );
    await transformer.claim(
      transformingRecord.id.split('#')[transformingRecord.id.split('#').length - 1],
    );
    for (let i = 0; i < 20; i++) {
      await time.sleep(5000);
      await refreshHistory({ ctx: ctx });
      let has = false;
      let changed = false;
      for (const record of pendingTransactionPageData.value.items) {
        if (record.id == transformingRecord.id) {
          has = true;
          if (record.state != transformingRecord.state) {
            changed = true;
          }
        }
      }
      if (!has || changed) {
        break;
      }
    }
  } finally {
    span.end();
    isConnecting.value = false;
  }
};

const openTransformDetail = async function (data: TransformRecord) {
  isTransactionDetailOpen.value = true;
  transformingRecord.value = data;
};

const recordName = function (record: TransformRecord) {
  return store.getTransform(record.transformerId)?.name;
};

const fromName = function (record: TransformRecord) {
  return record.direction == TransformingDirection.LocalToOmniverse
    ? 'eth'
    : store.getTransform(record.transformerId)?.name;
};

const toName = function (record: TransformRecord) {
  return record.direction == TransformingDirection.LocalToOmniverse
    ? store.getTransform(record.transformerId)?.name
    : 'eth';
};

const stateName = function (state: TransformingState) {
  if (state == TransformingState.Pending) {
    return 'pending';
  } else if (state == TransformingState.Claimable) {
    return 'claimable';
  } else if (state == TransformingState.Settled) {
    return 'settled';
  }
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.swap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  .search-bar {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
    width: 800px;
    background: @secondaryBackgroundColor;
    height: 50px;
    border: 1px solid #858585;
    border-radius: 5px;
    gap: 10px;
    .title {
      flex-grow: 1;
      text-align: left;
    }
  }
  .search-bar-active {
    background-color: #1b4add;
  }

  .change-card {
    width: 800px;
    background: @secondaryBackgroundColor;
    border: 1px solid #858585;
    border-radius: 5px;
    padding: 20px;
    .title {
      font-size: 26px;
      text-align: left;
    }
    .exchange-items {
      display: flex;
      .change-button {
        .change-icon {
          transform: rotate(90deg);
        }
      }
      .l1,
      .l2 {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        border-radius: 5px;
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 22px;
        }
        .body {
          .error {
            text-align: left;
            padding: 5px 0;
          }
        }
      }
      .l1 {
        border: 1px solid #1b4add;
        background-color: #1a2d67;
      }
      .l2 {
        border: 1px solid #454a75;
        background-color: #2b2d3e;
      }
    }
    .gas-fees {
      .row {
        padding: 5px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}

.modal-body {
  .search {
    border: 1px solid gray;
    border-radius: 5px;
  }
  .list {
    border: 1px solid gray;
    border-radius: 5px;
    min-height: 300px;
    padding: 5px 0;
    .item {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px;
      .avatar {
        width: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .content {
        flex-grow: 1;
        .name {
          font-size: 16px;
        }
        .description {
          font-size: 12px;
        }
      }
      .tail {
        width: 80px;
      }
    }
    .item:hover {
      background-color: @secondaryBackgroundColor;
    }
  }
}

.confirm-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .time {
    text-align: right;
    color: gray;
  }
  .row {
    display: flex;
    justify-content: space-between;
  }
  .row-start {
    display: flex;
    gap: 10px;
    align-items: start;
  }
  .row-center {
    display: flex;
    justify-content: center;
  }
}

.history-body {
  background-color: @secondaryBackgroundColor;
  padding: 10px 20px;
  .history-notify {
    font-size: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 0;
  }
  .table {
    .table-header {
      font-weight: bold;
    }
    .table-header:deep(.ant-col) {
      font-size: 20px;
    }
    .table-data {
      cursor: pointer;
      font-size: 16px;
      align-items: center;
      padding: 20px 0;
    }
    .table-data:deep(.ant-col) {
      font-size: 16px;
    }
    .table-data:hover {
      background-color: @primaryBackgroundColor;
    }
  }
}

.tarnsaction-detail-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .card {
    border: 1px solid gray;
    border-radius: 5px;
    padding: 10px;
    font-size: 18px;
    .direction {
      display: flex;
      gap: 10px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      .state {
        display: flex;
        align-items: center;
        gap: 10px;
        .ok {
          width: 10px;
          height: 10px;
          background-color: greenyellow;
          border: 1px solid white;
          border-radius: 5px;
        }
        .no {
          width: 10px;
          height: 10px;
          border: 1px solid white;
          border-radius: 5px;
        }
      }
    }
  }
}
.history {
  background-color: @primaryBackgroundColor;
  color: white;
}
</style>
