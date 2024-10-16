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
            In case of platform order congestion, there might be delays in on-chain processing, and we cannot guarantee the on-chain processing time
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
