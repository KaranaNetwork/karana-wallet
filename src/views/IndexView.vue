<template>
  <main-layout>
    <div class="container">   
      <div class="body">
        <div class="name">Overview</div>
        <div class="cards">
          <a-card class="card" style="flex-grow: 1; background-color: #25272c; border: 0">
            <div class="card-body">
              <div>
                <div class="amount">
                  {{ information.totalTransactionNumber }}
                </div>
              </div>
              <div class="label">Total Number Of Transactions</div>
            </div>
          </a-card>
          <a-card class="card" style="flex-grow: 1; background-color: #25272c; border: 0">
            <div class="card-body">
              <div>
                <div class="amount">
                  {{ information.blockHeight }}
                </div>
              </div>
              <div class="label">Block Height</div>
            </div>
          </a-card>
          <a-card class="card" style="flex-grow: 1; background-color: #25272c; border: 0">
            <div class="card-body">
              <div>
                <div class="amount">
                  {{ BalanceService.humanLize(information.midGasPrice) }}
                </div>
              </div>
              <div class="label">Med Gas Price</div>
            </div>
          </a-card>
        </div>
        <tokens-view :is-self="false" :limit="5"></tokens-view>
        <summary-data></summary-data>
      </div>
    </div>
  </main-layout>
</template>

<script lang="ts" setup>
import MainLayout from '@/components/layout/MainLayout.vue';
import TokensView from '@/components/token/TokensView.vue';
import SummaryData from '@/components/transaction/SummaryData.vue';

import { ref, onMounted } from 'vue';
import request from '@/lib/request/request';
import BalanceService from '@/lib/services/balance-service';

const information = ref({
  blockHash: [],
  blockHeight: 0,
  midGasPrice: 0,
  latestBatchId: 0,
  tokenTypeNumber: 0,
  totalTransactionNumber: 0,
});

onMounted(async () => {
  // await MetamaskService.accounts();
  // const ac = await AccountService.login();
  information.value = await request.rpc('getLatestInformation');
});
</script>

<style lang="less" scoped>
@import '@/assets/css/var.less';

.container {
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  overflow: auto;
  .h1 {
    display: flex;
    justify-content: start;
    color: @primaryColor;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 50px;
    .name {
      display: flex;
      color: #ff7700;
      font-weight: bold;
      font-size: 16px;
    }
    .cards {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      .card {
        color: white;
      }
      .card-body {
        display: flex;
        justify-content: space-around;
        white-space: pre-wrap;
        .amount {
          height: 100px;
          width: 100px;
          border: 10px solid #ff7700;
          border-radius: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .label {
          display: flex;
          align-items: center;
          width: 120px;
          font-weight: bold;
        }
      }
    }
    .show-all-button {
      border: none;
      color: white;
      border-radius: 50px;
      width: 150px;
      background: linear-gradient(to bottom, #fb769c, #7758bb);
    }
    .account-info {
      font-size: 16px;
      font-weight: bold;
      color: #858585;
      display: flex;
      align-items: center;
      text-align: left;
      gap: 20px;
      .copy-button {
        border: none;
        color: white;
        border-radius: 50px;
        width: 150px;
        background: linear-gradient(to bottom, #fb769c, #7758bb);
      }
    }
    .transaction {
      .direction {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 10px;
      }
    }
    // .data {
    //   display: flex;
    //   justify-content: space-between;
    //   background-color: #25272c;
    //   gap: 5px;
    //   padding-bottom: 30px;
    //   .data-left,
    //   .data-right {
    //     flex-grow: 1;
    //     text-align: left;
    //     width: 0;
    //     .card {
    //       cursor: pointer;
    //       flex-grow: 1;
    //       padding: 20px;
    //       //background: white;
    //       display: flex;
    //       text-align: left;
    //       .center {
    //         flex-grow: 1;
    //       }
    //       margin-bottom: 5px;
    //     }
    //     .title {
    //       //background: white;
    //       font-size: 16px;
    //       font-weight: bold;
    //       padding: 10px;
    //     }
    //   }
    //   .data-left {
    //     padding-left: 5px;
    //     .block-row {
    //       height: 100px;
    //       margin-bottom: 5px;
    //       //border-bottom: 10px solid rgb(255, 249, 254);
    //       background-color: #1b1d21;
    //       cursor: pointer;
    //       .block-row-1 {
    //         display: flex;
    //         justify-content: space-between;
    //         padding: 10px;
    //         //background: white;
    //         gap: 20px;
    //         .hash {
    //           flex-grow: 1;
    //           overflow: hidden;
    //           text-overflow: ellipsis;
    //           font-weight: bold;
    //         }
    //         .time {
    //           white-space: nowrap;
    //         }
    //       }
    //       .block-row-2 {
    //         display: flex;
    //         align-items: center;
    //         justify-content: right;
    //         gap: 5px;
    //         padding: 10px;
    //         //background: white;
    //         margin-left: 100px;
    //         .data-cell {
    //           padding: 10px;
    //           background: #ff7700;
    //           color: white;
    //           border-radius: 5px;
    //         }
    //       }
    //     }
    //   }

    //   .data-right {
    //     padding-right: 5px;
    //     .transaction-row {
    //       height: 100px;
    //       background-color: #1b1d21;
    //       margin-bottom: 5px;
    //       //border-bottom: 10px solid;
    //       cursor: pointer;
    //       .transaction-row-1 {
    //         display: flex;
    //         align-items: center;
    //         //background: white;
    //         .tx-id {
    //           color: #4bbee6;
    //         }
    //       }
    //       .transaction-row-2 {
    //         display: flex;
    //         align-items: center;
    //         //background: white;

    //         .from {
    //           display: flex;
    //           align-items: center;
    //           .from-data {
    //             width: 100px;
    //             overflow: hidden;
    //             text-overflow: ellipsis;
    //           }
    //         }
    //         .block {
    //           display: flex;
    //           align-items: center;
    //           .block-data {
    //             color: #4bbee6;
    //             text-overflow: ellipsis;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
</style>
