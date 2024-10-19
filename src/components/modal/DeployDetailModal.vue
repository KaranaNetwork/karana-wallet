<template>
    <a-modal v-model:open="open">    
    </a-modal>
</template>
<script setup lang="ts">
const open = defineModel('open', { default: false });
</script>
<style lang="less" scoped></style>