<template>
  <div class="tokens">
    <div class="data">
      <a-row align="middle" style="text-align: left; height: 50px; font-weight: bold">
        <a-col :span="3">Token List</a-col>
        <a-col :span="3">
          {{ props.isSelf ? 'Amount' : 'Current Supply' }}
        </a-col>
        <a-col :span="12">Progress</a-col>
        <a-col :span="3">Status</a-col>
        <a-col :span="3">Actions</a-col>
      </a-row>
      <a-row
        v-for="(item, i) in list"
        :key="i"
        @click="openToken(item)"
        align="middle"
        style="
          text-align: left;
          min-height: 50px;
          font-weight: bold;
          background: #1b1d21;
          margin-bottom: 5px;
        "
      >
        <a-col :span="1">
          <div style="display: flex; justify-content: center">
            <a-image
              :src="coinsrc"
              alt="''"
              :width="20"
              :height="20"
              style="border-radius: 10px"
              :preview="false"
            />
          </div>
        </a-col>
        <a-col
          :span="2"
          style="
            word-break: break-all;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 10px;
          "
          >{{ item.name }}</a-col
        >
        <a-col
          :span="3"
          style="
            word-break: break-all;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 10px;
          "
        >
          {{ BalanceService.humanLize(item.amount) }}
        </a-col>
        <a-col :span="15" style="padding-right: 25px">
          <a-progress
            :percent="+((item.progress / 10000) * 100).toFixed(2)"
            :strokeColor="'#ff7700'"
            :trailColor="'#25272c'"
          />
        </a-col>
        <a-col :span="3" style="word-break: keep-all; white-space: nowrap">
          <a-button v-if="isSelf" class="button-default-outlined" @click.stop="transferClick(item)">
            send
          </a-button>
          <a-button
            class="button-default-outlined"
            v-if="!isTokenMinted(item)"
            @click.stop="!isTokenMinted(item) ? openMint(item) : null"
            :style="isTokenMinted(item) ? { color: 'grey', cursor: 'default' } : {}"
          >
            mint
          </a-button>
        </a-col>
      </a-row>
      <table class="table" v-if="false">
        <tr class="title-row">
          <th>Token List</th>
          <th>{{ props.isSelf ? 'Amount' : 'Current Supply' }}</th>
          <th>Progress</th>
          <th v-if="!props.isSelf">Status</th>
          <th>Actions</th>
        </tr>
        <tr class="data-row" v-for="(item, i) in list" :key="i" @click="openToken(item)">
          <td>{{ item.name }}</td>
          <td>{{ item.amount }}</td>
          <td class="progress">
            <a-progress
              :percent="+((item.progress / 10000) * 100).toFixed(2)"
              :strokeColor="'#ff7700'"
              :trailColor="'#25272c'"
            />
          </td>
          <td class="action">
            <span>
              <a-button class="button-default-outlined" @click.stop="transferClick(item)">
                send
              </a-button>
            </span>
            <span>
              <a-button
                class="button-default-outlined"
                v-if="!isTokenMinted(item)"
                @click.stop="!isTokenMinted(item) ? openMint(item) : null"
                :style="isTokenMinted(item) ? { color: 'grey', cursor: 'default' } : {}"
              >
                mint
              </a-button>
            </span>
          </td>
        </tr>
      </table>
      <a-empty v-if="list.length == 0 && !loading"></a-empty>
      <a-spin v-if="loading"></a-spin>
      <a-pagination
        v-if="!isSelf && limit == 0"
        v-model:current="page"
        v-model:page-size="pageSize"
        :total="total"
        :show-total="(total: number) => `Total:${total}`"
        :show-size-changer="false"
        @change="changePage"
        show-less-items
      />
    </div>
    <div class="want">
      Want to Deploy your own Omniverse Token,
      <a-button class="button-default" @click="openDeploy">click here</a-button>
    </div>
    <a-modal
      class="modal"
      v-model:open="transferOpen"
      :mask-closable="false"
      :title="`transfer: ${currentToken?.name}`"
    >
      <div class="modal-body">
        <div v-for="(output, i) in outputs" :key="i" class="output-row">
          <a-input v-model:value="output.address" placeholder="address"></a-input>
          <a-input v-model:value="output.amount" placeholder="amount"></a-input>
          <a-button class="button-default" @click="deleteOutput(i)">-</a-button>
        </div>
        <div class="plus">
          <a-button class="button-default" @click="insertOutput">+</a-button>
        </div>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button
            class="button-default"
            @click="currentToken == null ? null : transfer(currentToken)"
            :loading="buttonLoading"
          >
            Submit
          </a-button>
        </div>
      </template>
    </a-modal>
    <deploy-modal
      ref="deployModalRef"
      v-model:visible="mintOpen"
      :token="currentToken"
    ></deploy-modal>
  </div>
</template>

<script lang="ts" setup>
import DeployModal from '@/components/modal/DeployModal.vue';
import coinsrc from '@/assets/image/coin.webp';

import _ from 'lodash';
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import request from '@/lib/request/request';
import store from '@/store/store';
import time from '@/lib/utils/time';
import decimal from '@/lib/utils/decimal';
import AccountService from '@/lib/services/account-service';
import TransactionService from '@/lib/services/transaction-service';
import ConfigService from '@/lib/services/config-service';
import MetamaskService from '@/lib/services/metamask-service';
import BalanceService from '@/lib/services/balance-service';
import type { IToken } from '@/lib/models/token/token';
import type { IOutput } from '@/lib/models/token/output';

import router from '@/router';

const props = defineProps({
  isSelf: { type: Boolean, default: false },
  limit: { type: Number, default: 0 },
});

const loading = ref(false);
const buttonLoading = ref(false);
const page = ref(1);
const pageSize = ref(25);
const total = ref(0);
const list = ref<IToken[]>([]);
const mainToken = ref<IToken>();
const deployModalRef = ref();

const transferOpen = ref(false);
const mintOpen = ref(false);
const currentToken = ref<IToken | undefined>();
const outputs = ref<IOutput[]>([
  {
    amount: '',
    address: '',
  },
]);

onMounted(async () => {
  await current();
});

let lastCurrentPublicKey: string | undefined;
watch(store, async (to) => {
  if (to.account) {
    if (lastCurrentPublicKey !== to.account?.publicKey) {
      lastCurrentPublicKey = to.account?.publicKey;
      if (props.isSelf) {
        if (to.account?.publicKey != '') {
          list.value = await request.rpc('getAccountInfo', [to.account?.publicKey32]);
          list.value.forEach((item) => {
            if (item.assetId.replace('0', '') == 'x') {
              mainToken.value = item;
            }
          });
        }
      }
    }
  }
});

const isTokenMinted = function (token: IToken): boolean {
  return token.progress >= 10000;
};

const current = async function () {
  if (!props.isSelf) {
    try {
      loading.value = true;
      const { data, totalNumber, numberPerPage } = await request.rpc('getTokenList', [page.value]);
      list.value = data;
      total.value = totalNumber;
      pageSize.value = numberPerPage;
      list.value.forEach((item) => {
        if (item.assetId.replace('0', '') == 'x') {
          mainToken.value = item;
        }
      });
      if (props.limit > 0) {
        list.value = list.value.slice(0, props.limit);
      }
    } finally {
      loading.value = false;
    }
  } else {
    list.value = await request.rpc('getAccountInfo', [store.account?.publicKey32]);
    list.value.forEach((item) => {
      if (item.assetId.replace('0', '') == 'x') {
        mainToken.value = item;
      }
    });
  }
};

const changePage = async function (nextPage: number, nextPageSize: number) {
  if (loading.value) {
    return;
  }
  try {
    loading.value = true;
    const { data, totalNumber, numberPerPage } = await request.rpc('getTokenList', [nextPage]);
    list.value = data;
    page.value = nextPage;
    pageSize.value = numberPerPage;
    total.value = totalNumber;
  } finally {
    loading.value = false;
  }
  console.log(nextPageSize);
};

const transferClick = function (token: IToken) {
  if (!store.checkLogin()) {
    return;
  }
  transferOpen.value = true;
  currentToken.value = token;
  outputs.value = [
    {
      amount: '',
      address: '',
    },
  ];
};

const insertOutput = function () {
  outputs.value.push({
    amount: '',
    address: '',
  });
};

const deleteOutput = function (i: number) {
  outputs.value.splice(i, 1);
};

const transfer = async function (token: IToken) {
  if (!store.checkLogin()) {
    return;
  }
  if (buttonLoading.value) {
    return;
  }
  for (const i in outputs.value) {
    const output = outputs.value[i];
    if (
      !(
        output.address.startsWith('0x') &&
        output.address.length == store.account?.publicKey32.length
      )
    ) {
      message.error('address must be a valid account public key');
      return;
    }
    if (!decimal.isValidDecimal(output.amount)) {
      message.error('amount must be a number');
      return;
    }
  }

  try {
    buttonLoading.value = true;
    const chainId = (await ConfigService.getServerInfo()).eip712.chainId;
    const currentChainId = await MetamaskService.ethChainId();
    if (currentChainId != chainId) {
      try {
        await MetamaskService.switchEthereumChain(chainId);
      } catch (e) {
        message.error(_.get(e, 'message'));
      }
    }
    await TransactionService.transfer({
      account: store.account?.address ?? '',
      chainId: chainId,
      publicKey32: store.account?.publicKey32 ?? '',
      assetId: token.assetId,
      outputs: outputs.value.map((item) => {
        return {
          address: item.address,
          amount: BalanceService.withoutAccuracy(item.amount),
        };
      }),
    });
  } finally {
    buttonLoading.value = false;
  }

  message.success('transfer success');
  transferOpen.value = false;
  await time.sleep(2000);
  await current();
};

const openDeploy = async function () {
  if (!store.checkLogin()) {
    return;
  }
  const networks = await ConfigService.getNetworks();
  AccountService.switchNetwork(networks[0]);
  deployModalRef.value.changeType('deploy');
  mintOpen.value = true;
};
const openMint = async function (token: IToken) {
  AccountService.connect();
  const networks = await ConfigService.getNetworks();
  AccountService.switchNetwork(networks[0]);
  deployModalRef.value.changeType('mint');
  deployModalRef.value.changeToken(token);
  mintOpen.value = true;
};

const openToken = function (token: IToken) {
  router.push({
    name: 'token_info',
    query: { id: token.assetId },
  });
};
</script>

<style lang="less" scoped>
.tokens {
  display: flex;
  flex-direction: column;
  gap: 5px;
  .name {
    display: flex;
    color: #ff7700;
    font-weight: bold;
    font-size: 16px;
  }
  .want {
    text-align: left;
    font-size: large;
    font-weight: bold;
  }
  .data {
    background-color: #25272c;
    padding: 0 10px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    .table {
      flex-grow: 1;
      th,
      td {
        font-size: 14p;
        text-align: left;
        height: 50px;
        padding: 5px;
      }
      .data-row {
        font-size: 12px;
        color: white;
        background-color: #1b1d21;
        border-bottom: 5px solid #25272c;
        .asset-id {
          span {
            display: block;
            width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .progress {
          width: 350px;
          padding-right: 50px;
        }
        .status {
          .button-minted,
          .button-gradient {
            font-weight: bold;
          }
        }
        .action {
          display: flex;
          color: #333333;
          gap: 15px;
          font-size: 14px;
          align-items: center;
          span {
            a {
              color: #ff7700;
            }
          }
        }
        .button-minted {
          background-color: #ff7700;
          color: white;
          border: none;
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
.modal {
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .output-row {
      display: flex;
      gap: 10px;
    }
    .plus {
    }
  }
}
</style>
