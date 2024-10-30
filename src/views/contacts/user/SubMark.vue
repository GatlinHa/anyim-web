<script setup>
import { ref, onMounted, computed } from 'vue'
import { msgChatSessionListService } from '@/api/message'
import { userQueryService } from '@/api/user'
import { messageStore } from '@/stores'
import ContactsUserItem from '@/components/contacts/ContactsUserItem.vue'
import UserCard from '@/components/user/UserCard.vue'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { Search } from '@element-plus/icons-vue'
import HashNoData from '@/components/common/HasNoData.vue'

const messageData = messageStore()
const totalCount = computed(() => {
  return Object.keys(markData.value).length
})

onMounted(async () => {
  if (!Object.keys(messageData.sessionList).length) {
    const res = await msgChatSessionListService()
    messageData.setSessionList(res.data.data) //入缓存
  }
})

const markData = computed(() => {
  const data = {}
  Object.keys(messageData.sessionList).forEach((key) => {
    const mark = messageData.sessionList[key].mark
    if (mark) {
      data[key] = messageData.sessionList[key]
    }
  })
  return data
})

const markSearchKey = ref('')
const markDataSorted = computed(() => {
  if (!Object.keys(markData.value)) return []

  let markDataArr = []
  Object.values(markData.value).forEach((item) => {
    if (!markSearchKey.value) {
      markDataArr.push(item)
    } else {
      if (
        item.objectInfo.nickName.toLowerCase().includes(markSearchKey.value.toLowerCase()) ||
        item.objectInfo.account === markSearchKey.value ||
        item.mark.toLowerCase().includes(markSearchKey.value.toLowerCase())
      ) {
        markDataArr.push(item)
      }
    }
  })

  if (!markDataArr.length) return []

  return markDataArr.sort((a, b) => {
    return a.objectInfo.account > b.objectInfo.account ? 1 : -1
  })
})

const isShowUserCard = ref(false)
const userInfo = ref()
const onShowUserCard = async ({ sessionId, account }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  const res = await userQueryService({ account: account })
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
  userInfo.value = messageData.sessionList[sessionId].objectInfo
  loadingInstance.close()
  isShowUserCard.value = true
}
</script>

<template>
  <el-container style="height: 100%">
    <el-header class="bdr-b">
      <div style="font-size: 14px">全部({{ totalCount }})</div>
      <el-input
        v-model="markSearchKey"
        placeholder="搜索：昵称/账号/备注"
        :prefix-icon="Search"
        :clearable="true"
        style="width: 180px"
      />
    </el-header>
    <el-main class="my-scrollbar" style="padding: 8px">
      <div v-if="markDataSorted.length">
        <ContactsUserItem
          v-for="item in markDataSorted"
          :key="item.sessionId"
          :session="item"
          :type="'mark'"
          @showUserCard="onShowUserCard"
        ></ContactsUserItem>
      </div>
      <HashNoData v-else :size="100"></HashNoData>
    </el-main>
  </el-container>
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

.el-input {
  width: 150px;
  height: 30px;

  :deep(.el-input__wrapper) {
    border-radius: 25px;
  }
}
</style>
