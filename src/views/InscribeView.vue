<template>
  <main-layout>
    <div class="inscribe">
      <h1 class="h1">KARANA Inscribe</h1>
      <h2 class="h2"><a>How to inscribe?</a></h2>
      <div class="inscribe-card">
        <div class="row">
          <div class="col label">Types</div>
          <div class="col">
            <a-radio-group v-model:value="type" name="radioGroup" class="radio-group">
              <a-radio value="mint" class="redio-item">Mint</a-radio>
              <a-radio value="deploy" class="redio-item">Deploy</a-radio>
            </a-radio-group>
          </div>
        </div>
        <br />
        <br />
        <template v-if="type == 'deploy'">
          <div class="row">
            <div class="col label">Tick</div>
            <div class="col">
              <a-input
                v-model:value="deployForm.name"
                @change="changeDeployName"
                class="text-field"
                placeholder='2-8 characters like "ab" ...'
              >
              </a-input>
            </div>
          </div>
          <div class="row">
            <div class="col label"></div>
            <div class="col error">
              {{ deployError.name }}
            </div>
          </div>
          <br />
          <br />
          <div class="row">
            <div class="col label">Total Supply</div>
            <div class="col">
              <a-input
                v-model:value="deployForm.totalSupply"
                @change="changeDeployTotalSupply"
                class="text-field"
                placeholder="Total Supply amount ..."
              ></a-input>
            </div>
          </div>
          <div class="row">
            <div class="col label"></div>
            <div class="col error">
              {{ deployError.totalSupply }}
            </div>
          </div>
          <br />
          <br />
          <div class="row">
            <div class="col label">Per-Mint Amount</div>
            <div class="col">
              <a-input
                v-model:value="deployForm.mintAmount"
                @change="changeDeployMintAmount"
                class="text-field"
                placeholder="Limit Amount ..."
              ></a-input>
            </div>
          </div>
          <div class="row">
            <div class="col label"></div>
            <div class="col error">
              {{ deployError.mintAmount }}
            </div>
          </div>
          <div class="row">
            <div class="col label">Network Fee</div>
            <div class="col"></div>
          </div>
        </template>
        <template v-if="type == 'mint'">
          <div class="row">
            <div class="col label">Tick</div>
            <div class="col">
              <a-dropdown :open="dropDownOpen" class="dropdown">
                <a-input
                  v-model:value="mintForm.tick"
                  class="text-field"
                  placeholder="2-8 characters like 'ab' ..."
                  @change="mintSearch"
                  @blur="console.log(mintDropdownClose)"
                >
                </a-input>
                <template #overlay>
                  <div class="overlay">
                    <div
                      v-for="(token, i) in tokens"
                      :key="i"
                      @click.stop="mintSelect(i)"
                      class="token-item"
                    >
                      <div class="name">{{ token.tokenName }}</div>
                      <div class="detail">
                        <div class="left">
                          <div class="col row">
                            <div class="col">Supply:</div>
                            <div class="col">{{ BalanceService.humanLize(token.totalSupply) }}</div>
                          </div>
                          <div class="col row">
                            <div class="col">Limit Per Mint:</div>
                            <div class="col">{{ BalanceService.humanLize(token.mintAmount) }}</div>
                          </div>
                        </div>
                        <div class="right">
                          <div class="col row">
                            <div class="col">Minted:</div>
                            <div class="col">
                              {{ BalanceService.humanLize(token.currentSupply) }}
                            </div>
                          </div>
                          <div class="col row">
                            <div class="col">Holders:</div>
                            <div class="col">{{ token.holderCount }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </a-dropdown>
              <!--
              <a-select
                :searchValue="mintForm.tick"
                :open="dropDownOpen"
                class="select"
                showSearch
                option-label-prop="label"
                placeholder="2-8 characters like 'ab' ..."
                :auto-clear-search-value="false"
                @input="mintSearch"
                @blur="mintDropdownClose"
              >
                <template v-for="(token, i) in tokens" :key="i">
                  <a-select-option :value="token.assetId" :label="token.tokenName">
                    <div @click.stop="mintSelect(i)">
                      <div>{{ token.tokenName }}</div>
                      <div class="detail">
                        <div class="left">
                          <div>Supply:</div>
                          <div>{{ token.totalSupply }}</div>
                        </div>
                        <div class="right">
                          <div>Supply:</div>
                          <div>{{ token.totalSupply }}</div>
                        </div>
                      </div>
                    </div>
                  </a-select-option>
                </template>
              </a-select>-->
            </div>
          </div>
          <div class="row">
            <div class="col label"></div>
            <div class="col error">
              {{ mintError.tick }}
            </div>
          </div>
          <br />
          <br />
          <div class="row">
            <div class="col label">Amount</div>
            <div class="col">
              <a-input
                v-model:value="mintForm.amount"
                @change="changeMintAmount"
                class="text-field"
                placeholder="mint amount"
              >
              </a-input>
            </div>
          </div>
          <div class="row">
            <div class="col label"></div>
            <div class="col error">
              {{ mintError.amount }}
            </div>
          </div>
          <br />
          <br />
          <div class="row repeat-mint">
            <div class="col label">Repeat Mint</div>
            <div class="col input">
              <a-slider class="slider" v-model:value="mintForm.repeatMint" :min="1" :max="20" />
              <a-input-number
                class="slider-number"
                v-model:value="mintForm.repeatMint"
              ></a-input-number>
              <a-button class="button-yellow action">Max 10</a-button>
            </div>
          </div>
          <br />
          <br />
        </template>
        <div class="row">
          <div class="col label"></div>
          <div class="col">
            <div class="fees">
              <div class="fee">
                <div class="fee-type">Network Fee:</div>
                <div class="fee-value">
                  {{ BalanceService.humanLize(feeData.networkFee) }}
                  karana
                </div>
              </div>
              <div class="fee">
                <div class="fee-type">ServiceFee:</div>
                <div class="fee-value">
                  {{ BalanceService.humanLize(feeData.serviceFee) }}
                </div>
              </div>
              <a-divider class="divider" />
              <div class="total">
                <div class="fee-type">Total:</div>
                <div class="fee-value">
                  {{
                    BalanceService.humanLize(decimal.add(feeData.serviceFee, feeData.networkFee))
                  }}
                  karana
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="comment">
          In case of platform order congestion, there might be delays in on-chain processing, and we
          cannot guarantee the on-chain processing time
        </div>
        <div class="row">
          <div class="col label"></div>
          <div class="col action">
            <a-button class="button-yellow button-submit" @click="openConfirm"
              >Submit & Pay invoice</a-button
            >
          </div>
        </div>
      </div>
      <div class="activities"></div>
    </div>
    <a-modal v-model:open="isConfirmOpen" :footer="null" :destroyOnClose="true" width="1000px">
      <div class="confirm-body">
        <div class="title-icon">
          <ClockCircleOutlined />
        </div>
        <h1>Waiting on Payment in {{ time.formatTime(timeLeft) }}</h1>
        <br />
        <br />
        <br />
        <div class="fees">
          <div class="fee">
            <div>Total(Karana)</div>
            <div class="amount">
              {{ BalanceService.humanLize(decimal.add(feeData.serviceFee, feeData.networkFee)) }}
            </div>
          </div>
          <div class="fee">
            <div>Network Fee</div>
            <div class="amount">{{ BalanceService.humanLize(feeData.networkFee) }}</div>
          </div>
          <div class="fee">
            <div>Service Fee</div>
            <div class="amount">{{ BalanceService.humanLize(feeData.serviceFee) }}</div>
          </div>
        </div>
        <br />
        <br />
        <div class="operation">
          <div class="action">
            <a-button class="button button-yellow" @click="confirm">Pay With Wallet</a-button>
          </div>
          <div class="loading">
            <loading-icon v-if="loading" class="icon"></loading-icon>
          </div>
          <div class="payment">
            <div class="balance">
              <div>Balance:</div>
              <div>{{ balance == '' ? '' : BalanceService.humanLize(balance) }}</div>
            </div>
            <div class="address">
              <div>Payment Address:</div>
              <div>{{ paymentAddress }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import LoadingIcon from '@/components/basic/icon/LoadingIcon.vue';
import { ClockCircleOutlined, SearchOutlined } from '@ant-design/icons-vue';

import _ from 'lodash';
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import store from '@/store/store';
import hex from '@/lib/utils/hex';
import decimal from '@/lib/utils/decimal';
import time from '@/lib/utils/time';
import Config from '@/lib/config/config';
import request from '@/lib/request/request';
import ConfigService from '@/lib/services/config-service';
import MetamaskService from '@/lib/services/metamask-service';
import TransactionService from '@/lib/services/transaction-service';
import BalanceService from '@/lib/services/balance-service';
import type { IToken } from '@/lib/models/token/token';
import { createModels } from '@/lib/models/model';
import Token from '@/lib/models/token/token';
import Decimal from 'decimal.js';

class DeployForm {
  name = '';
  totalSupply = '';
  mintAmount = '';
  salt = '';
}

class DeployError {
  name = '';
  totalSupply = '';
  mintAmount = '';
  get ok() {
    if (this.name == '' && this.totalSupply == '' && this.mintAmount == '') {
      return true;
    }
    return false;
  }
}

class MintForm {
  token: Token | null = null;
  tick = '';
  assetId = '';
  amount = '';
  repeatMint = 1;
}

class MintError {
  tick = '';
  amount = '';
  get ok() {
    if (this.tick == '' && this.amount == '') {
      return true;
    }
    return false;
  }
}

const type = ref('deploy');
const visible = defineModel('visible', { default: false });
const isConfirmOpen = ref(false);
const buttonLoading = ref(false);
const loading = ref(false);
const deployForm = ref(new DeployForm());
const deployError = ref(new DeployError());
const mintForm = ref(new MintForm());
const mintError = ref(new MintError());
const tokens = ref<Token[]>([]);
const searchValue = ref<string>('');
const dropDownOpen = ref(false);

const deployFeeData = ref({
  networkFee: '',
  serviceFee: '',
});

const mintFeeData = ref({
  networkFee: '',
  serviceFee: '',
});

const balance = ref('');
const paymentAddress = ref('');

const feeData = computed(() => {
  return type.value == 'deploy' ? deployFeeData.value : mintFeeData.value;
});

const timeLeft = ref(7200);

let interval: any;

onMounted(async () => {
  interval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    }
  }, 1000);
  console.log('mounted');
});

onUnmounted(async () => {
  clearInterval(interval);
});

const fetchDeployFee = async function () {
  const data = await request.get(Config.nextUrl + '/v1/token/deploy/fee', { tokenName: 'abcd' });
  deployFeeData.value.networkFee = _.get(data, ['networkFee']);
  deployFeeData.value.serviceFee = _.get(data, ['serviceFee']);
};

const fetchMintFee = async function (assetId: string) {
  const data = await request.get(Config.nextUrl + '/v1/token/mint/fee', { assetId: assetId });
  mintFeeData.value.networkFee = _.get(data, ['networkFee']);
  console.log(mintFeeData.value.networkFee);
  console.log(feeData.value.networkFee);
  mintFeeData.value.serviceFee = _.get(data, ['serviceFee']);
};

const checkDeployError = function (checks: string[] = ['name', 'totalSupply', 'mintAmount']) {
  if (checks.indexOf('name') >= 0) {
    const regex = /^[a-zA-Z0-9]{2,8}$/;
    if (!regex.test(deployForm.value.name)) {
      deployError.value.name = 'tick must 2-8 characters';
    } else {
      deployError.value.name = '';
    }
  }

  if (checks.indexOf('totalSupply') >= 0) {
    if (deployForm.value.totalSupply == '' || +deployForm.value.totalSupply == 0) {
      deployError.value.totalSupply = 'Total or Limit is required';
    } else {
      deployError.value.totalSupply = '';
    }
  }

  if (checks.indexOf('mintAmount') >= 0) {
    if (deployForm.value.mintAmount == '' || +deployForm.value.mintAmount == 0) {
      deployError.value.mintAmount = 'Total or Limit is required';
    } else if (
      decimal.compareTo(
        deployForm.value.totalSupply == '' ? 0 : deployForm.value.totalSupply,
        deployForm.value.mintAmount == '' ? 0 : deployForm.value.mintAmount,
      ) < 0
    ) {
      deployError.value.mintAmount = 'Total must greater than limit';
    } else {
      deployError.value.mintAmount = '';
    }
  }
  return deployError.value.ok;
};

const changeDeployName = async function (e: InputEvent) {
  if (deployForm.value.name.length > 8) {
    deployForm.value.name = deployForm.value.name.substring(0, 8);
    //@ts-ignore
    e.target.value = deployForm.value.name;
    return;
  }
  checkDeployError(['name']);
  await fetchDeployFee();
  console.log(feeData.value);
};

const changeDeployTotalSupply = function (e: InputEvent) {
  deployForm.value.totalSupply = deployForm.value.totalSupply.replace(/\D+/g, '');
  if (deployForm.value.totalSupply.length > 20) {
    deployForm.value.totalSupply = deployForm.value.totalSupply.substring(0, 20);
  }
  //@ts-ignore
  e.target.value = deployForm.value.totalSupply;
  checkDeployError(['totalSupply', 'mintAmount']);
};

const changeDeployMintAmount = function (e: InputEvent) {
  deployForm.value.mintAmount = deployForm.value.mintAmount.replace(/\D+/g, '');
  if (deployForm.value.mintAmount.length > 20) {
    deployForm.value.mintAmount = deployForm.value.mintAmount.substring(0, 20);
  }

  // if (deployForm.value.totalSupply != '' && deployForm.value.mintAmount != '') {
  //   if (decimal.compareTo(deployForm.value.mintAmount, deployForm.value.totalSupply) > 0) {
  //     deployForm.value.mintAmount = deployForm.value.totalSupply;
  //   }
  // }

  //@ts-ignore
  e.target.value = deployForm.value.mintAmount;
  checkDeployError(['mintAmount']);
};

const checkMintError = function (checks: string[] = ['']) {
  if (checks.indexOf('amount') >= 0) {
    if (mintForm.value.amount == '' || +mintForm.value.amount == 0) {
      mintForm.value.amount = 'Amount is required';
    } else if (
      mintForm.value.token &&
      decimal.compareTo(mintForm.value.amount, mintForm.value.token.price) > 0
    ) {
      mintForm.value.amount = 'amount cannot be greater than the limit';
    } else {
      deployError.value.totalSupply = '';
    }
  }
  return mintError.value.ok;
};

const mintSearch = async function (e: InputEvent) {
  //@ts-ignore
  const value = e.target.value;
  mintForm.value.tick = value;
  const tokenName = value;
  const data = await request.get(Config.nextUrl + '/v1/token', { tokenName: tokenName });
  tokens.value = createModels(Token, _.get(data, 'list') as unknown as object[]);
  dropDownOpen.value = true;
};

const mintDropdownClose = async function (e: Event) {
  dropDownOpen.value = false;
};

const mintSelect = async function (i: number) {
  const token = tokens.value[i];
  mintForm.value.tick = token.tokenName;
  mintForm.value.assetId = token.assetId;
  mintForm.value.token = token;
  dropDownOpen.value = false;
  await fetchMintFee(token.assetId);
};

const changeMintAmount = function (e: InputEvent) {};

const openConfirm = async function () {
  if (!store.checkLogin()) {
    return;
  }
  timeLeft.value = 7200;
  const serverInfo = await ConfigService.getServerInfo();
  if (store.account) {
    balance.value = await request.balanceOf(serverInfo.fee.assetId, store.account.publicKey32);
  }
  if (type.value == 'deploy') {
    const ok = checkDeployError();
    if (ok) {
      isConfirmOpen.value = true;
    }
    paymentAddress.value = serverInfo.fee.receiver ?? '';
  } else if (type.value == 'mint') {
    const ok = checkMintError();
    if (ok) {
      isConfirmOpen.value = true;
    }
    paymentAddress.value = mintForm.value.token?.assetId ?? '';
  }
};

const confirm = async function () {
  if (!store.checkLogin()) {
    return;
  }
  if (type.value == 'deploy') {
    await deploy();
    isConfirmOpen.value = false;
  } else if (type.value == 'mint') {
    if (mintForm.value.token) {
      await mint(mintForm.value.token);
    }
    isConfirmOpen.value = false;
  }
};

// const changeToken = function (value: IToken) {
//   token.value = value;
//   amount.value = BalanceService.withAccuracy(value.mintAmount);
// };

// const changeAvatar = () => {
//   const input = document.createElement('input');
//   input.type = 'file';
//   input.accept = 'image/jpg, image/jpeg, image/png, image/gif, image/webp';
//   input.onchange = (event) => {
//     let file = _.get(event, 'target.files[0]') as unknown as File;
//     avatarEditMedia.value.src = URL.createObjectURL(file);
//     avatarEditMedia.value.setFile(file);
//     showAvatarCropper.value = true;
//   };
//   input.click();
// };

// const cropAvatar = (data: EditMedia) => {
//   avatarEditMedia.value = data;
//   avatarUrl.value = data.editSrc;
//   showAvatarCropper.value = false;
//   console.log('avatarEditMedia:', avatarEditMedia.value);
// };

const mint = async function (token: Token) {
  if (buttonLoading.value) {
    return;
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
    const amount = BalanceService.withoutAccuracy(mintForm.value.amount);
    await TransactionService.mint({
      account: store.account?.address ?? '',
      chainId: chainId,
      publicKey32: store.account?.publicKey32 ?? '',
      assetId: token.assetId,
      outputs: [
        {
          amount: amount,
          //trim0x
          address: store.account?.publicKey32 ?? '',
        },
      ],
    });
  } finally {
    buttonLoading.value = false;
  }
  message.success('mint success');
  visible.value = false;
};

const deploy = async function () {
  const serverInfo = await ConfigService.getServerInfo();
  if (!store.checkLogin()) {
    return;
  }
  if (deployForm.value.name.length > 24) {
    message.error('name must be less than 24');
    return;
  }
  if (deployForm.value.name == '') {
    message.error('name must not be blank');
    return;
  }
  if (deployForm.value.totalSupply == '') {
    message.error('totalSupply must not be blank');
    return;
  }
  if (deployForm.value.mintAmount == '') {
    message.error('perLimit must not be blank');
    return;
  }
  //form.value.price = serverInfo.assets.price;
  if (loading.value) {
    return;
  }
  loading.value = true;
  try {
    const chainId = (await ConfigService.getServerInfo()).eip712.chainId;
    const currentChainId = await MetamaskService.ethChainId();
    if (currentChainId != chainId) {
      try {
        await MetamaskService.switchEthereumChain(chainId);
      } catch (e) {
        message.error(_.get(e, 'message'));
      }
    }

    const pricek = serverInfo.assets.price;
    const mintAmount = BalanceService.withoutAccuracy(deployForm.value.mintAmount);
    const totalSupplyk = BalanceService.withoutAccuracy(deployForm.value.totalSupply);

    await TransactionService.deploy({
      account: store.account?.address ?? '',
      chainId: chainId,
      publicKey32: store.account?.publicKey32 ?? '',
      name: deployForm.value.name,
      totalSupply: totalSupplyk,
      price: pricek,
      mintAmount: mintAmount,
      salt: hex.padding0x(
        hex.intArrayToHex([
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ]),
      ),
    });
    message.success('deploy success');
  } finally {
    loading.value = false;
  }
  visible.value = false;
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.inscribe {
  h1 {
    font-size: 50px;
    margin: 0;
  }
  h2 {
    a {
      text-decoration: underline;
      font-weight: normal;
      color: @primaryColor;
    }
  }
  .inscribe-card {
    border: 1px solid gray;
    border-radius: 10px;
    margin: auto;
    padding: 20px;
    max-width: 1200px;
    .row {
      font-size: 16px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 30px;
      .col {
        display: flex;
        justify-content: start;
        align-items: center;
        width: 600px;
        font-size: 20px;
        line-height: 20px;
        .text-field {
          height: 50px;
          border: 1px solid gray;
        }

        .select {
          flex-grow: 1;
        }
        .select:deep(.ant-select-selector) {
          height: 50px;
          color: white;
          background: @secondaryBackgroundColor;
          border-color: gray;
          .ant-select-selection-search-input {
            height: 48px;
          }
        }
        .button-submit {
          height: 50px;
          flex-grow: 1;
        }
        .fees {
          font-size: 16px;
          font-weight: normal;
          flex-grow: 1;
          .fee {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .divider {
            background-color: gray;
          }
          .total {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            color: #facd91;
          }
        }
      }
      .col:deep(.ant-radio-wrapper) {
        font-size: 20px;
        line-height: 20px;
        margin-right: 50px;
      }
      .label {
        display: flex;
        justify-content: end;
        width: 200px;
      }
      .error {
        font-size: 14px;
        font-weight: normal;
        color: #facd91;
      }
    }
    .repeat-mint {
      .input {
        display: flex;
        gap: 10px;
        padding: 5px 10px;
        background: @secondaryBackgroundColor;
        .slider {
          flex-grow: 1;
        }
        .action {
          height: 30px;
        }
      }
    }
    .comment {
      margin: 60px;
    }
  }
}

.overlay {
  background: @secondaryBackgroundColor;
  color: white;
  border-radius: 5px;
  padding: 10px;
  max-height: 600px;
  overflow-y: auto;
  cursor: pointer;
  .token-item {
    padding: 10px;
    .name {
      font-size: 20px;
    }
    .detail {
      display: flex;
      justify-content: space-between;
      .left,
      .right {
        flex-grow: 1;
        .row {
          display: flex;
        }
      }
    }
  }
  .token-item:hover {
    background: @primaryBackgroundColor;
  }
}

.confirm-body {
  padding: 50px 100px;
  .title-icon {
    text-align: center;
    font-size: 50px;
    line-height: 50px;
  }
  h1 {
    margin: 0;
    text-align: center;
  }
  .fees {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    .fee {
      .amount {
        color: @primaryColor;
        font-weight: bold;
      }
    }
  }
  .operation {
    padding: 20px;
    background: @secondaryBackgroundColor;
    .action {
      margin-top: 40px;
      text-align: center;
      .button {
        height: 50px;
        width: 200px;
      }
    }
    .loading {
      margin-top: 10px;
      height: 50px;
      display: flex;
      justify-content: center;
      .icon {
        color: @primaryColor;
      }
    }
    .payment {
      margin-top: 10px;
      font-weight: bold;
      background: @primaryBackgroundColor;
      border-radius: 5px;
      padding: 25px;
      .balance,
      .address {
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
