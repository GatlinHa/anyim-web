<script setup>
import { ref, computed, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'

const inputRef = ref()
const searchValue = ref('')
const isShowSearchDialog = ref(false)
const searchTabAcitve = ref('all')

const staticTabData = {
  all: '全部',
  contact: '联系人',
  group: '群组',
  organization: '组织',
  hisotry: '聊天记录',
  todo: '待办'
}

const tabTipsContent = computed(() => {
  return searchTabAcitve.value === 'all' ? '' : staticTabData[searchTabAcitve.value]
})

const onShowResultBox = () => {
  isShowSearchDialog.value = true
}

const onOpen = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}
</script>

<template>
  <div class="search-box">
    <el-input
      placeholder="搜索：联系人/群组/组织/聊天记录..."
      :prefix-icon="Search"
      @focus="onShowResultBox"
    />
    <el-dialog
      class="search-dialog"
      v-model="isShowSearchDialog"
      :show-close="false"
      :modal="false"
      @open="onOpen"
    >
      <template #header>
        <el-input ref="inputRef" v-model="searchValue">
          <template #prefix>
            <el-icon><search /></el-icon>
            <span v-if="tabTipsContent" class="tab-tips">{{ tabTipsContent }}</span>
          </template>
        </el-input>
      </template>

      <div class="classification">
        <div
          class="search-tab"
          v-for="(item, index) in Object.keys(staticTabData)"
          :key="index"
          :class="{ isSearchTabAcitve: searchTabAcitve === item }"
          @click="searchTabAcitve = item"
        >
          {{ staticTabData[item] }}
        </div>
      </div>
      <div class="result">我是结果</div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-box {
  width: 300px;
  margin-left: 10px;
  margin-right: 10px;

  .el-input {
    height: 40px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 25px;
  }

  :deep(.dialog-fade-enter-active) {
    animation: modal-fade-in 0;
  }

  :deep(.dialog-fade-leave-active) {
    animation: modal-fade-in 0;
  }

  :deep(.el-dialog) {
    width: 360px;
    height: 400px;
    margin: 0;
    padding: 0;
    border-radius: 10px;
    position: absolute;
    left: 110px;
    top: 10px;
    background-color: transparent;
    box-shadow: none;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__header) {
    padding-bottom: 10px;
  }

  :deep(.el-dialog__body) {
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 2px 2px 20px gray;
    display: flex;
    flex-direction: column;
    flex: 1;

    .classification {
      margin: 5px;
      display: flex;
      justify-content: space-between;

      .search-tab {
        padding: 5px;
        padding-left: 8px;
        padding-right: 8px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background-color: #c6e2ff;
          color: #409eff;
        }
      }

      .isSearchTabAcitve {
        background-color: #c6e2ff;
        color: #409eff;
      }
    }

    .result {
      margin: 5px;
      flex: 1;
    }
  }

  .tab-tips {
    height: 24px;
    margin-left: 5px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
    border-radius: 12px;
    font-size: 14px;
    color: #409eff;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #c6e2ff;
  }
}
</style>
