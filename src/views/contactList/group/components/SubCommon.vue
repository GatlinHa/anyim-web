<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import AddButton from '@/components/common/AddButton.vue'
import HashNoData from '@/components/common/HasNoData.vue'
import UserCard from '@/components/card/UserCard.vue'
import SelectDialog from '@/components/common/SelectDialog.vue'
import { groupStore, userStore, messageStore } from '@/stores'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { ElLoading, ElMessage } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { groupCreateService, groupSearchByMemberService } from '@/api/group'
import ContactListGroupItem from '@/views/contactList/group/components/ContactListGroupItem.vue'

const props = defineProps(['tab'])

const groupData = groupStore()
const userData = userStore()
const messageData = messageStore()
const searchKey = ref('')
const isShowSelectDialog = ref(false)
const showData = ref({})
const initDone = ref(false) //避免还未数据加载完时就显示无数据

onMounted(async () => {
  messageData.loadSessionList()
  switch (props.tab) {
    case undefined:
    case 'all':
      await groupData.loadGroupListAll()
      break
    case 'created':
      await groupData.loadGroupListCreated()
      break
    case 'managed':
      await groupData.loadGroupListManaged()
      break
    case 'joined':
      await groupData.loadGroupListJoined()
      break
    default:
      break
  }
  initDone.value = true
  showData.value = initData.value
})

const initData = computed(() => {
  switch (props.tab) {
    case undefined:
    case 'all':
    default:
      return groupData.groupListAll
    case 'created':
      return groupData.groupListCreated
    case 'managed':
      return groupData.groupListManaged
    case 'joined':
      return groupData.groupListJoined
  }
})

const selectDialogOptions = computed(() => {
  const data = {}
  Object.values(messageData.sessionList).forEach((item) => {
    data[item.objectInfo.account] = item.objectInfo
  })
  return data
})

// 需要给符合条件的groupId保存下查询结果高亮的提示
const searchResultTips = ref({})

// 这里不能使用计算属性的特点去改变showData的值
// 因为这里有云端查询，会有延迟，会二次改变showData，造成页面数据跳变
let timer
const onSearch = () => {
  if (!searchKey.value) {
    showData.value = initData.value
    searchResultTips.value = {}
    return
  }

  clearTimeout(timer)
  const key = searchKey.value
  timer = setTimeout(() => {
    const queryResult = {}
    groupSearchByMemberService({ searchKey: key }).then((res) => {
      res.data.data?.forEach((item) => {
        queryResult[item.groupId] = item //如果有多个相同的groupid结果，这里只放最后个（后面覆盖前面）
      })

      const data = {}
      searchResultTips.value = {}
      Object.values(initData.value).forEach((item) => {
        // 1.放群名称和群ID的匹配结果
        if (
          item.groupName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
          item.groupId === searchKey.value
        ) {
          data[item.groupId] = item
        }
        // 2.放群成员的匹配结果
        if (item.groupId in queryResult) {
          data[item.groupId] = item

          // 需要给符合条件的groupId保存下查询结果高亮的提示
          const regex = new RegExp(searchKey.value, 'gi')
          if (
            queryResult[item.groupId].memberNickName
              .toLowerCase()
              .includes(searchKey.value.toLowerCase())
          ) {
            searchResultTips.value[item.groupId] =
              '包含：' +
              queryResult[item.groupId].memberNickName.replace(
                regex,
                `<span style="color: #409eff;">$&</span>`
              )
          } else if (queryResult[item.groupId].memberAccount === searchKey.value) {
            searchResultTips.value[item.groupId] =
              '包含：' +
              queryResult[item.groupId].memberAccount.replace(
                regex,
                `<span style="color: #409eff;">$&</span>`
              ) +
              `(${queryResult[item.groupId].memberNickName})`
          }
        }
      })
      showData.value = data
    })
  }, 300)
}

const totalCount = computed(() => {
  return Object.keys(showData.value).length
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
    groupName: `${userData.user.nickName}、${selected[0].nickName}、${selected[1].nickName}等的群组`,
    groupType: 1, //普通群
    accounts: selected.map((item) => item.account)
  })
  groupData.addCreatedGroup(res.data.data.groupInfo)
  isShowSelectDialog.value = false
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
      <div v-if="Object.keys(showData).length">
        <ContactListGroupItem
          v-for="item in Object.values(showData)"
          :key="item.groupId"
          :groupInfo="item"
          :keyWords="searchKey"
          @showUserCard="onShowUserCard"
        >
          <template #showMore_1>
            <div v-html="searchResultTips[item.groupId]" style="min-width: 200px"></div>
          </template>
          <template #showMore_2>
            <div style="cursor: pointer; color: #409eff; min-width: 60px">查看详情</div>
          </template>
        </ContactListGroupItem>
      </div>
      <HashNoData
        v-else-if="Object.keys(showData).length === 0 && initDone"
        :size="100"
      ></HashNoData>
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
    width: 300px;
    height: 30px;
    margin-right: 10px;

    :deep(.el-input__wrapper) {
      border-radius: 25px;
    }
  }
}
</style>
