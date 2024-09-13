<template>
  <a @click="copy">
    <CopyOutlined />
  </a>
</template>

<script setup lang="ts">
import { CopyOutlined } from '@ant-design/icons-vue';

import textUtil from '@/lib/utils/text';
import { message } from 'ant-design-vue';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});

const copy = async function () {
  await textUtil.copy(props.text);
  message.success('copy success');
};
</script>

<style lang="less"></style>
