<script setup>
import { ref, onMounted, computed } from 'vue'
import { userQueryService } from '@/api/user'
import { messageStore } from '@/stores'
import ContactsUserItem from '@/components/contacts/user/ContactsUserItem.vue'
import UserCard from '@/components/user/UserCard.vue'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { Search } from '@element-plus/icons-vue'
import HashNoData from '@/components/common/HasNoData.vue'
import { MsgType } from '@/proto/msg'

const messageData = messageStore()

const totalCount = computed(() => {
  return Object.keys(allData.value).length
})

onMounted(async () => {
  await messageData.loadSessionList()
})

const searchKey = ref('')
const allData = computed(() => {
  if (Object.values(messageData.sessionList).length === 0) return []

  const data = []
  Object.values(messageData.sessionList).forEach((item) => {
    const sessionType = item.sessionType
    if (sessionType === MsgType.CHAT) {
      if (!searchKey.value) {
        data.push(item)
      } else {
        if (
          item.objectInfo.nickName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
          item.objectInfo.account === searchKey.value
        ) {
          data.push(item)
        }
      }
    }
  })

  if (data.length === 0) {
    return []
  } else {
    return data.sort((a, b) => {
      const bTime = new Date(b.lastMsgTime).getTime()
      const aTIme = new Date(a.lastMsgTime).getTime()
      return bTime - aTIme
    })
  }
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
        v-model.trim="searchKey"
        placeholder="搜索：昵称/账号"
        :prefix-icon="Search"
        :clearable="true"
      />
    </el-header>
    <el-main class="my-scrollbar" style="padding: 8px">
      <div v-if="allData.length">
        <ContactsUserItem
          v-for="item in allData"
          :key="item.sessionId"
          :session="item"
          :type="'all'"
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
