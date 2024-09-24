<template>
  <a-layout class="layout" :style="layoutStyle">
    <a-layout-header class="header" :style="headerStyle">
      <a-menu
        v-model:open-keys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="horizontal"
        theme="dark"
        :inline-collapsed="state.collapsed"
        :items="state.items"
        style="text-align: left; height: 100%"
        @click="jump"
      ></a-menu>
      <div style="display: flex; gap: 10px">
        <div v-if="store.account && store.account.isComplete" style="display: flex; gap: 10px">
          <span>
            <copy-button :text="store.account.address"></copy-button>
            {{ text.middleEllipsis(store.account.address) }}
          </span>
          <a @click="logout"><LogoutOutlined /></a>
        </div>
        <div v-else>
          <a-button type="primary" @click="connect">Connect Wallet</a-button>
        </div>
      </div>
    </a-layout-header>
    <a-layout class="left-sider">
      <a-layout-content :style="contentStyle">
        <slot></slot>
      </a-layout-content>
    </a-layout>
    <connect-modal v-model:open="store.isShowConnect" :z-index="10000"></connect-modal>
  </a-layout>
</template>

<script lang="ts" setup>
import CopyButton from '@/components/media/CopyButton.vue';
import ConnectModal from '@/components/modal/ConnectModal.vue';
import { LogoutOutlined } from '@ant-design/icons-vue';

import { onMounted } from 'vue';
import type { CSSProperties } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { MenuClickEventHandler, MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import AccountService from '@/lib/services/account-service';
import state from '@/store/menu';
import store from '@/store/store';
import text from '@/lib/utils/text';

const router = useRouter();
const route = useRoute();

const layoutStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const headerStyle: CSSProperties = {
  //textAlign: "center",
  color: 'white',
  height: '80px',
  lineHeight: '80px',
  paddingInline: 50,
  backgroundColor: '#1b1d21',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '0',
  //borderColor: "#F0F0F0",
};

const contentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  minHeight: 500,
  color: 'white',
  backgroundColor: '#1b1d21',
  overflow: 'auto',
};

const jump: MenuClickEventHandler = function (data: MenuInfo) {
  router.push(data.key as string);
};

onMounted(() => {
  state.setSelectedKey(route.path);
  if (state.selectedKeys.length == 0) {
    state.items.forEach((item) => {
      if (route.path.startsWith(item.key + '/')) {
        state.selectedKeys.push(item.key);
      }
    });
  }
});

const connect = async function () {
  store.showConnect();
};

const logout = function () {
  AccountService.logout();
};
</script>

<style lang="less" scoped>
.layout {
  .header {
    .search {
      display: flex;
      width: 450px;
    }
  }
}
</style>
