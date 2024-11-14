<script setup>
import { ref, computed, watch } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import GroupItem from '@/components/item/GroupItem.vue'
import { ArrowLeft, ArrowRight, Edit } from '@element-plus/icons-vue'
import groupChatIcon from '@/assets/svg/groupchat.svg'
import AvatarIcon from '@/components/common/AvatarIcon.vue'
import AddButton from '@/components/common/AddButton.vue'
import DeleteButton from '@/components/common/DeleteButton.vue'
import EditAvatar from '@/components/common/EditAvatar.vue'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { groupStore, userStore, messageStore, userCardStore, groupCardStore } from '@/stores'
import SelectDialog from '../common/SelectDialog.vue'
import { groupAddMembersService, groupDelMembersService, groupUpdateInfoService } from '@/api/group'

const groupData = groupStore()
const userData = userStore()
const messageData = messageStore()
const userCardData = userCardStore()
const groupCardData = groupCardStore()
const isShowSelectDialog = ref(false)
const method = ref('') //有加人，减人两中method
const showModel = ref('info')
const returnModelList = ref([]) //showModel的返回栈,用数组的push和pop实现
const isShowEditAvatar = ref(false)
const myAccount = computed(() => userData.user.account)

// 如果切换群组，重置数据
watch(
  () => groupCardData.groupInfo.groupId,
  () => {
    showModel.value = 'info'
    returnModelList.value = []
  }
)

const onShowMembers = () => {
  returnModelList.value.push(showModel.value)
  showModel.value = 'members'
}

const showMembers = computed(() => groupData.groupMembers[groupCardData.groupInfo.groupId])

/**
 * 按照role倒序排
 */
const showMembersArrSorted = computed(() => {
  return Object.values(groupData.groupMembers[groupCardData.groupInfo.groupId]).sort(
    (a, b) => b.role - a.role
  )
})

const isOwner = computed(() => {
  return showMembers.value[myAccount.value].role === 2
})

const isManager = computed(() => {
  return showMembers.value[myAccount.value].role > 0
})

/**
 * 如果开启全员邀请（默认开启）或者是管理员，可以看到加人按钮
 * @param memberInfo 成员信息
 */
const isShowAddButton = computed(() => {
  if (groupCardData.groupInfo.allInvite || isManager.value) {
    return true
  } else {
    return false
  }
})

/**
 * 如果是管理员，可以看到移除按钮
 * @param memberInfo 成员信息
 */
const isShowDelButton = computed(() => {
  if (isManager.value) {
    return true
  } else {
    return false
  }
})

const showMembersCount = computed(() => {
  let totalCount = 10 // 一共10个显示位，包括加人/减人按钮
  if (isShowAddButton.value) totalCount--
  if (isShowDelButton.value) totalCount--
  return totalCount
})

const onShowUserCard = (account) => {
  const sessionId = combineId(account, myAccount.value)
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

const selectDialogOptions = computed(() => {
  if (method.value === 'add') {
    const data = {}
    Object.values(messageData.sessionList).forEach((item) => {
      data[item.objectInfo.account] = item.objectInfo
    })
    return data
  } else if (method.value === 'del') {
    return showMembers.value
  } else {
    return {}
  }
})

const selectDialogDisabledOptions = computed(() => {
  if (method.value === 'add') {
    return Object.keys(showMembers.value)
  } else if (method.value === 'del') {
    const data = []
    Object.values(showMembers.value).forEach((item) => {
      if (item.account === myAccount.value) data.push(item.account) // 删除时要排除自己
      if (item.role === 2) data.push(item.account) // 群主不能删
      if (item.role === 1 && !isOwner.value) data.push(item.account) //管理员只有群组能删
    })
    return data
  } else {
    return []
  }
})

const searchModel = computed(() => {
  return method.value === 'add' ? 'server' : 'default'
})

const onAddmember = () => {
  isShowSelectDialog.value = true
  method.value = 'add'
}

const delAddmember = () => {
  isShowSelectDialog.value = true
  method.value = 'del'
}

const selectDialogTitle = computed(() => {
  return method.value === 'add' ? '添加成员' : '移除成员'
})

const onConfirmSelect = (selected) => {
  isShowSelectDialog.value = false // 这里要先关闭，不然移除的时候会报错
  const accounts = selected.map((item) => item.account)
  const loadingInstance = ElLoading.service(el_loading_options)
  if (method.value === 'add') {
    groupAddMembersService({
      groupId: groupCardData.groupInfo.groupId,
      accounts: accounts
    })
      .then((res) => {
        if (res.data.data) {
          groupData.setGroupMembers({
            groupId: groupCardData.groupInfo.groupId,
            members: res.data.data.members
          })
          ElMessage.success('添加成功')
        } else {
          ElMessage.error('添加失败')
        }
      })
      .finally(() => {
        loadingInstance.close()
      })
  } else if (method.value === 'del') {
    groupDelMembersService({
      groupId: groupCardData.groupInfo.groupId,
      accounts: accounts
    })
      .then((res) => {
        if (res.data.data) {
          groupData.setGroupMembers({
            groupId: groupCardData.groupInfo.groupId,
            members: res.data.data.members
          })
          ElMessage.success('移除成功')
        } else {
          ElMessage.error('移除失败')
        }
      })
      .finally(() => {
        loadingInstance.close()
      })
  }
}

const onEditGroupAvatarAndName = () => {
  returnModelList.value.push(showModel.value)
  showModel.value = 'editAvatarAndName'
}

const onReturnModel = () => {
  showModel.value = returnModelList.value.pop()
}

const onNewAvatar = ({ avatar, avatarThumb }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  groupUpdateInfoService({
    groupId: groupCardData.groupInfo.groupId,
    avatar: avatar,
    avatarThumb: avatarThumb
  })
    .then(() => {
      groupCardData.setGroupInfo({
        ...groupCardData.groupInfo,
        avatar: avatar,
        avatarThumb: avatarThumb
      })
    })
    .finally(() => {
      loadingInstance.close()
    })
}
</script>

<template>
  <el-drawer
    class="group-card"
    :modelValue="groupCardData.isShow"
    :direction="'rtl'"
    :size="380"
    :z-index="1"
    modal-class="group-card-modal"
    :show-close="false"
    @close="groupCardData.setIsShow(false)"
  >
    <template #header>
      <div style="height: 24px; display: flex">
        <el-icon
          v-if="returnModelList.length > 0"
          size="24"
          title="返回"
          style="cursor: pointer"
          @click="onReturnModel"
        >
          <ArrowLeft />
        </el-icon>
        <span v-if="showModel === 'info'" class="group-card-title"> 群信息 </span>
        <span v-if="showModel === 'editAvatarAndName'" class="group-card-title">
          修改群组名称或头像
        </span>
        <span v-if="showModel === 'members'" class="group-card-title">
          群组成员 {{ Object.values(showMembers)?.length }}名
        </span>
      </div>
    </template>

    <div v-if="showModel === 'info'" class="group-card-info">
      <div class="group-card-avatar-wrapper">
        <GroupItem
          class="group-card-avatar"
          :groupInfo="groupCardData.groupInfo"
          :disableClickAvatar="true"
        ></GroupItem>
        <el-icon
          v-if="isManager"
          class="edit"
          size="20"
          title="修改群组名称或头像"
          @click="onEditGroupAvatarAndName"
        >
          <Edit />
        </el-icon>
      </div>
      <div class="group-card-members">
        <div class="group-card-members-title">
          <span style="font-size: 14px">群组成员</span>
          <div
            style="
              font-size: 12px;
              color: gray;
              display: flex;
              align-items: center;
              cursor: pointer;
            "
            @click="onShowMembers"
          >
            查看{{ Object.values(showMembers)?.length }}名群组成员
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="group-card-members-grid">
          <div
            class="group-card-members-grid-item"
            v-for="item in showMembersArrSorted?.slice(0, showMembersCount)"
            :key="item.account"
          >
            <AvatarIcon
              :showName="item.nickName"
              :showId="item.account"
              :showAvatarThumb="item.avatarThumb"
              :userStatus="item.status"
              @click="onShowUserCard(item.account)"
            ></AvatarIcon>
            <div class="text text-ellipsis" :title="item.nickName">
              {{ item.nickName }}
            </div>
          </div>
          <div class="group-card-members-grid-item" v-if="isShowAddButton">
            <AddButton :size="40" @click="onAddmember"></AddButton>
            <div class="text">添加成员</div>
          </div>
          <div class="group-card-members-grid-item" v-if="isShowDelButton">
            <DeleteButton :size="40" @click="delAddmember"></DeleteButton>
            <div class="text">移除成员</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModel === 'editAvatarAndName'" class="group-card-editAvatarAndName">
      <div @click="isShowEditAvatar = true">
        <el-avatar
          class="group-card-avatar"
          v-if="groupCardData.groupInfo.avatarThumb"
          :src="groupCardData.groupInfo.avatarThumb"
          :size="100"
          shape="square"
        />
        <groupChatIcon
          class="group-card-avatar"
          v-else
          style="width: 100px; height: 100px"
        ></groupChatIcon>
      </div>
      <el-button
        class="group-card-avatar-edit-btn"
        type="info"
        plain
        @click="isShowEditAvatar = true"
      >
        更换头像
      </el-button>
    </div>
  </el-drawer>
  <SelectDialog
    v-model="isShowSelectDialog"
    :options="selectDialogOptions"
    :disabledOptions="selectDialogDisabledOptions"
    :searchModel="searchModel"
    @showUserCard="onShowUserCard"
    @confirm="onConfirmSelect"
  >
    <template #title>
      <div style="font-size: 16px; font-weight: bold; white-space: nowrap">
        {{ selectDialogTitle }}
      </div>
    </template>
  </SelectDialog>
  <EditAvatar
    v-model="isShowEditAvatar"
    :model="'group'"
    :groupInfo="groupCardData.groupInfo"
    @update:newAvatar="onNewAvatar"
  ></EditAvatar>
</template>

<style lang="scss">
.group-card-modal {
  background-color: transparent;

  .el-drawer__header {
    margin: 0;
    font-weight: bold;
  }
}

.group-card-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.group-card-info {
  .group-card-avatar-wrapper {
    position: relative;

    .group-card-avatar {
      padding: 10px 12px 10px 12px;
      border-radius: 8px;
      background-color: #f5f5f5;
      display: flex;
    }

    .edit {
      padding: 4px;
      position: absolute;
      right: 0;
      bottom: 0;
      background-color: transparent;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background-color: #dedfe0;
      }
    }
  }

  .group-card-members {
    height: 160px;
    padding: 10px;
    margin-top: 20px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;

    .group-card-members-title {
      width: 100%;
      height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .group-card-members-grid {
      margin-top: 10px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .group-card-members-grid-item {
        width: 60px;
        margin: 2px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .text {
          width: 100%;
          margin-top: 5px;
          overflow: hidden;
          font-size: 12px;
          color: gray;
          text-align: center;
        }
      }
    }
  }
}

.group-card-editAvatarAndName {
  display: flex;
  flex-direction: column;
  align-items: center;

  .group-card-avatar {
    border: #e9e9eb solid 2px;
    background-color: #f5f5f5;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      border: #409eff solid 2px;
    }
  }

  .group-card-avatar-edit-btn {
    margin-top: 20px;
  }
}
</style>
