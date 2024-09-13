<template>
  <div class="step-body">
    <div class="step" v-for="(item, i) in items" :key="i">
      <div class="icon">
        <template v-if="current > i">
          <CheckCircleOutlined class="icon-success" />
        </template>
        <template v-else-if="current == i">
          <template v-if="status == 'wait'">
            <a-spin size="large" />
          </template>
          <template v-else-if="status == 'error'">
            <ExclamationCircleOutlined class="icon-error" />
          </template>
          <template v-else-if="status == 'finish'">
            <CheckCircleOutlined class="icon-success" />
          </template>
          <template v-else>
            <RightCircleOutlined />
          </template>
        </template>
        <template v-else>
          <ClockCircleOutlined />
        </template>
      </div>
      <div class="info">
        <h2 class="title">{{ item.title }}</h2>
        <div class="description">
          {{ item.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleOutlined,
  RightCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';

import type { IStepItem } from '@/lib/models/ui/step';

defineProps({
  current: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: 'process',
  },
  items: {
    type: Array<IStepItem>,
    default: () => [],
  },
});
</script>

<style lang="less" scoped>
.step-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .step {
    display: flex;
    gap: 20px;
    .icon {
      font-size: 45px;
      .icon-success {
        color: lightgreen;
      }
      .icon-error {
        color: red;
      }
    }
    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
      .title {
        padding: 0;
        margin: 0;
        font-size: 16px;
        line-height: 16px;
      }
      .description {
        font-size: 12px;
        line-height: 12px;
      }
    }
  }
}
</style>
