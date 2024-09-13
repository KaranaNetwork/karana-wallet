<template>
  <div>disconnect</div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AccountService from '@/lib/services/account-service';

const router = useRouter();

onMounted(() => {
  AccountService.logout();
  router.push('/login');
});
</script>
