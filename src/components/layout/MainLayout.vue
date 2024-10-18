<template>
  <a-layout class="layout" :style="layoutStyle">
    <a-layout-header class="header" :style="headerStyle">
      <a-menu
        v-model:open-keys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="horizontal"
        theme="dark"
        :items="state.items"
        style="text-align: left; height: 100%"
        @click="jump"
      ></a-menu>
      <div class="profile">
        <div v-if="store.account && store.account.isComplete" class="profile-account">
          <a-dropdown>
            <template #overlay>
              <div class="profile-menu">
                <div class="profile-menu-item">
                  <copy-link :text="store.account.address" style="display: flex; gap: 10px">
                    <UserOutlined />
                    {{ text.middleEllipsis(store.account.address, 5) }}
                    <CopyOutlined />
                  </copy-link>
                </div>
                <div class="profile-menu-item" @click="toAccounts">
                  <WalletOutlined />
                  MyOmniverse
                  <RightOutlined />
                </div>
                <div class="profile-menu-item" @click="logout">
                  <PoweroffOutlined />
                  Disconnect
                </div>
              </div>
            </template>
            <a-button class="button-dark-outlined" style="border-radius: 20px">
              {{ text.middleEllipsis(store.account.address, 5) }}
              <DownOutlined />
            </a-button>
          </a-dropdown>
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
import CopyLink from '@/components//media/CopyLink.vue';
import ConnectModal from '@/components/modal/ConnectModal.vue';
import {
  DownOutlined,
  RightOutlined,
  UserOutlined,
  WalletOutlined,
  PoweroffOutlined,
  CopyOutlined,
} from '@ant-design/icons-vue';

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
  color: 'white',
  height: '80px',
  lineHeight: '80px',
  paddingInline: 50,
  backgroundColor: '#1b1d21',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '0',
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

const toAccounts = function () {
  router.push({ path: '/accounts' });
};

const logout = function () {
  AccountService.logout();
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.layout {
  .header {
    .search {
      display: flex;
      width: 450px;
    }
  }
  .profile {
    display: flex;
    gap: 10px;
    align-items: center;
    .profile-account {
      display: flex;
      gap: 10px;
    }
  }
}
.profile-menu {
  cursor: pointer;
  color: white;
  border: 1px solid white;
  background-color: @secondaryBackgroundColor;
  padding: 10px 0;
  font-size: 16px;
  .profile-menu-item {
    height: 35px;
    display: flex;
    gap: 10px;
    padding: 0 10px;
    align-items: center;
  }
  .profile-menu-item:hover {
    background-color: gray;
  }
}
</style>
