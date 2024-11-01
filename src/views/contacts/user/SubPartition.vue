<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, MoreFilled } from '@element-plus/icons-vue'
import AddButton from '@/components/common/AddButton.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import HashNoData from '@/components/common/HasNoData.vue'
import PartitionOprMenu from '@/components/contacts/user/PartitionOprMenu.vue'
import ContactsUserItem from '@/components/contacts/user/ContactsUserItem.vue'
import {
  userCreatePartitionService,
  userQueryPartitionService,
  userDeletePartitionService,
  userUpdatePartitionService
} from '@/api/user'
import { msgChatSessionListService } from '@/api/message'
import { PARTITION_TYPE } from '@/const/userConst'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messageStore } from '@/stores'

const messageData = messageStore()
const partitions = ref({})
const totalCount = ref(0)
const partitionSearchKey = ref('')
const userSearchKey = ref('')
const isShowAddPartitionDialog = ref(false)
const isShowRenamePartitionDialog = ref(false)
const oprMenuRef = ref()
const showOprMenuPartitionId = ref(0)
const selectedPartitionId = ref(null)

onMounted(async () => {
  if (!Object.keys(messageData.sessionList).length) {
    const res = await msgChatSessionListService()
    messageData.setSessionList(res.data.data) //入缓存
  }

  const res = await userQueryPartitionService()
  res.data.data.forEach((item) => {
    partitions.value[item.partitionId] = item
  })

  if (Object.keys(partitions.value).length > 0) {
    selectedPartitionId.value = Object.keys(partitions.value)[0]
  }
})

const onSelectPartitionItem = (key) => {
  selectedPartitionId.value = key
}

const detailData = computed(() => {
  const data = []
  Object.values(messageData.sessionList).forEach((item) => {
    if (item.partitionId.toString() === selectedPartitionId.value) {
      data.push(item)
    }
  })
  return data
})

const partitionShowList = computed(() => {
  if (!partitionSearchKey.value) {
    return partitions.value
  } else {
    const data = {}
    Object.keys(partitions.value).forEach((key) => {
      if (
        partitions.value[key].partitionName
          .toLowerCase()
          .includes(partitionSearchKey.value.toLowerCase())
      ) {
        data[key] = partitions.value[key]
      }
    })
    return data
  }
})

const onAddPartitionConfirm = (inputValue) => {
  userCreatePartitionService({
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
    userUpdatePartitionService({
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

const onSelectMenu = (label) => {
  switch (label) {
    case 'addUser':
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
        userDeletePartitionService({ partitionId: showOprMenuPartitionId.value }).then((res) => {
          if (res.data.code === 0) {
            delete partitions.value[showOprMenuPartitionId.value]
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

const onShowUserCard = () => {}
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
            v-if="Object.keys(partitionShowList).length > 0"
            :default-active="`${Object.keys(partitionShowList)[0]}`"
            @select="onSelectPartitionItem"
          >
            <PartitionOprMenu ref="oprMenuRef" @selectMenu="onSelectMenu">
              <el-menu-item
                v-for="item in Object.values(partitionShowList)"
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
          <AddButton :size="20"></AddButton>
        </div>
      </el-header>
      <el-main class="my-scrollbar" style="height: 100%; padding: 8px; overflow-y: scroll">
        <div v-if="detailData.length > 0">
          <ContactsUserItem
            v-for="item in detailData"
            :key="item.sessionId"
            :session="item"
            :type="'partition'"
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

    .el-main {
    }
  }
}
</style>
