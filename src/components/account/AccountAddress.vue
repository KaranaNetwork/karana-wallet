<template>
  <div class="account-address">
    <div>
      Omniverse Address:
      <span>{{ store.account?.publicKey.substring(0, 2 + 64) }}</span>
    </div>
    <a-button class="button-default" @click="copy">Copy Address</a-button>
  </div>
</template>
<script lang="ts" setup>
import store from '@/store/store';
import textUtil from '@/lib/utils/text';
import { message } from 'ant-design-vue';

const copy = function () {
  textUtil.copy(store.account?.publicKey32 ?? '');
  message.success('copy address success !!!');
};
</script>

<style lang="less" scoped>
.account-address {
  font-size: 16px;
  font-weight: bold;
  color: #858585;
  display: flex;
  align-items: center;
  text-align: left;
  gap: 20px;
  .copy-button {
    border: none;
    color: white;
    border-radius: 50px;
    width: 150px;
    background: linear-gradient(to bottom, #fb769c, #7758bb);
  }
}
</style>
