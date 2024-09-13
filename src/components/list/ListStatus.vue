<template>
  <div v-if="ok">
    <div v-if="data.cursor == ''">
      <a-spin size="large" />
    </div>
    <div v-else-if="data.cursor == '0' && list.length == 0">
      <a-result title="We can't find any data"> </a-result>
    </div>
    <div v-else-if="data.cursor == '0' && list.length > 0">
      <a-alert message="No more data" type="warning" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import _ from 'lodash';
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  listKey: {
    type: String,
    default: 'list',
  },
});

const list = computed(() => {
  const list = _.get(props.data, props.listKey);
  if (list instanceof Array) {
    return list;
  }
  return [];
});

const ok = computed(() => {
  if (props.data.cursor == '') {
    return true;
  }
  if (list.value.length == 0) {
    return true;
  }
  return false;
});
</script>
