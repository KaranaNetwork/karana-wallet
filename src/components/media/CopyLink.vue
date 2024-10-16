<template>
  <a @click="copy">
    <slot></slot>
  </a>
</template>

<script setup lang="ts">

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
