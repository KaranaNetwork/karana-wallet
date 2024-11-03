<template>
  <div class="activities">
    <div class="activity-buttons">
      <a-button
        class="button-dark-outlined"
        :class="activeActivity == 'mint' ? 'active' : ''"
        @click="changeActivity('mint')"
      >
        Mint
      </a-button>
      <a-button
        class="button-dark-outlined"
        :class="activeActivity == 'deploy' ? 'active' : ''"
        @click="changeActivity('deploy')"
      >
        Deploy
      </a-button>
      <a-button
        class="button-dark-outlined"
        :class="activeActivity == 'transform' ? 'active' : ''"
        @click="changeActivity('transform')"
      >
        Transform
      </a-button>
      <a-button
        class="button-dark-outlined"
        :class="activeActivity == 'send' ? 'active' : ''"
        @click="changeActivity('send')"
      >
        Send
      </a-button>
    </div>
    <br />
    <br />
    <div class="activity-table">
      <div v-if="activeActivity == 'mint'">
        <a-table
          class="table"
          :columns="[
            { title: 'Transactions ID' },
            { title: 'Token' },
            { title: 'Quantity' },
            { title: 'Date' },
            { title: 'Status' },
          ]"
        ></a-table>
      </div>
      <div v-if="activeActivity == 'deploy'">
        <a-table
          class="table"
          :columns="[
            { title: 'Transactions ID' },
            { title: 'Token' },
            { title: 'Date' },
            { title: 'Status' },
          ]"
        ></a-table>
      </div>
      <div v-if="activeActivity == 'transform'">
        <a-table
          class="table"
          :columns="[
            { key: 'type' },
            { title: 'form' },
            { title: 'to' },
            { title: 'Transaction ID' },
            { title: 'Date' },
            { title: 'Status' },
          ]"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'type'">
              <a-select v-model:value="transactionType" style="width: 120px">
                <a-select-option value="all">All</a-select-option>
                <a-select-option value="deposit upgrade">deposit upgrade</a-select-option>
                <a-select-option value="withdraw downgrade">withdraw downgrade</a-select-option>
              </a-select>
            </template>
          </template>
        </a-table>
      </div>
      <div v-if="activeActivity == 'send'">
        <a-table
          class="table"
          :columns="[
            { title: 'Transactions ID' },
            { title: 'Amount' },
            { title: 'Send Address' },
            { title: 'Receive Address' },
            { title: 'Date' },
            { title: 'Status' },
          ]"
        ></a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { title } from 'process';
import { ref } from 'vue';

const activeActivity = ref('mint');
const transactionType = ref('all');

const changeActivity = function (key: string) {
  activeActivity.value = key;
};
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.activities {
  .activity-buttons {
    display: flex;
    gap: 20px;
    .button-dark-outlined {
      width: 120px;
      font-weight: normal;
    }
    .active {
      color: @primaryColor;
      border-color: @primaryColor;
    }
  }
}
</style>
