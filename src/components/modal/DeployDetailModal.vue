<template>
    <a-modal v-model:open="open" :footer="null" :destroyOnClose="true" width="1000px">
        <div class="modal-body">
            <div class="status">

            </div>
        </div>
    </a-modal>
</template>
<script setup lang="ts">
const open = defineModel('open', { default: false });
</script>
<style lang="less" scoped></style>