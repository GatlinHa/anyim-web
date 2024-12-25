<script setup>
import { ref, onMounted, computed } from 'vue'
import { userQueryService } from '@/api/user'
import { messageStore, userCardStore } from '@/stores'
import ContactListUserItem from '@/views/contactList/user/components/ContactListUserItem.vue'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { Search } from '@element-plus/icons-vue'
import HashNoData from '@/components/common/HasNoData.vue'
import { MsgType } from '@/proto/msg'

const messageData = messageStore()
const userCardData = userCardStore()

const totalCount = computed(() => {
  return Object.keys(allData.value).length
})

onMounted(async () => {
  await messageData.loadSessionList()
  await messageData.loadPartitions()
})

const searchKey = ref('')
const allData = computed(() => {
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
    return data
  } else {
    return data.sort((a, b) => {
      const a_msgRecord = messageData.msgRecordsList[a.sessionId]
      const a_msgRecord_len = a_msgRecord?.length
      if (!a_msgRecord_len) return 1
      const a_lastMsg = a_msgRecord[a_msgRecord_len - 1]

      const b_msgRecord = messageData.msgRecordsList[b.sessionId]
      const b_msgRecord_len = b_msgRecord?.length
      if (!b_msgRecord_len) return -1
      const b_lastMsg = b_msgRecord[b_msgRecord_len - 1]

      const bTime = new Date(b_lastMsg.msgTime).getTime()
      const aTIme = new Date(a_lastMsg.msgTime).getTime()
      return bTime - aTIme
    })
  }
})

const onShowUserCard = ({ sessionId, account }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  userQueryService({ account: account })
    .then((res) => {
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
      userCardData.setUserInfo(messageData.sessionList[sessionId].objectInfo)
    })
    .finally(() => {
      loadingInstance.close()
      userCardData.setIsShow(true)
    })
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
        <ContactListUserItem
          v-for="item in allData"
          :key="item.sessionId"
          :session="item"
          :type="'all'"
          :keyWords="searchKey"
          @showUserCard="onShowUserCard"
        ></ContactListUserItem>
      </div>
      <HashNoData v-else :size="100"></HashNoData>
    </el-main>
  </el-container>
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
