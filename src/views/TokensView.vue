<template>
  <main-layout>
    <div class="container">
      <account-nav></account-nav>
      <tokens-view :is-self="false"></tokens-view>
    </div>
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import AccountNav from '@/components/account/AccountNav.vue';
import TokensView from '@/components/token/TokensView.vue';
</script>

<style lang="less" scoped>
.container {
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}
</style>
