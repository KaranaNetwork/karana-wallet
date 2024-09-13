<template>
  <a-modal v-model:open="visible" :title="text.ucfirst(type)">
    <div class="modal-body">
      <a-row>
        <a-col :span="6" class="label">Types:</a-col>
        <a-col>
          <a-radio-group v-model:value="type" name="radioGroup">
            <a-radio value="mint">Mint</a-radio>
            <a-radio value="deploy">Deploy</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
      <br />
      <br />
      <div v-show="type == 'mint'">
        <a-row>
          <a-col :span="6" class="label"></a-col>
          <a-col :span="18" style="display: flex">
            <a-input-search style="width: 100%" :value="token?.name"> </a-input-search>
          </a-col>
        </a-row>
        <br />
        <a-row>
          <a-col :span="6" class="label">Token:</a-col>
          <a-col :span="18" style="display: flex">
            <div
              style="
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background-color: #25272c;
                border-radius: 5px;
                padding: 10px;
              "
            >
              <div style="font-weight: bold">Name: {{ token?.name }}</div>
              <div style="display: flex; justify-content: space-between">
                <div>Per-Mint Limit: {{ token?.limit }}</div>
                <div>Current Supply: {{ token?.amount }}</div>
              </div>
              <div></div>
            </div>
          </a-col>
        </a-row>
        <br />
        <a-row>
          <a-col :span="6" class="label">Amount:</a-col>
          <a-col :span="18">
            <a-input style="width: 100%" v-model:value="amount"></a-input>
          </a-col>
        </a-row>
      </div>
      <div v-show="type == 'deploy'">
        <a-row v-if="false">
          <a-col :span="6" class="label">Avatar:</a-col>
          <a-col :span="18">
            <div
              class="avatar"
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 60px;
                gap: 10px;
              "
            >
              <a-image
                style="width: 50px; height: 50px"
                v-if="avatarUrl != ''"
                alt=""
                :src="avatarUrl"
              ></a-image>
              <div
                style="
                  width: 50px;
                  height: 50px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
                @click.stop="changeAvatar"
              >
                <CameraOutlined />
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="6" class="label">Name:</a-col>
          <a-col :span="18">
            <div><a-input v-model:value="form.name"></a-input></div>
          </a-col>
        </a-row>
        <br />
        <a-row>
          <a-col :span="6" class="label">Total Supply:</a-col>
          <a-col :span="18">
            <a-input v-model:value="form.totalSupply"></a-input>
          </a-col>
        </a-row>
        <br />
        <a-row>
          <a-col :span="6" class="label">Per-Mint Limit:</a-col>
          <a-col :span="18">
            <a-input v-model:value="form.perLimit"></a-input>
          </a-col>
        </a-row>
        <br />
        <!-- <a-row>
          <a-col :span="6" class="label">Per-Mint Price:</a-col>
          <a-col :span="18">
            <a-input v-model:value="form.price"></a-input>
          </a-col>
        </a-row> -->
      </div>
    </div>
    <template #footer>
      <div style="text-align: center">
        <a-button class="button-default" @click="submit">Submit</a-button>
      </div>
    </template>
    <a-modal v-model:open="showAvatarCropper" :footer="null" :destroyOnClose="true">
      <image-cropper
        title="Editor Avatar"
        :edit-media="avatarEditMedia"
        :boxStyle="{
          backgroundColor: '#f8f8f8',
          margin: 'auto',
          width: '480px',
          height: '480px',
        }"
        :options="{
          viewMode: 1,
          guides: false,
          center: true,
          highlight: false,
          dragMode: 'move',
          autoCropArea: 1,
          cropBoxResizable: false,
          cropBoxMovable: false,
          zoomOnWheel: false,
          aspectRatio: 1,
          background: false,
          minCropBoxWidth: 300,
          minContainerWidth: 360,
          minContainerHeight: 360,
          minCanvasWidth: 360,
          minCanvasHeight: 360,
        }"
        :presetMode="{
          mode: 'round',
        }"
        @crop="cropAvatar"
        @back="
          showAvatarCropper = false;
          isAvatarCropperReady = false;
        "
        @ready="isAvatarCropperReady = true"
      ></image-cropper>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { CameraOutlined } from '@ant-design/icons-vue';

import _ from 'lodash';
import { ref, type PropType } from 'vue';
import { message } from 'ant-design-vue';

import store from '@/store/store';
import text from '@/lib/utils/text';
import hex from '@/lib/utils/hex';
import request from '@/lib/request/request';
import ConfigService from '@/lib/services/config-service';
import MetamaskService from '@/lib/services/metamask-service';
import TransactionService from '@/lib/services/transaction-service';
import EditMedia from '@/lib/models/media/edit-media';
import type { IToken } from '@/lib/models/token/token';
import BalanceService from '@/lib/services/balance-service';

class Form {
  name = '';
  totalSupply = '';
  //price = '';
  perLimit = '';
  salt = '';
}

const visible = defineModel('visible', { default: false });
const type = defineModel('type', { default: 'mint' });
const token = defineModel('token', { type: Object as PropType<IToken> });

const showAvatarCropper = ref(false);
const isAvatarCropperReady = ref(false);
const avatarEditMedia = ref(new EditMedia());
const avatarUrl = ref('');
const buttonLoading = ref(false);
const loading = ref(false);
const amount = ref('0');
const form = ref(new Form());

const changeType = function (value: string) {
  type.value = value;
};

const changeToken = function (value: IToken) {
  token.value = value;
  amount.value = value.limit;
};

const changeAvatar = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpg, image/jpeg, image/png, image/gif, image/webp';
  input.onchange = (event) => {
    let file = _.get(event, 'target.files[0]') as unknown as File;
    avatarEditMedia.value.src = URL.createObjectURL(file);
    avatarEditMedia.value.setFile(file);
    showAvatarCropper.value = true;
  };
  input.click();
};

const cropAvatar = (data: EditMedia) => {
  avatarEditMedia.value = data;
  avatarUrl.value = data.editSrc;
  showAvatarCropper.value = false;
  console.log('avatarEditMedia:', avatarEditMedia.value);
};

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

  /*
  const resp = await request.rpc("preMint", [
    {
      assetId: token.assetId,
      address: hexUtil.hexToIntArray(
        store.currentPublicKey.substring(2, 2 + 64)
      ),
      outputs: outputs.value.map((output) => {
        return {
          address: hexUtil.hexToIntArray(output.address),
          amount: output.amount,
        };
      }),
    },
  ]);
  const tx = hexUtil.intArrayToJson(resp.tx);
  console.log("mintTx:", tx);
  const hash = SignService.getMintHashData(tx);
  const sign = await personalSign(hash, store.currentAccount as `0x${string}`);
  const signArray = hexUtil.hexToIntArray(sign.slice(2));
  signArray.pop();
  _.set(tx, "signature", signArray);
  const result = await request.rpc("sendTransaction", [tx]);
  console.log("result: ", result);
  */
  message.success('mint success');
  visible.value = false;
};

const deploy = async function () {
  const serverInfo = await ConfigService.getServerInfo();
  if (!store.checkLogin()) {
    return;
  }
  if (form.value.name.length > 24) {
    message.error('name must be less than 24');
    return;
  }
  if (form.value.name == '') {
    message.error('name must not be blank');
    return;
  }
  if (form.value.totalSupply == '') {
    message.error('totalSupply must not be blank');
    return;
  }
  if (form.value.perLimit == '') {
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
      avatarEditMedia.value.path = 'upload/token/avatar/' + form.value.name;
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
    const limitk = BalanceService.withoutAccuracy(form.value.perLimit);
    const totalSupplyk = BalanceService.withoutAccuracy(form.value.totalSupply);

    await TransactionService.deploy({
      account: store.account?.address ?? '',
      chainId: chainId,
      publicKey32: store.account?.publicKey32 ?? '',
      name: form.value.name,
      totalSupply: totalSupplyk,
      price: pricek,
      limit: limitk,
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

const submit = async function () {
  if (type.value == 'mint' && token.value) {
    await mint(token.value);
  } else if (type.value == 'deploy') {
    await deploy();
  }
};

defineExpose({ changeType, changeToken });
</script>
