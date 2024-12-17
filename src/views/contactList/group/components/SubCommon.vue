<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import AddButton from '@/components/common/AddButton.vue'
import HashNoData from '@/components/common/HasNoData.vue'
import SelectDialog from '@/components/common/SelectDialog.vue'
import { groupStore, userStore, messageStore, userCardStore, groupCardStore } from '@/stores'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { ElLoading, ElMessage } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { groupCreateService, groupSearchMemberService, groupInfoService } from '@/api/group'
import { msgChatQuerySessionService } from '@/api/message'
import ContactListGroupItem from '@/views/contactList/group/components/ContactListGroupItem.vue'
import { MsgType } from '@/proto/msg'

const props = defineProps(['tab'])

const groupData = groupStore()
const userData = userStore()
const messageData = messageStore()
const userCardData = userCardStore()
const groupCardData = groupCardStore()
const searchKey = ref('')
const searchData = ref([])
const isShowSelectDialog = ref(false)
const initDone = ref(false) //避免还未数据加载完时就显示无数据

onMounted(async () => {
  await messageData.loadSessionList()
  await messageData.loadPartitions()
  await groupData.loadGroupInfoList()
  initDone.value = true
})

const initData = computed(() => {
  if (!initDone.value) return {}

  let data = {}
  const values = Object.values(groupData.groupInfoList)
  switch (props.tab) {
    case undefined:
    case 'all':
    default:
      return groupData.groupInfoList
    case 'created':
      values.forEach((item) => {
        if (item.myRole === 2) {
          data[item.groupId] = item
        }
      })
      return data
    case 'managed':
      values.forEach((item) => {
        if (item.myRole > 0) {
          data[item.groupId] = item
        }
      })
      return data
    case 'joined':
      values.forEach((item) => {
        if (item.myRole === 0) {
          data[item.groupId] = item
        }
      })
      return data
  }
})

const showData = computed(() => {
  if (!searchKey.value) {
    return Object.values(initData.value)
  }

  const data = []
  const searchDataGroupIds = new Set(searchData.value?.map((item) => item.groupId))
  Object.values(initData.value).forEach((item) => {
    // 1.放群名称和群ID的匹配结果
    if (
      item.groupName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
      item.groupId === searchKey.value
    ) {
      item['sortMark'] = '1' // 让群名称和群ID的匹配结果放在前面, 因为群成员的匹配结果会滞后出现,如果不排序在出现的时候页面数据刷新变化很大
      data.push(item)
    } else if (searchDataGroupIds?.has(item.groupId)) {
      // 2.放群成员的匹配结果
      item['sortMark'] = '2'
      data.push(item)
    }
  })
  return data.sort((a, b) => {
    return a.sortMark - b.sortMark
  })
})

// 需要给符合条件的groupId保存下查询结果高亮的提示
const searchResultTips = computed(() => {
  const tips = {
    title: {},
    html: {}
  }

  if (!searchKey.value) {
    return tips
  }

  let nickNameMatchCnt = {} // 对同一个群的搜索结果个数计数
  searchData.value.forEach((item) => {
    const regex = new RegExp(searchKey.value, 'gi')
    if (item.nickName.toLowerCase().includes(searchKey.value.toLowerCase())) {
      if (item.groupId in nickNameMatchCnt) {
        nickNameMatchCnt[item.groupId] = nickNameMatchCnt[item.groupId] + 1
      } else {
        nickNameMatchCnt[item.groupId] = 1
      }

      //最多展示3个昵称,多的用"等x人"表示
      if (nickNameMatchCnt[item.groupId] === 4) {
        tips.title[item.groupId] =
          tips.title[item.groupId] + `等${nickNameMatchCnt[item.groupId]}人`
        tips.html[item.groupId] = tips.html[item.groupId] + `等${nickNameMatchCnt[item.groupId]}人`
      } else if (nickNameMatchCnt[item.groupId] > 4) {
        //do nothing
      } else {
        if (item.groupId in tips.title) {
          tips.title[item.groupId] = tips.title[item.groupId] + ', ' + item.nickName
          tips.html[item.groupId] =
            tips.html[item.groupId] +
            ', ' +
            item.nickName.replace(regex, `<span style="color: #409eff;">$&</span>`)
        } else {
          tips.title[item.groupId] = '包含：' + item.nickName
          tips.html[item.groupId] =
            '包含：' + item.nickName.replace(regex, `<span style="color: #409eff;">$&</span>`)
        }
      }
    } else if (item.account === searchKey.value) {
      tips.title[item.groupId] = '包含：' + item.account + `(${item.nickName})`
      tips.html[item.groupId] =
        '包含：' +
        item.account.replace(regex, `<span style="color: #409eff;">$&</span>`) +
        `(${item.nickName})`
    }
  })

  return tips
})

let timer
const onSearch = () => {
  if (!searchKey.value) {
    searchData.value = []
    return
  }

  clearTimeout(timer)
  const key = searchKey.value
  timer = setTimeout(() => {
    groupSearchMemberService({ searchKey: key }).then((res) => {
      searchData.value = res.data.data
    })
  }, 300)
}

const totalCount = computed(() => {
  return showData.value.length
})

const onCreateGroup = () => {
  isShowSelectDialog.value = true
}

const onShowUserCard = (account) => {
  const sessionId = combineId(account, userData.user.account)
  const loadingInstance = ElLoading.service(el_loading_options)
  userQueryService({ account: account })
    .then((res) => {
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
      userCardData.setUserInfo(res.data.data)
    })
    .finally(() => {
      loadingInstance.close()
      userCardData.setIsShow(true)
    })
}

/**
 * 用于显示创建群组弹窗中的候选成员名单
 */
const selectDialogOptions = computed(() => {
  const data = {}
  Object.values(messageData.sessionList).forEach((item) => {
    if (item.sessionType === MsgType.CHAT) {
      data[item.objectInfo.account] = item.objectInfo
    }
  })
  return data
})

const onConfirmSelect = async (selected) => {
  if (selected.length < 2) {
    ElMessage.warning('请至少选择两位群成员')
    return
  }

  const members = selected.map((item) => ({ account: item.account, nickName: item.nickName }))
  members.push({ account: userData.user.account, nickName: userData.user.nickName })
  const res = await groupCreateService({
    groupName: `${userData.user.nickName}、${selected[0].nickName}、${selected[1].nickName}等的群组`,
    groupType: 1, //普通群
    members: members
  })
  groupData.setGroupInfo({
    groupId: res.data.data.groupInfo.groupId,
    groupInfo: res.data.data.groupInfo
  })
  isShowSelectDialog.value = false

  // 所有成员拿到chat_session在群主创建群组的时候统一新增了，所有这里只需要查询
  msgChatQuerySessionService({
    sessionId: res.data.data.groupInfo.groupId
  }).then((res) => {
    messageData.addSession(res.data.data)
  })
}

const onShowGroupCard = async (groupInfo) => {
  const res = await groupInfoService({ groupId: groupInfo.groupId })
  groupCardData.setOpened(groupInfo.groupId)
  groupData.setGroupMembers({
    groupId: groupInfo.groupId,
    members: res.data.data.members
  })
}
</script>

<template>
  <el-container style="height: 100%">
    <el-header class="bdr-b">
      <div style="font-size: 14px">全部({{ totalCount }})</div>
      <div class="search-and-add">
        <el-input
          v-model.trim="searchKey"
          placeholder="搜索：群名称/群ID/成员群昵称/成员账号"
          :prefix-icon="Search"
          :clearable="true"
          @input="onSearch"
        />
        <AddButton :size="20" @click="onCreateGroup"></AddButton>
      </div>
    </el-header>
    <el-main class="my-scrollbar" style="padding: 8px">
      <div v-if="showData.length">
        <ContactListGroupItem
          v-for="item in showData"
          :key="item.groupId"
          :groupInfo="item"
          :keyWords="searchKey"
          @showGroupCard="onShowGroupCard(item)"
        >
          <template #showMore_1>
            <div
              style="cursor: pointer; color: #409eff; width: 100px; text-align: center"
              @click="onShowGroupCard(item)"
            >
              查看详情
            </div>
          </template>
          <template #showMore_2>
            <div
              class="text-ellipsis"
              :title="searchResultTips.title[item.groupId]"
              v-html="searchResultTips.html[item.groupId]"
              style="width: 200px"
            ></div>
          </template>
        </ContactListGroupItem>
      </div>
      <HashNoData v-else-if="showData.length === 0 && initDone" :size="100"></HashNoData>
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
    width: 300px;
    height: 30px;
    margin-right: 10px;

    :deep(.el-input__wrapper) {
      border-radius: 25px;
    }
  }
}
</style>
