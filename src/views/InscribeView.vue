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
        <div class="row">
          <div class="col label"></div>
          <div class="col">
            <div class="fees">
              <div class="fee">
                <div class="fee-type">Network Fee:</div>
                <div class="fee-value">0.01 karana</div>
              </div>
              <div class="fee">
                <div class="fee-type">ServiceFee:</div>
                <div class="fee-value">0</div>
              </div>
              <a-divider class="divider" />
              <div class="total">
                <div class="fee-type">Total:</div>
                <div class="fee-value">0.01 karana</div>
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
            <a-button class="button-yellow" @click="openConfirm">Submit & Pay invoice</a-button>
          </div>
        </div>
      </div>
      <div class="activities"></div>
    </div>
    <a-modal v-model:open="isConfirmOpen" :footer="null" :destroyOnClose="true" width="1000px">
      <div class="confirm-body">
        <div>
          <ClockCircleOutlined />
        </div>
        <h1>Waiting on Payment in xxxxxx</h1>
        <div>
          <div>
            <div>Total()</div>
            <div></div>
          </div>
          <div>
            <div>Network Fee</div>
            <div>0.01</div>
          </div>
          <div>
            <div>Service Fee</div>
            <div>0.01</div>
          </div>
        </div>
        <div>
          <div><a-button class="button-yellow">Pay With Wallet</a-button></div>
          <div>
            <div>
              <div>Balance:</div>
              <div></div>
            </div>
            <div>
              <div>Payment Address:</div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
import _ from 'lodash';
import { ref } from 'vue';
import { message } from 'ant-design-vue';

import store from '@/store/store';
import hex from '@/lib/utils/hex';
import decimal from '@/lib/utils/decimal';
import request from '@/lib/request/request';
import ConfigService from '@/lib/services/config-service';
import MetamaskService from '@/lib/services/metamask-service';
import TransactionService from '@/lib/services/transaction-service';
import EditMedia from '@/lib/models/media/edit-media';
import type { IToken } from '@/lib/models/token/token';
import BalanceService from '@/lib/services/balance-service';

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
}

const type = ref('deploy');
const visible = defineModel('visible', { default: false });
// const token = defineModel('token', { type: Object as PropType<IToken> });
const isConfirmOpen = ref(false);

// const showAvatarCropper = ref(false);

const avatarEditMedia = ref(new EditMedia());
// const avatarUrl = ref('');
const buttonLoading = ref(false);
const loading = ref(false);
const amount = ref('0');
const deployForm = ref(new DeployForm());
const deployError = ref(new DeployError());

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
};

const changeDeployName = function (e: InputEvent) {
  if (deployForm.value.name.length > 8) {
    deployForm.value.name = deployForm.value.name.substring(0, 8);
    //@ts-ignore
    e.target.value = deployForm.value.name;
    return;
  }

  checkDeployError(['name']);
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

const openConfirm = function () {
  isConfirmOpen.value = true;
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

const mint = async function (token: IToken) {
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
    const amountk = BalanceService.withoutAccuracy(amount.value);
    await TransactionService.mint({
      account: store.account?.address ?? '',
      chainId: chainId,
      publicKey32: store.account?.publicKey32 ?? '',
      assetId: token.assetId,
      outputs: [
        {
          amount: amountk,
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
    if (avatarEditMedia.value.editSrc != '') {
      avatarEditMedia.value.path = 'upload/token/avatar/' + deployForm.value.name;
      await request.uploadEditMedia(avatarEditMedia.value);
    }
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

// const submit = async function () {
//   if (type.value == 'mint' && token.value) {
//     await mint(token.value);
//   } else if (type.value == 'deploy') {
//     await deploy();
//   }
// };
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
        .button-yellow {
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
    .comment {
      margin: 60px;
    }
  }
}
</style>
