<template>
  <div class="account-address">
    <div class="omniverse-address">
      <div>Omniverse Address</div>
      <span>
        {{ text.middleEllipsis(store.account?.publicKey32 ?? '', 10) }}
        <copy-button :text="store.account?.publicKey32 ?? ''"></copy-button>
      </span>
    </div>
    <div class="chains">
      <div class="chains-table">
        <div class="chains-row">
          <div class="header title-name">Chain Name</div>
          <div class="header title-address">Local Address</div>
        </div>
        <div v-if="store.account" class="chains-row chains-row-data">
          <div class="cell chain-name">
            {{ store.account?.chains[AccountService.chainNames.substrate]?.name }}
          </div>
          <div class="cell chain-address">
            <a-tooltip>
              <template #title>
                {{ store.account?.chains[AccountService.chainNames.substrate]?.address ?? '' }}
              </template>
              {{
                text.middleEllipsis(
                  store.account?.chains[AccountService.chainNames.substrate]?.address ?? '',
                )
              }}
            </a-tooltip>
            <copy-button
              :text="store.account?.chains[AccountService.chainNames.substrate]?.address ?? ''"
            ></copy-button>
          </div>
        </div>
        <div class="chains-row chains-row-data">
          <div class="cell chain-name">
            {{ store.account?.chains[AccountService.chainNames.bitcion]?.name }}
          </div>
          <div class="cell chain-address">
            <a-tooltip>
              <template #title>
                {{ store.account?.chains[AccountService.chainNames.bitcion]?.address ?? '' }}
              </template>
              {{
                text.middleEllipsis(
                  store.account?.chains[AccountService.chainNames.bitcion]?.address ?? '',
                )
              }}
            </a-tooltip>
            <copy-button
              :text="store.account?.chains[AccountService.chainNames.bitcion]?.address ?? ''"
            ></copy-button>
          </div>
        </div>
        <div class="chains-row chains-row-data">
          <div class="cell chain-name">Eth</div>
          <div class="cell chain-address">
            <a-tooltip>
              <template #title>
                {{ store.account?.address }}
              </template>
              {{ text.middleEllipsis(store.account?.address ?? '') }}
            </a-tooltip>
            <copy-button :text="store.account?.address ?? ''"></copy-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CopyButton from '@/components/media/CopyButton.vue';

import store from '@/store/store';
import text from '@/lib/utils/text';
import AccountService from '@/lib/services/account-service';

</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';
.account-address {
  font-size: 16px;
  font-weight: bold;
  color: #858585;
  align-items: start;
  text-align: left;
  gap: 20px;
  padding: 30px;
  border: 1px solid gray;
  width: 700px;
  .omniverse-address {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .chains {
    margin-top: 20px;
    display: flex;
    .chains-table {
      flex-grow: 1;
      display: flex;
      gap: 10px;
      flex-direction: column;
      align-items: stretch;
      .chains-row {
        flex-grow: 1;
        display: flex;
        gap: 50px;
        align-items: center;
        .header {
          font-weight: bold;
          color: white;
        }
        .title-name,
        .chain-name {
          width: 140px;
          text-align: left;
          padding-left: 30px;
        }
        .title-address,
        .chain-address {
          text-align: left;
          flex-grow: 1;
        }
      }
      .chains-row-data {
        height: 50px;
        background: @secondaryBackgroundColor;
        .chain-name {
          font-size: 12;
          color: #858585;
        }
        .chain-address {
          color: #78c9b3;
          font-weight: bold;
          font-family: 'Courier New';
        }
      }
    }
  }
}
</style>
