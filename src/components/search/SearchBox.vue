<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import ContactItem from './ResultItem/ContactItem.vue'
import { userQueryService, userQueryByNickService } from '@/api/user'
import { searchStore } from '@/stores'

const searchData = searchStore()
const inputRef = ref()
const keyWords = ref('')
const keyWordsTrim = computed(() => {
  return keyWords.value.trim()
})
const isShowSearchDialog = ref(false)
const searchTab = ref('all')

const staticTabData = {
  all: '全部',
  contact: '联系人',
  group: '群组',
  organization: '组织',
  hisotry: '聊天记录',
  todo: '待办'
}

const tabTipsContent = computed(() => {
  return searchTab.value === 'all' ? '' : staticTabData[searchTab.value]
})

const onShowComponents = () => {
  isShowSearchDialog.value = true
}

const onOpen = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 1.失去焦点或按Enter时触发查询
// 2.延时+防抖查询
// TODO 如果缓存有值，且keywords没有改变就不重新查了
let timer
const onQuery = () => {
  if (!keyWordsTrim.value) return
  clearTimeout(timer)
  timer = setTimeout(async () => {
    searchData.setKeywords(keyWordsTrim.value)
    let response
    let result = {}
    switch (searchTab.value) {
      case 'all':
        console.log('all 待完成，搜索关键字：', keyWordsTrim.value)
        break
      case 'contact':
        console.log('contact 待完成，搜索关键字：', keyWordsTrim.value)
        response = await userQueryByNickService({ nickNameKeyWords: keyWordsTrim.value })
        response.data.data?.forEach((element) => {
          result[element.account] = element
        })
        response = await userQueryService({ account: keyWordsTrim.value }) // 账号是精确匹配，只查一个结果
        if (response.data.data) result[response.data.data.account] = response.data.data
        searchData.addContactResult(result)
        break
      case 'group':
        console.log('group 待完成，搜索关键字：', keyWordsTrim.value)
        break
      case 'organization':
        console.log('organization 待完成，搜索关键字：', keyWordsTrim.value)
        break
      case 'hisotry':
        console.log('hisotry 待完成，搜索关键字：', keyWordsTrim.value)
        break
      case 'todo':
        console.log('todo 待完成，搜索关键字：', keyWordsTrim.value)
        break
      default:
        break
    }
  }, 300)
}

watch(searchTab, () => {
  nextTick(() => {
    inputRef.value?.focus()
    onQuery()
  })
})
</script>

<template>
  <div class="search-box">
    <el-input
      placeholder="搜索：联系人/群组/组织/聊天记录..."
      :prefix-icon="Search"
      @focus="onShowComponents"
    />
    <el-dialog
      class="search-dialog"
      v-model="isShowSearchDialog"
      :show-close="false"
      :modal="false"
      @open="onOpen"
    >
      <template #header>
        <el-input
          ref="inputRef"
          v-model="keyWords"
          :clearable="true"
          @change="onQuery"
          @input="onQuery"
        >
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
          :class="{ isSearchTabAcitve: searchTab === item }"
          @click="searchTab = item"
        >
          {{ staticTabData[item] }}
        </div>
      </div>
      <div class="result-box my-scrollbar">
        <ContactItem
          v-for="account in Object.keys(searchData.getContactResult)"
          :key="account"
          :user="searchData.getContactResult[account]"
        ></ContactItem>
      </div>
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

    .el-dialog__header {
      padding-bottom: 10px;
    }

    .el-dialog__body {
      border-radius: 10px;
      background-color: #fff;
      box-shadow: 2px 2px 20px gray;
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 0; //让浏览器在计算布局时不使用初始的固定高度，而是完全依赖flex属性来确定高度
      overflow-y: hidden;

      .classification {
        margin: 5px;
        margin-left: 10px;
        margin-right: 10px;
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

      .result-box {
        margin: 10px;
        overflow-y: auto;
      }

      // 全局样式是hover才能看到滑块，这里需要一直显示滑块
      .my-scrollbar {
        &::-webkit-scrollbar-thumb {
          background-color: #409eff;
        }
      }
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
