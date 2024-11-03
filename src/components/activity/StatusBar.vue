<template>
  <div class="status-bar" :class="statusClass">
    <div class="card">
      <div class="status-icon">
        <CheckCircleOutlined class="icon" v-if="status == 'complete'" />
        <ClockCircleOutlined class="icon" v-if="status == 'pending'" />
      </div>
      <div class="status-text">
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusText = computed(() => {
  switch (props.status) {
    case 'pedding':
      return 'Pending';
  }
  return 'Complete';
});

const statusClass = computed(() => {
  switch (props.status) {
    case 'pedding':
      return 'pending';
  }
  return 'complete';
});
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.status-bar {
  display: flex;
  justify-content: center;
  .card {
    background: @secondaryBackgroundColor;
    padding: 20px;
    width: 150px;
    display: flex;
    flex-direction: column;
    .status-icon {
      display: flex;
      justify-content: center;
      .icon {
        font-size: 30px;
      }
    }
    .status-text {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
  }
}

.complete {
  color: lightgreen;
}

.pedding {
  color: bisque;
}
</style>
