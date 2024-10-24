<script setup>
import { ref, onMounted, computed } from 'vue'
import lastIcon from '@/assets/svg/last.svg'
import markIcon from '@/assets/svg/mark.svg'
import partitionIcon from '@/assets/svg/partition.svg'
import { msgChatSessionListService } from '@/api/message'
import { userQueryService } from '@/api/user'
import { messageStore } from '@/stores'
import ContactsUserItem from '@/components/contacts/ContactsUserItem.vue'
import UserCard from '@/components/user/UserCard.vue'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { Search } from '@element-plus/icons-vue'
import HashNoData from '@/components/common/HasNoData.vue'
import { MsgType } from '@/proto/msg'

const messageData = messageStore()
const indexActive = ref('last')
const lastData = ref({})
const markData = ref({})
const partionData = ref({})
const totalCount = computed(() => {
  switch (indexActive.value) {
    case 'last':
      return Object.keys(lastData.value).length
    case 'mark':
      return Object.keys(markData.value).length
    case 'partition':
      return Object.keys(partionData.value).length
    default:
      return 0
  }
})

onMounted(() => {
  initLastData()
})

const onSelect = (key) => {
  indexActive.value = key
  switch (key) {
    case 'last':
      initLastData()
      break
    case 'mark':
      break
    case 'partition':
      break
  }
}

const initLastData = async () => {
  if (!Object.keys(messageData.sessionList).length) {
    const res = await msgChatSessionListService()
    messageData.setSessionList(res.data.data) //入缓存
  }

  Object.keys(messageData.sessionList).forEach((key) => {
    const lastMsgTime = messageData.sessionList[key].lastMsgTime
    const sessionType = messageData.sessionList[key].sessionType
    if (
      sessionType === MsgType.CHAT &&
      lastMsgTime &&
      Date.now() - new Date(lastMsgTime).getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      lastData.value[key] = messageData.sessionList[key]
    }
  })
}

const searchKey = ref('')
const lastDataSorted = computed(() => {
  if (!Object.keys(lastData)) return []

  let lastDataArr = []
  Object.values(lastData.value).forEach((item) => {
    if (!searchKey.value) {
      lastDataArr.push(item)
    } else {
      if (
        item.objectInfo.nickName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
        item.objectInfo.account === searchKey.value
      ) {
        lastDataArr.push(item)
      }
    }
  })

  if (!lastDataArr.length) return []

  return lastDataArr.sort((a, b) => {
    const bTime = new Date(b.lastMsgTime).getTime()
    const aTIme = new Date(a.lastMsgTime).getTime()
    return bTime - aTIme
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
  <el-container class="constact-user">
    <el-container>
      <el-aside class="bdr-r el-aside__contact-user">
        <el-menu default-active="last" @select="onSelect">
          <el-menu-item index="last">
            <lastIcon></lastIcon>
            <span>最近7天</span>
          </el-menu-item>
          <el-menu-item index="mark">
            <markIcon></markIcon>
            <span>备注</span>
          </el-menu-item>
          <el-menu-item index="partition">
            <partitionIcon></partitionIcon>
            <span>分组</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container v-if="indexActive === 'last'" class="el-container__last">
        <el-header class="bdr-b el-header__last" style="height: 48px">
          <div class="total-count">全部({{ totalCount }})</div>
          <el-input
            v-model="searchKey"
            placeholder="搜索：昵称/账号"
            :prefix-icon="Search"
            :clearable="true"
          />
        </el-header>
        <el-main class="el-main__last my-scrollbar" style="padding: 8px">
          <div v-if="lastDataSorted.length">
            <ContactsUserItem
              v-for="item in lastDataSorted"
              :key="item.sessionId"
              :session="item"
              :type="indexActive"
              @showUserCard="onShowUserCard"
            ></ContactsUserItem>
          </div>
          <HashNoData v-else :size="100"></HashNoData>
        </el-main>
      </el-container>
      <el-container v-if="indexActive === 'mark'" class="el-container__mark">
        <el-header class="bdr-b el-header__mark" style="height: 48px">mark</el-header>
        <el-main class="el-main__mark my-scrollbar"></el-main>
      </el-container>
      <el-container v-if="indexActive === 'partition'" class="el-container__partition">
        <el-header class="bdr-b el-header__partition" style="height: 48px">partition</el-header>
        <el-main class="el-main__partition my-scrollbar"></el-main>
      </el-container>
    </el-container>
  </el-container>
  <UserCard
    :isShow="isShowUserCard"
    :userInfo="userInfo"
    @close="isShowUserCard = false"
  ></UserCard>
</template>

<style lang="scss" scoped>
.constact-user {
  height: 100%;
}

.el-header__contact-user {
  width: 100%;
  height: 48px;
  line-height: 60px;
  padding-left: 15px;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.el-aside__contact-user {
  width: 150px;
  height: 100%;
  padding: 8px;
}

.el-menu {
  --el-menu-bg-color: #f5f5f5;
  border: 0;
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 5px;

  &:hover {
    background-color: #dedfe0;
  }
}

.is-active {
  --fillColor: #409eff;
  background-color: #dedfe0;
  //文字颜色默认是#409eff，可以用color修改
}

.el-header__last {
  display: flex;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  align-items: center;
  color: #409eff;
  font-size: 14px;
}

.el-input {
  width: 150px;
  height: 30px;
}

:deep(.el-input__wrapper) {
  border-radius: 25px;
}

.svg-icon {
  width: 20px;
  height: 20px;
  fill: var(--fillColor);
  margin-right: 8px;
  transition: fill var(--el-transition-duration); //过度时长沿用el-menu-item的
}
</style>
