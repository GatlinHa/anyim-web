<script setup>
import { ref, computed, watch } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { Avatar, Search, Mute, ArrowLeft, ArrowRight, Edit } from '@element-plus/icons-vue'
import { el_loading_options } from '@/const/commonConst'
import GroupItem from '@/components/item/GroupItem.vue'
import UserAvatarIcon from '@/components/common/UserAvatarIcon.vue'
import GroupAvatarIcon from '@/components/common/GroupAvatarIcon.vue'
import AddButton from '@/components/common/AddButton.vue'
import DeleteButton from '@/components/common/DeleteButton.vue'
import EditAvatar from '@/components/common/EditAvatar.vue'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { groupStore, userStore, messageStore, userCardStore, groupCardStore } from '@/stores'
import SelectDialog from '../common/SelectDialog.vue'
import SingleSelectDialog from '../common/SingleSelectDialog.vue'
import {
  groupAddMembersService,
  groupDelMembersService,
  groupUpdateInfoService,
  groupChangeRoleService,
  groupUpdateNickNameInGroupService,
  groupLeaveService,
  groupDropService,
  groupOwnerTransferService,
  groupUpdateMuteService
} from '@/api/group'
import { MsgType } from '@/proto/msg'
import router from '@/router'

const groupData = groupStore()
const userData = userStore()
const messageData = messageStore()
const userCardData = userCardStore()
const groupCardData = groupCardStore()
const isShowSelectDialog = ref(false)
const isShowSingleSelectDialog = ref(false)
const isShowEditAvatar = ref(false)
const myAccount = computed(() => userData.user.account)
const newGroupName = ref('')
const newGroupMark = ref('')
const isTop = ref()
const isDnd = ref()
const newAnnouncement = ref('')
const memberSearchKey = ref('')
const newMyNickNameInGroup = ref('')
const isAllMuted = ref()
const isJoinGroupApproval = ref()
const isHistoryBrowse = ref(false)
const settingOption = ref('chatSetting')

// 打开GroupCard时，重置数据
watch(
  () => groupCardData.isShow,
  (newValue) => {
    if (newValue) {
      groupCardData.setShowModel('info')
      newMyNickNameInGroup.value = showMembers.value[myAccount.value].nickName
      settingOption.value = 'chatSetting'
      isJoinGroupApproval.value = groupInfo.value.joinGroupApproval
      isAllMuted.value = groupInfo.value.allMuted
      isHistoryBrowse.value = groupInfo.value.historyBrowse
      isTop.value = sessionInfo.value.top
      isDnd.value = sessionInfo.value.dnd
    } else {
      groupCardData.setShowModel('')
      groupCardData.setChangeMemberModel('')
    }
  }
)

watch(
  () => groupCardData.showModel,
  (newValue) => {
    switch (newValue) {
      case 'editAvatarAndName':
        newGroupName.value = groupInfo.value.groupName
        newGroupMark.value = sessionInfo.value.mark
        break
      case 'editAnnouncement':
        newAnnouncement.value = groupInfo.value.announcement
        break
      case 'info':
      case 'members':
      default:
        break
    }
  }
)

watch(
  () => groupCardData.changeMemberModel,
  (newValue) => {
    switch (newValue) {
      case 'addMember':
        isShowSelectDialog.value = true
        break
      case 'delMember':
        isShowSelectDialog.value = true
        break
      default:
        break
    }
  }
)

const goToSessionTab = () => {
  router.push({
    path: '/message',
    query: {
      sessionId: sessionInfo.value.sessionId
    }
  })
  groupCardData.setIsShow(false)
  groupCardData.setGroupId('')
}

const groupInfo = computed(() => {
  return groupData.groupInfoList[groupCardData.groupId] || {}
})

const sessionInfo = computed(() => {
  const sessionId = groupCardData.groupId
  return messageData.sessionList[sessionId] || {}
})

const showMembers = computed(() => groupData.groupMembersList[groupCardData.groupId] || {})

/**
 * 按照role倒序排
 */
const showMembersArrSorted = computed(() => {
  const data = []
  Object.values(showMembers.value).forEach((item) => {
    if (!memberSearchKey.value) {
      data.push(item)
    } else {
      if (
        item.nickName.toLowerCase().includes(memberSearchKey.value.toLowerCase()) ||
        item.account === memberSearchKey.value
      ) {
        data.push(item)
      }
    }
  })

  return data.sort((a, b) => b.role - a.role)
})

const iAmOwner = computed(() => {
  return showMembers.value[myAccount.value]?.role === 2
})

const iAmManager = computed(() => {
  return showMembers.value[myAccount.value]?.role > 0
})

/**
 * 如果开启全员邀请（默认开启）或者是管理员，可以看到加人按钮
 * @param memberInfo 成员信息
 */
const isShowAddButton = computed(() => {
  if (groupInfo.value?.joinGroupApproval || iAmManager.value) {
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
  if (iAmManager.value) {
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
  if (changeMemberModel.value === 'addMember') {
    const data = {}
    Object.values(messageData.sessionList).forEach((item) => {
      if (item.sessionType === MsgType.CHAT) {
        data[item.objectInfo.account] = item.objectInfo
      }
    })
    return data
  } else if (changeMemberModel.value === 'delMember') {
    return showMembers.value
  } else {
    return {}
  }
})

const selectDialogDisabledOptions = computed(() => {
  if (changeMemberModel.value === 'addMember') {
    return Object.keys(showMembers.value)
  } else if (changeMemberModel.value === 'delMember') {
    const data = []
    Object.values(showMembers.value).forEach((item) => {
      if (item.account === myAccount.value) data.push(item.account) // 删除时要排除自己
      if (item.role === 2) data.push(item.account) // 群主不能删
      if (item.role === 1 && !iAmOwner.value) data.push(item.account) //管理员只有群组能删
    })
    return data
  } else {
    return []
  }
})

const searchModel = computed(() => {
  return changeMemberModel.value === 'addMember' ? 'server' : 'default'
})

const onAddmember = () => {
  isShowSelectDialog.value = true
  groupCardData.setChangeMemberModel('addMember')
}

const delAddmember = () => {
  isShowSelectDialog.value = true
  groupCardData.setChangeMemberModel('delMember')
}

const selectDialogTitle = computed(() => {
  return changeMemberModel.value === 'addMember' ? '添加成员' : '移除成员'
})

const doAdd = (userArray) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  const members = userArray.map((item) => ({ account: item.account, nickName: item.nickName }))
  groupAddMembersService({
    groupId: groupCardData.groupId,
    members: members
  })
    .then((res) => {
      if (res.data.data) {
        groupData.setGroupMembers({
          groupId: groupCardData.groupId,
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
}

const doDelete = (userArray) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  const members = userArray.map((item) => ({ account: item.account, nickName: item.nickName }))
  groupDelMembersService({
    groupId: groupCardData.groupId,
    members: members
  })
    .then((res) => {
      if (res.data.data) {
        groupData.setGroupMembers({
          groupId: groupCardData.groupId,
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

const onConfirmSelect = (selected) => {
  isShowSelectDialog.value = false // 这里要先关闭，不然移除的时候会报错
  if (changeMemberModel.value === 'addMember') {
    doAdd(selected)
  } else if (changeMemberModel.value === 'delMember') {
    doDelete(selected)
  }
}

const showModel = computed(() => {
  return groupCardData.showModel
})

const changeMemberModel = computed(() => {
  return groupCardData.changeMemberModel
})

const onShowMembers = () => {
  groupCardData.setShowModel('members')
}

const onEditGroupAvatarAndName = () => {
  groupCardData.setShowModel('editAvatarAndName')
}

const onEditAnnouncement = () => {
  groupCardData.setShowModel('editAnnouncement')
}

const onReturnInfo = () => {
  groupCardData.setShowModel('info')
}

const onNewAvatar = ({ avatar, avatarThumb }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  groupUpdateInfoService({
    groupId: groupCardData.groupId,
    avatar: avatar,
    avatarThumb: avatarThumb
  })
    .then(() => {
      groupData.setGroupInfo({
        ...groupInfo.value,
        avatar: avatar,
        avatarThumb: avatarThumb
      })
    })
    .finally(() => {
      loadingInstance.close()
    })
}

const groupNameInputRef = ref()
const updateGroupName = () => {
  const trimValue = newGroupName.value.trim()
  if (!trimValue) {
    newGroupName.value = groupInfo.value.groupName
    groupNameInputRef.value.blur()
    return
  }

  const loadingInstance = ElLoading.service(el_loading_options)
  groupUpdateInfoService({
    groupId: groupCardData.groupId,
    groupName: trimValue
  })
    .then(() => {
      groupData.setGroupInfo({
        ...groupInfo.value,
        groupName: trimValue
      })
      ElMessage.success('修改成功')
    })
    .finally(() => {
      loadingInstance.close()
      groupNameInputRef.value.blur()
    })
}

const updateGroupMark = () => {
  const trimValue = newGroupMark.value.trim()
  if (!trimValue) {
    newGroupMark.value = sessionInfo.value.mark
    groupMarkInputRef.value.blur()
    return
  }

  const loadingInstance = ElLoading.service(el_loading_options)
  messageData
    .updateSession({
      sessionId: sessionInfo.value.sessionId,
      mark: trimValue
    })
    .finally(() => {
      loadingInstance.close()
      groupMarkInputRef.value.blur()
    })
}

const groupMarkInputRef = ref()

const updateAnnouncement = () => {
  const trimValue = newAnnouncement.value.trim()
  if (trimValue === groupInfo.value.announcement) {
    ElMessage.warning('内容没有变化')
    return
  }

  const loadingInstance = ElLoading.service(el_loading_options)
  groupUpdateInfoService({
    groupId: groupCardData.groupId,
    announcement: trimValue
  })
    .then(() => {
      groupData.setGroupInfo({
        ...groupInfo.value,
        announcement: trimValue
      })
      ElMessage.success('修改成功')
    })
    .finally(() => {
      loadingInstance.close()
      onReturnInfo()
    })
}

const isShowSpecifyManagerButton = (role) => {
  if (iAmOwner.value && role === 0) {
    return true
  } else {
    return false
  }
}

const isShowCancelManagerButton = (role) => {
  if (iAmOwner.value && role === 1) {
    return true
  } else {
    return false
  }
}

const isMuted = (mutedMode) => {
  if (mutedMode === 1 || (groupInfo.value.allMuted && mutedMode !== 2)) {
    return true
  } else {
    return false
  }
}

let setMuteTimer
const setMute = (account, mode) => {
  let mutedMode
  if (groupInfo.value.allMuted) {
    // 全员禁言模式下对某个成员取消禁言就是把mutedMode置为2(白名单), 设置禁言就是把mutedMode置为0(从白名单剔除)
    mutedMode = mode === 'cancle' ? 2 : 0
  } else {
    // 非全员禁言模式下对某个成员设置禁言就是把mutedMode置为1(黑名单), 取消禁言就是把mutedMode置为0(从黑名单剔除)
    mutedMode = mode === 'set' ? 1 : 0
  }

  clearTimeout(setMuteTimer)
  setMuteTimer = setTimeout(() => {
    const loadingInstance = ElLoading.service(el_loading_options)
    groupUpdateMuteService({
      groupId: groupCardData.groupId,
      account: account,
      mutedMode: mutedMode
    })
      .then((res) => {
        if (res.data.code === 0) {
          groupData.setOneOfGroupMembers({
            groupId: groupCardData.groupId,
            account: account,
            userInfo: {
              ...showMembers.value[account],
              mutedMode: mutedMode
            }
          })
          ElMessage.success('设置成功')
        }
      })
      .finally(() => {
        loadingInstance.close()
      })
  }, 300)
}

const onSpecifyManager = (userInfo) => {
  ElMessageBox.confirm(
    `是否要将${userInfo.nickName}(${userInfo.account})设置为管理员？`,
    '温馨提示',
    {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    }
  )
    .then(() => {
      const loadingInstance = ElLoading.service(el_loading_options)
      groupChangeRoleService({
        groupId: groupCardData.groupId,
        account: userInfo.account,
        role: 1
      })
        .then((res) => {
          if (res.data.code === 0) {
            groupData.setOneOfGroupMembers({
              groupId: groupCardData.groupId,
              account: userInfo.account,
              userInfo: {
                ...userInfo,
                role: 1
              }
            })
            ElMessage.success('设置成功')
          }
        })
        .finally(() => {
          loadingInstance.close()
        })
    })
    .catch(() => {
      // do nothing
    })
}

const onCancelManager = (userInfo) => {
  ElMessageBox.confirm(
    `是否要取消${userInfo.nickName}(${userInfo.account})的管理员权限？`,
    '温馨提示',
    {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    }
  )
    .then(() => {
      const loadingInstance = ElLoading.service(el_loading_options)
      groupChangeRoleService({
        groupId: groupCardData.groupId,
        account: userInfo.account,
        role: 0
      })
        .then((res) => {
          if (res.data.code === 0) {
            groupData.setOneOfGroupMembers({
              groupId: groupCardData.groupId,
              account: userInfo.account,
              userInfo: {
                ...userInfo,
                role: 0
              }
            })
            ElMessage.success('取消成功')
          }
        })
        .finally(() => {
          loadingInstance.close()
        })
    })
    .catch(() => {
      // do nothing
    })
}

const myGroupNickNameRef = ref()
const updateMyGroupNickName = () => {
  const trimValue = newMyNickNameInGroup.value.trim()
  if (!trimValue) {
    newMyNickNameInGroup.value = showMembers.value[myAccount.value].nickName
    myGroupNickNameRef.value.blur()
    return
  }

  const loadingInstance = ElLoading.service(el_loading_options)
  groupUpdateNickNameInGroupService({
    groupId: groupCardData.groupId,
    nickName: trimValue
  })
    .then((res) => {
      if (res.data.code === 0) {
        groupData.setOneOfGroupMembers({
          groupId: groupCardData.groupId,
          account: myAccount.value,
          userInfo: {
            ...showMembers.value[myAccount.value],
            nickName: trimValue
          }
        })
        ElMessage.success('修改成功')
      }
    })
    .finally(() => {
      loadingInstance.close()
      myGroupNickNameRef.value.blur()
    })
}

let handleChatSwitchTimer
const handleChatSwitch = (obj) => {
  clearTimeout(handleChatSwitchTimer)
  handleChatSwitchTimer = setTimeout(() => {
    const loadingInstance = ElLoading.service(el_loading_options)
    messageData
      .updateSession({
        sessionId: sessionInfo.value.sessionId,
        ...obj
      })
      .finally(() => {
        loadingInstance.close()
      })
  }, 300)
}

let handleGroupSwitchTimer
const handleGroupSwitch = (obj) => {
  clearTimeout(handleGroupSwitchTimer)
  handleGroupSwitchTimer = setTimeout(() => {
    const loadingInstance = ElLoading.service(el_loading_options)
    groupUpdateInfoService({
      groupId: groupCardData.groupId,
      ...obj
    })
      .then(() => {
        groupData.setGroupInfo({
          ...groupInfo.value,
          ...obj
        })
      })
      .finally(() => {
        loadingInstance.close()
      })
  }, 300)
}

const levelGroup = () => {
  ElMessageBox.confirm(`是否要离开该群组？`, '温馨提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    .then(() => {
      const loadingInstance = ElLoading.service(el_loading_options)
      groupLeaveService({
        groupId: groupCardData.groupId
      })
        .then((res) => {
          if (res.data.code === 0) {
            groupData.deleteGroup(groupCardData.groupId)
            ElMessage.success('退出成功')
            groupCardData.setIsShow(false)
            groupCardData.setGroupId('')
            // TODO 这里要清空群组的聊天记录
          }
        })
        .finally(() => {
          loadingInstance.close()
        })
    })
    .catch(() => {
      // do nothing
    })
}

const dropGroup = () => {
  ElMessageBox.confirm(`是否要解散该群组？`, '温馨提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    .then(() => {
      const loadingInstance = ElLoading.service(el_loading_options)
      groupDropService({
        groupId: groupCardData.groupId
      })
        .then((res) => {
          if (res.data.code === 0) {
            groupData.deleteGroup(groupCardData.groupId)
            ElMessage.success('解散成功')
            groupCardData.setIsShow(false)
            groupCardData.setGroupId('')
            // TODO 这里要清空群组的聊天记录
          }
        })
        .finally(() => {
          loadingInstance.close()
        })
    })
    .catch(() => {
      // do nothing
    })
}

const onConfirmSingleSelect = (selected) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  groupOwnerTransferService({
    groupId: groupCardData.groupId,
    account: selected
  })
    .then((res) => {
      if (res.data.code === 0) {
        groupData.setOneOfGroupMembers({
          groupId: groupCardData.groupId,
          account: myAccount.value,
          userInfo: {
            ...showMembers.value[myAccount.value],
            role: 1
          }
        })
        groupData.setOneOfGroupMembers({
          groupId: groupCardData.groupId,
          account: selected,
          userInfo: {
            ...showMembers.value[selected],
            role: 2
          }
        })
        groupData.setGroupInfo({
          ...groupInfo.value,
          myRole: 1
        })

        ElMessage.success('转移成功')
      }
    })
    .finally(() => {
      isShowSingleSelectDialog.value = false
      loadingInstance.close()
    })
}
</script>

<template>
  <el-drawer
    class="group-card"
    :modelValue="groupCardData.isShow"
    :direction="'rtl'"
    :size="385"
    :z-index="1"
    modal-class="group-card-modal"
    :show-close="false"
    @close="groupCardData.setIsShow(false)"
  >
    <template #header>
      <div style="height: 24px; display: flex">
        <el-icon
          v-if="showModel !== 'info'"
          size="24"
          title="返回"
          style="cursor: pointer"
          @click="onReturnInfo"
        >
          <ArrowLeft />
        </el-icon>
        <span v-if="showModel === 'info'" class="group-card-title"> 群信息 </span>
        <span v-if="showModel === 'editAvatarAndName'" class="group-card-title"> 修改信息 </span>
        <span v-if="showModel === 'members'" class="group-card-title">
          群组成员 {{ Object.values(showMembers)?.length }}名
        </span>
        <span v-if="showModel === 'editAnnouncement'" class="group-card-title"> 修改群公告 </span>
      </div>
    </template>

    <div v-if="showModel === 'info'" class="group-card-info">
      <div style="position: relative">
        <GroupItem
          :groupInfo="groupInfo"
          :disableClickAvatar="true"
          style="
            padding: 10px 12px 10px 12px;
            border-radius: 8px;
            background-color: #f5f5f5;
            display: flex;
          "
        ></GroupItem>
        <el-icon class="edit" size="20" title="修改信息" @click="onEditGroupAvatarAndName">
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
            <UserAvatarIcon
              :showName="item.nickName"
              :showId="item.account"
              :showAvatarThumb="item.avatarThumb"
              :userStatus="item.status"
              @click="onShowUserCard(item.account)"
            ></UserAvatarIcon>
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
      <div class="group-card-announcement">
        <span style="font-size: 14px">群公告</span>
        <el-text class="announcement my-scrollbar">
          {{ groupInfo.announcement || '暂无公告' }}
        </el-text>
        <el-icon
          v-if="iAmManager"
          class="edit"
          size="20"
          title="修改群公告"
          @click="onEditAnnouncement"
        >
          <Edit />
        </el-icon>
      </div>
      <div class="group-card-myGroupNickName">
        <span style="font-size: 14px; width: 160px">我在本群的昵称</span>
        <el-input
          ref="myGroupNickNameRef"
          v-model="newMyNickNameInGroup"
          placeholder="请输入备注"
          maxlength="10"
          show-word-limit
          @change="updateMyGroupNickName"
        />
      </div>
      <div class="group-card-chat-setting">
        <el-tabs v-model="settingOption">
          <el-tab-pane label="聊天设置" name="chatSetting">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 14px">设为置顶</span>
              <el-switch v-model="isTop" @change="handleChatSwitch({ top: isTop })" />
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 14px">设置免打扰</span>
              <el-switch v-model="isDnd" @change="handleChatSwitch({ dnd: isDnd })" />
            </div>
            <div
              style="
                height: 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span style="font-size: 14px; color: red">清空聊天记录</span>
              <el-button :icon="ArrowRight" size="small" circle />
            </div>
            <div
              v-if="!iAmOwner"
              style="
                height: 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span style="font-size: 14px; color: red; cursor: pointer" @click="levelGroup">
                退出群组
              </span>
              <el-button :icon="ArrowRight" size="small" circle @click="levelGroup" />
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="iAmManager" label="群组设置" name="groupSetting">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 14px">入群验证</span>
              <el-switch
                v-model="isJoinGroupApproval"
                @change="handleGroupSwitch({ joinGroupApproval: isJoinGroupApproval })"
              />
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 14px">全员禁言</span>
              <el-switch
                v-model="isAllMuted"
                @change="handleGroupSwitch({ allMuted: isAllMuted })"
              />
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 14px">新成员查看历史记录</span>
              <el-switch
                v-model="isHistoryBrowse"
                @change="handleGroupSwitch({ historyBrowse: isHistoryBrowse })"
              />
            </div>
            <div
              v-if="iAmOwner"
              style="
                height: 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span
                style="font-size: 14px; cursor: pointer"
                @click="isShowSingleSelectDialog = true"
                >转移群主</span
              >
              <el-button
                :icon="ArrowRight"
                size="small"
                circle
                @click="isShowSingleSelectDialog = true"
              />
            </div>
            <div
              v-if="iAmOwner"
              style="
                height: 32px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span style="font-size: 14px; color: red; cursor: pointer" @click="dropGroup">
                解散群组
              </span>
              <el-button :icon="ArrowRight" size="small" circle @click="dropGroup" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="group-card-send-msg">
        <el-button
          type="primary"
          size="large"
          round
          style="width: 200px; font-size: 16px"
          @click="goToSessionTab"
        >
          发送消息
        </el-button>
      </div>
    </div>
    <div v-if="showModel === 'editAvatarAndName'" class="group-card-editAvatarAndName">
      <div v-if="iAmManager" class="group-card-avatar-wrapper">
        <div @click="isShowEditAvatar = true">
          <GroupAvatarIcon
            class="group-card-avatar"
            :avatarThumb="groupInfo.avatarThumb"
            :size="'huge'"
          ></GroupAvatarIcon>
        </div>
        <el-button
          class="group-card-avatar-edit-btn"
          type="primary"
          plain
          @click="isShowEditAvatar = true"
        >
          更换头像
        </el-button>
      </div>

      <div
        style="
          width: 90%;
          margin-top: 30px;
          padding: 10px;
          border-radius: 8px;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
        "
      >
        <div v-if="iAmManager" style="display: flex">
          <span style="width: 80px; font-size: 14px; display: flex; align-items: center">
            群组名称
          </span>
          <el-input
            ref="groupNameInputRef"
            v-model="newGroupName"
            placeholder="请输入名称"
            maxlength="50"
            show-word-limit
            @change="updateGroupName"
          />
        </div>
        <div style="display: flex; margin-top: 10px">
          <span style="width: 80px; font-size: 14px; display: flex; align-items: center">
            群组备注
          </span>
          <el-input
            ref="groupMarkInputRef"
            v-model="newGroupMark"
            placeholder="请输入备注"
            maxlength="10"
            show-word-limit
            @change="updateGroupMark"
          />
        </div>
      </div>
    </div>
    <div v-if="showModel === 'editAnnouncement'" class="group-card-editAnnouncement">
      <el-input
        v-model="newAnnouncement"
        placeholder="请输入群公告"
        maxlength="1000"
        show-word-limit
        type="textarea"
        :rows="10"
      />
      <div style="margin-top: 20px; display: flex; justify-content: end">
        <el-button type="info" @click="onReturnInfo" plain>取消</el-button>
        <el-button type="primary" @click="updateAnnouncement" plain>确认</el-button>
      </div>
    </div>
    <div v-if="showModel === 'members'" class="show-all-members">
      <el-input
        v-model.trim="memberSearchKey"
        placeholder="搜索: 群组成员昵称/账号"
        :prefix-icon="Search"
        :clearable="true"
      />
      <el-table :data="showMembersArrSorted" :show-header="false">
        <el-table-column>
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <UserAvatarIcon
                :showName="scope.row.nickName"
                :showId="scope.row.account"
                :showAvatarThumb="scope.row.avatarThumb"
                :userStatus="scope.row.status"
                :size="'small'"
                @click="onShowUserCard(scope.row.account)"
              ></UserAvatarIcon>
              <div
                style="
                  margin-left: 5px;
                  display: flex;
                  flex-direction: column;
                  flex: 1;
                  width: 0;
                  user-select: text;
                "
              >
                <span
                  class="text-ellipsis"
                  :title="scope.row.nickName"
                  style="height: 20px; font-size: 14px"
                >
                  {{ scope.row.nickName }}
                </span>
                <span
                  class="text-ellipsis"
                  :title="scope.row.account"
                  style="height: 20px; font-size: 12px"
                >
                  {{ scope.row.account }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="64">
          <template #default="scope">
            <div
              v-if="scope.row.role === 2"
              style="
                font-size: 12px;
                background-color: rgb(250, 181.5, 181.5);
                text-align: center;
                border-radius: 4px;
              "
            >
              群主
            </div>
            <div
              v-else-if="scope.row.role === 1"
              style="
                font-size: 12px;
                background-color: rgb(179, 224.5, 156.5);
                text-align: center;
                border-radius: 4px;
              "
            >
              管理员
            </div>
            <div
              v-else
              style="
                font-size: 12px;
                background-color: #dcdfe6;
                text-align: center;
                border-radius: 4px;
              "
            >
              成员
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="iAmManager" width="80">
          <template #default="scope">
            <div style="display: flex">
              <el-button
                v-if="isMuted(scope.row.mutedMode)"
                class="cancle-mute-btn"
                type="info"
                :icon="Mute"
                size="small"
                circle
                title="取消禁言"
                @click="setMute(scope.row.account, 'cancle')"
              />
              <el-button
                v-else
                class="set-mute-btn"
                :icon="Mute"
                size="small"
                circle
                title="设置禁言"
                @click="setMute(scope.row.account, 'set')"
              />
              <el-button
                v-if="isShowSpecifyManagerButton(scope.row.role)"
                type="primary"
                :icon="Avatar"
                size="small"
                circle
                title="设置为管理员"
                style="margin-left: 2px"
                @click="onSpecifyManager(scope.row)"
              />
              <el-button
                v-if="isShowCancelManagerButton(scope.row.role)"
                type="info"
                :icon="Avatar"
                size="small"
                circle
                title="取消管理员"
                style="margin-left: 2px"
                @click="onCancelManager(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
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
  <SingleSelectDialog
    v-model="isShowSingleSelectDialog"
    :options="showMembersArrSorted"
    :disabledOptionIds="new Array(myAccount)"
    @showUserCard="onShowUserCard"
    @confirm="onConfirmSingleSelect"
  >
    <template #title>
      <div style="font-size: 16px; font-weight: bold; white-space: nowrap">转移群主</div>
    </template>
  </SingleSelectDialog>
  <EditAvatar
    v-model="isShowEditAvatar"
    :model="'group'"
    :groupInfo="groupInfo"
    @update:newAvatar="onNewAvatar"
  ></EditAvatar>
</template>

<style lang="scss">
.group-card-modal {
  background-color: transparent;
  overflow: hidden;

  .group-card {
    min-height: 768px;

    .edit {
      padding: 4px;
      position: absolute;
      right: 5px;
      bottom: 5px;
      background-color: transparent;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background-color: #dedfe0;
      }
    }
  }

  .el-drawer__header {
    margin: 0;
    font-weight: bold;
  }

  .el-drawer__body {
    display: flex;

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background-color: unset;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: unset;
    }

    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: #409eff;
      }
    }

    .show-all-members {
      width: 100%;
      display: flex;
      flex-direction: column;

      .el-input {
        .el-input__wrapper {
          border-radius: 25px;
        }
      }

      .el-table {
        width: 100%;
        margin-top: 10px;
      }

      .el-table__cell {
        padding: 2px 0 2px 0;
      }

      .el-table__row {
        :hover {
          --mute-button-color: rgb(255, 255, 255);
          --mute-button-bgc: rgb(144, 147, 153);
          --mute-button-border: unset;
        }
      }

      .cancle-mute-btn {
        color: var(--mute-button-color);
        background-color: var(--mute-button-bgc);
      }

      .set-mute-btn {
        color: var(--mute-button-color, transparent);
        background-color: var(--mute-button-bgc, transparent);
        border: var(--mute-button-border, unset);
      }
    }
  }
}

.group-card-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.group-card-info {
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

  .group-card-announcement {
    height: 200px;
    padding: 5px 10px 0 10px;
    margin-top: 20px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    position: relative;

    .announcement {
      width: 95%;
      height: 140px;
      padding: 10px;
      margin-top: 10px;
      border-radius: 8px;
      background-color: #fff;
      display: flex;
      user-select: text;
      overflow-y: scroll;
      white-space: pre-wrap; //给文本中的\n换行
      word-wrap: break-word; //允许长单词换行
      word-break: break-all; //在任意字符处断行
    }
  }

  .group-card-myGroupNickName {
    padding: 10px;
    margin-top: 20px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
  }

  .group-card-chat-setting {
    padding: 10px;
    margin-top: 20px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
  }

  .group-card-send-msg {
    padding: 20px 0 20px 0;
    display: flex;
    justify-content: center;
  }
}

.group-card-editAvatarAndName {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .group-card-avatar-wrapper {
    display: flex;
    flex-direction: column;

    .group-card-avatar {
      border: #e9e9eb solid 2px;
      background-color: #f5f5f5;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover {
        border: #409eff solid 2px;
      }
    }

    .group-card-avatar-edit-btn {
      margin-top: 5px;
    }
  }
}

.group-card-editAnnouncement {
  width: 100%;

  .el-textarea__inner {
    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background-color: unset;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: #409eff;
    }
  }
}
</style>
