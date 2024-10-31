<script setup>
import { ref } from 'vue'
import AddButton from '@/components/common/AddButton.vue'

const totalCount = ref(0)
const partitionSearchKey = ref('')
const userSearchKey = ref('')
</script>

<template>
  <div class="sub-partition-wrapper">
    <el-aside class="partition bdr-r">
      <el-header class="bdr-b">
        <el-input
          v-model="partitionSearchKey"
          placeholder="搜索: 分组名称"
          :prefix-icon="Search"
          :clearable="true"
        />
        <AddButton :size="20"></AddButton>
      </el-header>
      <el-main></el-main>
    </el-aside>
    <el-main class="detail">
      <el-header class="bdr-b">
        <div style="font-size: 14px">全部({{ totalCount }})</div>
        <div class="search-and-add">
          <el-input
            v-model="userSearchKey"
            placeholder="搜索：昵称/账号"
            :prefix-icon="Search"
            :clearable="true"
          />
          <AddButton :size="20"></AddButton>
        </div>
      </el-header>
      <el-main></el-main>
    </el-main>
  </div>
</template>

<style lang="scss" scoped>
.sub-partition-wrapper {
  height: 100%;
  display: flex;
  justify-content: start;

  .partition {
    width: 180px;

    .el-header {
      height: 48px;
      padding: 0 8px 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .el-input {
        width: 120px;
        height: 30px;

        :deep(.el-input__wrapper) {
          border-radius: 25px;
        }
      }
    }

    .el-main {
    }
  }

  .detail {
    padding: 0;

    .el-header {
      height: 48px;
      padding: 0 16px 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-and-add {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .el-input {
          width: 130px;
          height: 30px;
          margin-right: 10px;

          :deep(.el-input__wrapper) {
            border-radius: 25px;
          }
        }
      }
    }

    .el-main {
    }
  }
}
</style>
