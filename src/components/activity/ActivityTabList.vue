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
    <div class="activity-table">
      <div v-if="activeActivity == 'mint'"></div>
      <div v-if="activeActivity == 'deploy'"></div>
      <div v-if="activeActivity == 'transform'"></div>
      <div v-if="activeActivity == 'send'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const activeActivity = ref('mint');
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
