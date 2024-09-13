<template>
  <main-layout>
    <div class="container">
      <summary-data></summary-data>
    </div>
  </main-layout>
</template>
<script lang="ts" setup>
import MainLayout from '@/components/layout/MainLayout.vue';
import SummaryData from '@/components/transaction/SummaryData.vue';
</script>

<style lang="less" scoped>
.container {
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  overflow: auto;
  .search {
    display: flex;
    justify-content: center;
    .search-button {
      width: 700px;
    }
  }
  .abstract {
    display: flex;
    gap: 20px;
    .card {
      cursor: pointer;
      flex-grow: 1;
      padding: 20px;
      background: white;
      display: flex;
      text-align: left;
      .center {
        flex-grow: 1;
      }
    }
  }
  .data {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    .data-left,
    .data-right {
      flex-grow: 1;
      text-align: left;
      width: 0;
      .card {
        cursor: pointer;
        flex-grow: 1;
        padding: 20px;
        background: white;
        display: flex;
        text-align: left;
        .center {
          flex-grow: 1;
        }
        margin-bottom: 50px;
      }
      .title {
        background: white;
        font-size: 16px;
        font-weight: bold;
        padding: 10px;
      }
    }
    .data-left {
      .block-row {
        height: 100px;
        background-color: white;
        border-bottom: 10px solid rgb(255, 249, 254);
        cursor: pointer;
        .block-row-1 {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: white;
          gap: 20px;
          .hash {
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: bold;
          }
          .time {
            white-space: nowrap;
          }
        }
        .block-row-2 {
          display: flex;
          align-items: center;
          justify-content: right;
          gap: 5px;
          padding: 10px;
          background: white;
          margin-left: 100px;
          .data-cell {
            padding: 10px;
            background: #edf8fc;
            color: #4bbee6;
            border-radius: 5px;
          }
        }
      }
    }

    .data-right {
      .transaction-row {
        height: 100px;
        background-color: white;
        border-bottom: 10px solid rgb(255, 249, 254);
        cursor: pointer;
        .transaction-row-1 {
          display: flex;
          align-items: center;
          background: white;
          .tx-id {
            color: #4bbee6;
          }
        }
        .transaction-row-2 {
          display: flex;
          align-items: center;
          background: white;

          .from {
            display: flex;
            align-items: center;
            .from-data {
              width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .block {
            display: flex;
            align-items: center;
            .block-data {
              color: #4bbee6;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
}
</style>
