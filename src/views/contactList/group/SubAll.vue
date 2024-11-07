<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import AddButton from '@/components/common/AddButton.vue'
import HashNoData from '@/components/common/HasNoData.vue'
import UserCard from '@/components/user/UserCard.vue'
import SelectDialog from '@/components/common/SelectDialog.vue'
import { messageStore, userStore } from '@/stores'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { ElLoading, ElMessage } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { groupCreateService } from '@/api/group'

const messageData = messageStore()
const userData = userStore()
const totalCount = ref(0)
const searchKey = ref('')
const isShowSelectDialog = ref(false)
const selectDialogOptions = computed(() => {
  const data = {}
  Object.values(messageData.sessionList).forEach((item) => {
    data[item.objectInfo.account] = item.objectInfo
  })
  return data
})

onMounted(async () => {
  await messageData.loadSessionList()
})

const onCreateGroup = () => {
  isShowSelectDialog.value = true
}

const isShowUserCard = ref(false)
const userInfo = ref()
const onShowUserCard = async (account) => {
  const sessionId = combineId(account, userData.user.account)
  const loadingInstance = ElLoading.service(el_loading_options)
  const res = await userQueryService({ account: account })
  if (sessionId in messageData.sessionList) {
    messageData.updateSession({
      sessionId: sessionId,
      objectInfo: {
        ...messageData.sessionList[sessionId].objectInfo,
        nickName: res.data.data.nickName,
        signature: res.data.data.signature,
        avatarThumb: res.data.data.avatarThumb,
        gender: res.data.data.gender,
        phoneNum: res.data.data.phoneNum,
        email: res.data.data.email
      }
    })
  }
  userInfo.value = res.data.data
  loadingInstance.close()
  isShowUserCard.value = true
}

const onConfirmSelect = async (selected) => {
  if (selected.length < 2) {
    ElMessage.warning('请至少选择两位群成员')
    return
  }

  const res = await groupCreateService({
    groupType: 1, //普通群
    accounts: selected
  })
  console.log(res.data.data)
  isShowSelectDialog.value = false
}
</script>

<template>
  <el-container style="height: 100%">
    <el-header class="bdr-b">
      <div style="font-size: 14px">全部({{ totalCount }})</div>
      <div class="search-and-add">
        <el-input
          v-model="searchKey"
          placeholder="搜索：群名称/群ID/群成员"
          :prefix-icon="Search"
          :clearable="true"
        />
        <AddButton :size="20" @click="onCreateGroup"></AddButton>
      </div>
    </el-header>
    <el-main class="my-scrollbar" style="padding: 8px">
      <HashNoData :size="100"></HashNoData>
    </el-main>
  </el-container>
  <SelectDialog
    v-model="isShowSelectDialog"
    :options="selectDialogOptions"
    :searchModel="'server'"
    @showUserCard="onShowUserCard"
    @confirm="onConfirmSelect"
  >
    <template #title>
      <div style="font-size: 16px; font-weight: bold; white-space: nowrap">创建群组</div>
    </template>
  </SelectDialog>
  <UserCard
    :isShow="isShowUserCard"
    :userInfo="userInfo"
    @close="isShowUserCard = false"
  ></UserCard>
</template>

<style lang="scss" scoped>
.el-header {
  height: 48px;
  display: flex;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  align-items: center;
}

.search-and-add {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .el-input {
    width: 210px;
    height: 30px;
    margin-right: 10px;

    :deep(.el-input__wrapper) {
      border-radius: 25px;
    }
  }
}
</style>
