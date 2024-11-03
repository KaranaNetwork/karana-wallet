<template>
  <div class="fees">
    <div class="fee">
      <div>Total(Karana)</div>
      <div class="amount">0.01</div>
    </div>
    <div class="fee">
      <div>Network Fee</div>
      <div class="amount">0.01</div>
    </div>
    <div class="fee">
      <div>Service Fee</div>
      <div class="amount">0.01</div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style lang="less" scoped>
.fees {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: normal;
  .fee {
    .amount {
        color: #facd91;
        font-weight: bold;
    }
  }
  .divider {
    background-color: gray;
  }
  .total {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    color: #facd91;
  }
}
</style>
