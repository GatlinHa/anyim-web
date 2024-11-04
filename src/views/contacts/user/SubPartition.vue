<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, MoreFilled } from '@element-plus/icons-vue'
import AddButton from '@/components/common/AddButton.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import HashNoData from '@/components/common/HasNoData.vue'
import PartitionOprMenu from '@/components/contacts/user/PartitionOprMenu.vue'
import ContactsUserItem from '@/components/contacts/user/ContactsUserItem.vue'
import UserCard from '@/components/user/UserCard.vue'
import { userQueryService } from '@/api/user'
import {
  msgChatSessionListService,
  msgCreatePartitionService,
  msgDeletePartitionService,
  msgUpdatePartitionService
} from '@/api/message'
import { PARTITION_TYPE } from '@/const/userConst'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messageStore } from '@/stores'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'

const messageData = messageStore()
const partitionSearchKey = ref('')
const userSearchKey = ref('')
const isShowAddPartitionDialog = ref(false)
const isShowRenamePartitionDialog = ref(false)
const oprMenuRef = ref()
const showOprMenuPartitionId = ref(0)
const selectedIndex = ref('')

const isAddSession = ref(false)
const addSessionSelected = ref([])
const addSessionPartitionId = ref(null)
const addSessionTransferRef = ref()

onMounted(async () => {
  if (!Object.keys(messageData.sessionList).length) {
    const res = await msgChatSessionListService()
    messageData.setSessionList(res.data.data) //入缓存
  }

  if (Object.keys(partitions.value).length > 0) {
    selectedIndex.value = Object.keys(partitions.value)[0].toString()
  }
})

const partitions = computed(() => {
  return messageData.partitions
})

const totalCount = computed(() => {
  return detailData.value.length
})

const onSelectPartitionItem = (key) => {
  selectedIndex.value = key
}

const detailData = computed(() => {
  const trimKey = userSearchKey.value.trim()
  const data = []
  Object.values(messageData.sessionList).forEach((item) => {
    if (item.partitionId.toString() === selectedIndex.value) {
      if (!trimKey) {
        data.push(item)
      } else {
        if (
          item.objectInfo.nickName.toLowerCase().includes(trimKey.toLowerCase()) ||
          item.objectInfo.account === trimKey
        )
          data.push(item)
      }
    }
  })
  return data
})

const hasNoParitionSessions = computed(() => {
  const data = []
  Object.values(messageData.sessionList).forEach((item) => {
    if (item.partitionId === 0) {
      data.push({
        key: item.sessionId,
        label: item.objectInfo.nickName
      })
    }
  })
  return data
})

const partitionsBySearch = computed(() => {
  const trimKey = partitionSearchKey.value.trim()
  if (!trimKey) {
    return partitions.value
  } else {
    const data = {}
    Object.values(partitions.value).forEach((item) => {
      if (item.partitionName.toLowerCase().includes(trimKey.toLowerCase())) {
        data[item.partitionId] = item
      }
    })
    return data
  }
})

const onAddPartitionConfirm = (inputValue) => {
  msgCreatePartitionService({
    partitionName: inputValue,
    partitionType: PARTITION_TYPE.USER
  }).then((res) => {
    if (res.data.code === 0) {
      const resData = res.data.data
      partitions.value[resData.partitionId] = resData
      ElMessage.success('新建分组成功')
    }
  })
  isShowAddPartitionDialog.value = false
}

const onRenamePartitionConfirm = (inputValue) => {
  // 如果没有更新，不需要执行保存
  if (inputValue !== partitions.value[showOprMenuPartitionId.value].partitionName) {
    msgUpdatePartitionService({
      partitionId: showOprMenuPartitionId.value,
      newPartitionName: inputValue
    }).then((res) => {
      if (res.data.code === 0) {
        partitions.value[showOprMenuPartitionId.value]['partitionName'] = inputValue
        ElMessage.success('修改成功')
      }
    })
  }

  isShowRenamePartitionDialog.value = false
}

const onSelectOprMenu = (label) => {
  switch (label) {
    case 'addSession':
      onShowAddSessionByButton(showOprMenuPartitionId.value)
      break
    case 'updateName':
      isShowRenamePartitionDialog.value = true
      break
    case 'delete':
      ElMessageBox.confirm(
        `确认要【${partitions.value[showOprMenuPartitionId.value].partitionName}】及组内联系人吗？`,
        '温馨提示',
        {
          type: 'warning',
          confirmButtonText: '确认',
          cancelButtonText: '取消'
        }
      ).then(() => {
        msgDeletePartitionService({ partitionId: showOprMenuPartitionId.value }).then((res) => {
          if (res.data.code === 0) {
            delete partitions.value[showOprMenuPartitionId.value]
            if (
              !Object.keys(partitions.value).includes(parseInt(selectedIndex.value)) &&
              Object.keys(partitions.value).length > 0
            ) {
              selectedIndex.value = Object.keys(partitions.value)[0].toString()
            } else if (Object.keys(partitions.value).length === 0) {
              selectedIndex.value = ''
            }
            ElMessage.success('删除成功')
          }
        })
      })
      break
    default:
      break
  }
}

const onCustomContextMenu = (partitionId) => {
  showOprMenuPartitionId.value = partitionId
}

const showOperationMenu = (e, partitionId) => {
  showOprMenuPartitionId.value = partitionId
  oprMenuRef.value.handleSessionMenu(e)
}

const onShowAddSessionByButton = (partitionId) => {
  addSessionPartitionId.value = partitionId
  addSessionSelected.value = []
  isAddSession.value = true
}

const onCloseAddSession = () => {
  addSessionTransferRef.value.clearQuery('left')
  addSessionTransferRef.value.clearQuery('right')
  isAddSession.value = false
}

const onSaveAddSession = () => {
  addSessionSelected.value.forEach((sessionId) => {
    messageData.updateSession({
      sessionId: sessionId,
      partitionId: partitions.value[addSessionPartitionId.value].partitionId
    })
  })
  isAddSession.value = false
}

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
  <el-container class="sub-partition-wrapper">
    <el-aside class="partition bdr-r">
      <el-container style="height: 100%">
        <el-header class="bdr-b">
          <el-input
            v-model="partitionSearchKey"
            placeholder="搜索: 分组名称"
            :prefix-icon="Search"
            :clearable="true"
          />
          <AddButton :size="20" @click="isShowAddPartitionDialog = true"></AddButton>
        </el-header>
        <el-main class="my-scrollbar">
          <el-menu
            v-if="Object.keys(partitionsBySearch).length > 0"
            :default-active="selectedIndex"
            @select="onSelectPartitionItem"
          >
            <PartitionOprMenu ref="oprMenuRef" @selectMenu="onSelectOprMenu">
              <el-menu-item
                v-for="item in Object.values(partitionsBySearch)"
                :key="item.partitionId"
                :index="`${item.partitionId}`"
                @contextmenu.prevent="onCustomContextMenu(item.partitionId)"
              >
                <span class="text-ellipsis" :title="item.partitionName">
                  {{ item.partitionName }}
                </span>
                <el-icon :size="15" @click.stop="showOperationMenu($event, item.partitionId)">
                  <MoreFilled />
                </el-icon>
              </el-menu-item>
            </PartitionOprMenu>
          </el-menu>
          <HashNoData v-else :size="50"></HashNoData>
        </el-main>
      </el-container>
    </el-aside>
    <el-container class="detail">
      <el-header class="bdr-b">
        <div style="font-size: 14px">全部({{ totalCount }})</div>
        <div class="search-and-add">
          <el-input
            v-model="userSearchKey"
            placeholder="搜索：昵称/账号"
            :prefix-icon="Search"
            :clearable="true"
          />
          <AddButton
            :size="20"
            @click="onShowAddSessionByButton(parseInt(selectedIndex))"
          ></AddButton>
        </div>
      </el-header>
      <el-main class="my-scrollbar" style="height: 100%; padding: 8px; overflow-y: scroll">
        <div v-if="detailData.length > 0">
          <ContactsUserItem
            v-for="item in detailData"
            :key="item.sessionId"
            :session="item"
            :type="'partition'"
            :partitions="partitions"
            @showUserCard="onShowUserCard"
          ></ContactsUserItem>
        </div>
        <HashNoData v-else :size="100"></HashNoData>
      </el-main>
    </el-container>
  </el-container>
  <EditDialog
    :isShow="isShowAddPartitionDialog"
    :title="'添加分组'"
    :placeholder="'请输入分组名称'"
    @close="isShowAddPartitionDialog = false"
    @confirm="onAddPartitionConfirm"
  ></EditDialog>
  <EditDialog
    :isShow="isShowRenamePartitionDialog"
    :title="'修改分组名：'"
    :titleExt="`${partitions[showOprMenuPartitionId]?.partitionName}`"
    :placeholder="'请输入分组名称'"
    :defaultInput="`${partitions[showOprMenuPartitionId]?.partitionName}`"
    @close="isShowRenamePartitionDialog = false"
    @confirm="onRenamePartitionConfirm"
  ></EditDialog>
  <el-dialog
    class="add-session-dialog"
    v-model="isAddSession"
    :modal="false"
    :top="'30vh'"
    :width="'600px'"
    :z-index="1"
    style="border-radius: 10px"
    @close="onCloseAddSession"
  >
    <template #header>
      <div style="display: flex; flex-direction: row; justify-content: start; align-items: center">
        <div style="font-size: 16px; font-weight: bold; white-space: nowrap">为分组</div>
        <div
          class="text-ellipsis"
          style="
            margin: 0 5px 0 5px;
            padding: 2px;
            font-size: 14px;
            border-radius: 4px;
            background: #ebedf0;
          "
        >
          {{ partitions[addSessionPartitionId].partitionName }}
        </div>
        <div style="font-size: 16px; font-weight: bold; white-space: nowrap">添加联系人</div>
      </div>
    </template>
    <el-transfer
      ref="addSessionTransferRef"
      v-model="addSessionSelected"
      :data="hasNoParitionSessions"
      filterable
      filter-placeholder="请输入昵称"
      :titles="['未分组联系人', '已选择']"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="isAddSession = false" plain>取消</el-button>
        <el-button type="primary" @click="onSaveAddSession" plain>保存</el-button>
      </div>
    </template>
  </el-dialog>
  <UserCard
    :isShow="isShowUserCard"
    :userInfo="userInfo"
    @close="isShowUserCard = false"
  ></UserCard>
</template>

<style lang="scss" scoped>
.sub-partition-wrapper {
  height: 100%;
  display: flex;
  justify-content: start;

  .partition {
    width: 190px;

    .el-header {
      height: 48px;
      padding: 0 8px 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .el-input {
        width: 140px;
        height: 30px;

        :deep(.el-input__wrapper) {
          border-radius: 25px;
        }
      }
    }

    .el-main {
      padding: 5px;
      overflow-y: scroll;

      .el-menu {
        border: 0;
        --el-menu-bg-color: #f5f5f5;
      }

      .el-menu-item {
        height: 40px;
        padding: 0 0 0 10px;
        border-radius: 4px;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        cursor: auto;

        &:hover {
          background-color: #dedfe0;
        }

        .el-icon {
          cursor: pointer;
        }
      }

      .is-active {
        background-color: #dedfe0;
      }
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
          width: 150px;
          height: 30px;
          margin-right: 10px;

          :deep(.el-input__wrapper) {
            border-radius: 25px;
          }
        }
      }
    }
  }
}
</style>
