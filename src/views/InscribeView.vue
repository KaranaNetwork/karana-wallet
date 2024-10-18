<template>
  <main-layout>
    <div class="inscribe">
      <h1 class="h1">KARANA Inscribe</h1>
      <h2 class="h2"><a>How to inscribe?</a></h2>
      <div class="inscribe-card">
        <div class="row">
          <div class="col label">Types</div>
          <div class="col">
            <a-radio-group v-model:value="type" name="radioGroup">
              <a-radio value="mint">Mint</a-radio>
              <a-radio value="deploy">Deploy</a-radio>
            </a-radio-group>
          </div>
        </div>
        <div class="row">
          <div class="col label">Tick</div>
          <div class="col">
            <a-input></a-input>
          </div>
        </div>
        <div class="row">
          <div class="col label">Total Supply</div>
          <div class="col">
            <a-input></a-input>
          </div>
        </div>
        <div class="row">
          <div class="col label">Per-Mint Amount</div>
          <div class="col">
            <a-input></a-input>
          </div>
        </div>
        <div class="row">
          <div class="col label">Network Fee</div>
          <div class="col">
            <a-input></a-input>
          </div>
        </div>
        <div class="comment">
          In case of platform order congestion, there might be delays in on-chain processing, and we
          cannot guarantee the on-chain processing time
        </div>
        <div class="action">
          <a-button>Submit & Pay invoice</a-button>
        </div>
      </div>
      <div class="activities"></div>
    </div>
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';

import { ref } from 'vue';

const type = ref('deploy');
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.inscribe {
  h1 {
    font-size: 50px;
    margin: 0;
  }
  h2 {
    a {
      text-decoration: underline;
      font-weight: normal;
      color: @primaryColor;
    }
  }
  .inscribe-card {
    border: 1px solid gray;
    border-radius: 10px;
    margin: auto;
    padding: 20px;
    max-width: 1200px;
    .row {
      font-size: 16px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 30px;
      margin-bottom: 30px;
      .col {
        display: flex;
        justify-content: start;
        align-items: center;
        width: 600px;
      }
      .label {
        display: flex;
        justify-content: end;
        width: 300px;
      }
    }
  }
}
</style>
