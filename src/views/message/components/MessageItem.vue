<script setup>
import { computed } from 'vue'
import { MsgType } from '@/proto/msg'
import { userStore, messageStore, groupStore, groupCardStore } from '@/stores'
import { messageSysShowTime, messageBoxShowTime, jsonParseSafe } from '@/js/utils/common'
import UserAvatarIcon from '@/components/common/UserAvatarIcon.vue'

const props = defineProps([
  'sessionId',
  'msg',
  'obj',
  'readMsgId',
  'remoteRead',
  'firstMsgId',
  'hasNoMoreMsg',
  'isLoadMoreLoading'
])
const emit = defineEmits(['loadMore', 'showUserCard', 'showGroupCard'])

const userData = userStore()
const messageData = messageStore()
const groupData = groupStore()
const groupCardData = groupCardStore()

const isSystemMsg = computed(() => {
  if (
    props.msg.msgType === MsgType.SYS_GROUP_CREATE ||
    props.msg.msgType === MsgType.SYS_GROUP_ADD_MEMBER ||
    props.msg.msgType === MsgType.SYS_GROUP_DEL_MEMBER ||
    props.msg.msgType === MsgType.SYS_GROUP_SET_ADMIN ||
    props.msg.msgType === MsgType.SYS_GROUP_CANCEL_ADMIN ||
    props.msg.msgType === MsgType.SYS_GROUP_SET_ALL_MUTED ||
    props.msg.msgType === MsgType.SYS_GROUP_CANCEL_ALL_MUTED ||
    props.msg.msgType === MsgType.SYS_GROUP_SET_JOIN_APPROVAL ||
    props.msg.msgType === MsgType.SYS_GROUP_CANCEL_JOIN_APPROVAL ||
    props.msg.msgType === MsgType.SYS_GROUP_SET_HISTORY_BROWSE ||
    props.msg.msgType === MsgType.SYS_GROUP_CANCEL_HISTORY_BROWSE ||
    props.msg.msgType === MsgType.SYS_GROUP_OWNER_TRANSFER ||
    props.msg.msgType === MsgType.SYS_GROUP_UPDATE_MEMBER_MUTED ||
    props.msg.msgType === MsgType.SYS_GROUP_LEAVE ||
    props.msg.msgType === MsgType.SYS_GROUP_DROP ||
    props.msg.msgType === MsgType.SYS_GROUP_UPDATE_ANNOUNCEMENT ||
    props.msg.msgType === MsgType.SYS_GROUP_UPDATE_NAME ||
    props.msg.msgType === MsgType.SYS_GROUP_UPDATE_AVATAR
  ) {
    return true
  } else {
    return false
  }
})

const getSysCreateGroupMsgTips = (content) => {
  const operator = content['operator']
  const members = content['members']
  let membersExcludeCreator = members.filter((item) => item.account !== operator.account)
  let str = ''
  membersExcludeCreator.forEach((item) => {
    str =
      str +
      `<span class="member-nickName" id="${item.account}" style="color: #409eff; cursor: pointer;">${item.nickName}</span>，`
  })

  return (
    `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>` +
    '创建了群聊，并邀请了' +
    str.slice(0, -1) +
    `。<span class="update-group-name" style="color: #409eff; cursor: pointer;">修改群聊名称</span>`
  )
}

const getSysGroupAddMemberMsgTips = (content) => {
  const operator = content['operator']
  const members = content['members']
  let str = ''
  members.forEach((item) => {
    str =
      str +
      `<span class="member-nickName" id="${item.account}" style="color: #409eff; cursor: pointer;">${item.nickName}</span>，`
  })

  return (
    `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>` +
    '邀请' +
    str.slice(0, -1) +
    '加入了群聊'
  )
}

const getSysGroupDelMemberMsgTips = (content) => {
  const operator = content['operator']
  const members = content['members']
  let str = ''
  members.forEach((item) => {
    str =
      str +
      `<span class="member-nickName" id="${item.account}" style="color: #409eff; cursor: pointer;">${item.nickName}</span>，`
  })
  return (
    `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>` +
    '移除了' +
    str.slice(0, -1)
  )
}

const getSysGroupChangeRoleMsgTips = (msgType, content) => {
  const operator = content['operator']
  const member = content['member']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  const memberStr = `<span class="member-nickName" id="${member.account}" style="color: #409eff; cursor: pointer;">${member.nickName}</span>`
  return msgType === MsgType.SYS_GROUP_SET_ADMIN
    ? `${operatorStr}设置了${memberStr}为管理员`
    : `${operatorStr}取消了${memberStr}的管理员权限`
}

const getSysGroupUpdateAllMuted = (msgType, content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  return msgType === MsgType.SYS_GROUP_SET_ALL_MUTED
    ? `${operatorStr}设置了全员禁言`
    : `${operatorStr}取消了全员禁言`
}

const getSysGroupUpdateJoinApproval = (msgType, content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  return msgType === MsgType.SYS_GROUP_SET_JOIN_APPROVAL
    ? `${operatorStr}开启了入群验证`
    : `${operatorStr}关闭了入群验证`
}

const getSysGroupUpdateHistoryBrowse = (msgType, content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  return msgType === MsgType.SYS_GROUP_SET_HISTORY_BROWSE
    ? `${operatorStr}开启了新成员浏览历史记录`
    : `${operatorStr}关闭了新成员浏览历史记录`
}

const getSysGroupOwnerTransfer = (content) => {
  const operator = content['operator']
  const member = content['member']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  const memberStr = `<span class="member-nickName" id="${member.account}" style="color: #409eff; cursor: pointer;">${member.nickName}</span>`
  return `${operatorStr}将群主转让给了${memberStr}`
}

const getSysGroupUpdateMemberMuted = (content) => {
  const operator = content['operator']
  const member = content['member']
  const mutedMode = content['mutedMode']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  const memberStr = `<span class="member-nickName" id="${member.account}" style="color: #409eff; cursor: pointer;">${member.nickName}</span>`
  const groupId = messageData.sessionList[props.sessionId].remoteId
  const allMuted = groupData.groupInfoList[groupId].allMuted
  if (allMuted) {
    if (mutedMode === 2) {
      return `${operatorStr}允许了${memberStr}的发言`
    } else {
      return `${operatorStr}禁止了${memberStr}的发言`
    }
  } else {
    if (mutedMode === 1) {
      return `${operatorStr}禁止了${memberStr}的发言`
    } else {
      return `${operatorStr}允许了${memberStr}的发言`
    }
  }
}

const getSysGroupLeave = (content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  return `${operatorStr}离开了群组`
}

const getSysGroupDrop = (content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  return `${operatorStr}解散了群组`
}

const getSysGroupUpdateAnnouncement = (content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  const announcementStr = `<span class="show-group-announcement" style="color: #409eff; cursor: pointer;">群公告</span>`
  return `${operatorStr}更改了${announcementStr}`
}

const getSysGroupUpdateName = (content) => {
  const operator = content['operator']
  const groupName = content['groupName']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  const groupNameStr = `<span class="show-group-announcement" style="color: #409eff; cursor: pointer;">${groupName}</span>`
  return `${operatorStr}更改了群名称：${groupNameStr}`
}

const getSysGroupUpdateAvatar = (content) => {
  const operator = content['operator']
  const operatorStr = `<span class="member-nickName" id="${operator.account}" style="color: #409eff; cursor: pointer;">${operator.nickName}</span>`
  const avatarStr = `<span class="show-group-announcement" style="color: #409eff; cursor: pointer;">群头像</span>`
  return `${operatorStr}更改了${avatarStr}`
}

const systemMsgContent = computed(() => {
  const content = jsonParseSafe(props.msg.content)
  switch (props.msg.msgType) {
    case MsgType.SYS_GROUP_CREATE:
      return getSysCreateGroupMsgTips(content)
    case MsgType.SYS_GROUP_ADD_MEMBER:
      return getSysGroupAddMemberMsgTips(content)
    case MsgType.SYS_GROUP_DEL_MEMBER:
      return getSysGroupDelMemberMsgTips(content)
    case MsgType.SYS_GROUP_UPDATE_ANNOUNCEMENT:
      return getSysGroupUpdateAnnouncement(content)
    case MsgType.SYS_GROUP_UPDATE_NAME:
      return getSysGroupUpdateName(content)
    case MsgType.SYS_GROUP_UPDATE_AVATAR:
      return getSysGroupUpdateAvatar(content)
    case MsgType.SYS_GROUP_SET_ADMIN:
    case MsgType.SYS_GROUP_CANCEL_ADMIN:
      return getSysGroupChangeRoleMsgTips(props.msg.msgType, content)
    case MsgType.SYS_GROUP_SET_ALL_MUTED:
    case MsgType.SYS_GROUP_CANCEL_ALL_MUTED:
      return getSysGroupUpdateAllMuted(props.msg.msgType, content)
    case MsgType.SYS_GROUP_SET_JOIN_APPROVAL:
    case MsgType.SYS_GROUP_CANCEL_JOIN_APPROVAL:
      return getSysGroupUpdateJoinApproval(props.msg.msgType, content)
    case MsgType.SYS_GROUP_SET_HISTORY_BROWSE:
    case MsgType.SYS_GROUP_CANCEL_HISTORY_BROWSE:
      return getSysGroupUpdateHistoryBrowse(props.msg.msgType, content)
    case MsgType.SYS_GROUP_OWNER_TRANSFER:
      return getSysGroupOwnerTransfer(content)
    case MsgType.SYS_GROUP_UPDATE_MEMBER_MUTED:
      return getSysGroupUpdateMemberMuted(content)
    case MsgType.SYS_GROUP_LEAVE:
      return getSysGroupLeave(content)
    case MsgType.SYS_GROUP_DROP:
      return getSysGroupDrop(content)
    default:
      return ''
  }
})

const isChatMsgType = computed(() => {
  return props.msg.msgType === MsgType.CHAT
})

const isGroupChatMsgType = computed(() => {
  return props.msg.msgType === MsgType.GROUP_CHAT
})

const loadMoreTips = computed(() => {
  return props.isLoadMoreLoading ? '' : '查看更多消息'
})

const isUnreadMsg = computed(() => {
  if (!isSystemMsg.value && props.readMsgId < props.msg.msgId && !isSelf.value) {
    return true
  } else {
    return false
  }
})

const myMsgIsRead = computed(() => {
  return isSelf.value && props.msg.msgId <= props.remoteRead
})

const isShowLoadMore = computed(() => {
  if (props.msg.msgId === props.firstMsgId && !props.hasNoMoreMsg) {
    return true
  } else {
    return false
  }
})
const isShowNoMoreMsg = computed(() => {
  if (props.msg.msgId === props.firstMsgId && props.hasNoMoreMsg) {
    return true
  } else {
    return false
  }
})
const loadMoreCursor = computed(() => {
  return props.isLoadMoreLoading ? 'auto' : 'pointer'
})

const isSelf = computed(() => {
  return userData.user.account === props.msg.fromId
})

const account = computed(() => {
  return props.obj.account
})

const nickName = computed(() => {
  return props.obj.nickName
})

const avatarThumb = computed(() => {
  return props.obj.avatarThumb
})

const sysShowTime = computed(() => {
  return messageSysShowTime(new Date(props.msg.msgTime))
})

// 判断是否是连续的会话，与上个会话时间差小于5分钟
const isContinuousSession = computed(() => {
  if (!props.msg.preMsgTime) {
    return false
  }

  const diff = new Date(props.msg.msgTime).getTime() - new Date(props.msg.preMsgTime).getTime()
  if (diff < 5 * 60 * 1000) {
    return true
  } else {
    return false
  }
})

const msgTime = computed(() => {
  return messageBoxShowTime(props.msg.msgTime)
})

const onLoadMore = () => {
  emit('loadMore')
}

const onShowUserCard = () => {
  emit('showUserCard', { sessionId: props.sessionId, account: account.value })
}

const onClickSystemMsg = (e) => {
  if (e.target.className === 'update-group-name') {
    emit('showGroupCard', { groupId: messageData.sessionList[props.sessionId].remoteId })
    setTimeout(() => {
      // 这里要延迟打开，否则会与GroupCard的初始化ShowModel冲突
      groupCardData.setShowModel('editAvatarAndName')
    }, 100)
  } else if (e.target.className === 'member-nickName') {
    emit('showUserCard', { sessionId: props.sessionId, account: e.target.id })
  } else if (e.target.className === 'show-group-announcement') {
    emit('showGroupCard', { groupId: messageData.sessionList[props.sessionId].remoteId })
  }
}
</script>

<template>
  <div class="message-item" :class="{ unreadMsg: isUnreadMsg }">
    <span v-if="isShowNoMoreMsg" class="no-more-message">当前无更多消息</span>
    <div v-if="isShowLoadMore" class="load-more-wrapper">
      <div
        class="load-more"
        v-loading="props.isLoadMoreLoading"
        @click="onLoadMore"
        :style="{ cursor: loadMoreCursor }"
      >
        {{ loadMoreTips }}
      </div>
    </div>
    <el-divider v-if="props.msg.isFirstNew" class="new-messages-tips" content-position="center"
      >以下是新消息</el-divider
    >
    <span v-if="!isContinuousSession" class="datetime">{{ sysShowTime }}</span>
    <span
      v-if="isSystemMsg"
      class="system-message"
      v-html="systemMsgContent"
      @click="onClickSystemMsg"
    ></span>
    <div v-else class="message-container-wrapper">
      <el-container class="el-container-right" v-if="isSelf">
        <el-main class="el-main-right">
          <el-container class="message-content-wrapper">
            <el-header class="message-time">
              <span v-if="isGroupChatMsgType">{{ nickName }}</span>
              <span style="margin-left: 5px">{{ msgTime }}</span>
            </el-header>
            <el-main class="message-content">
              <div
                v-if="isChatMsgType"
                :class="{ remote_read: myMsgIsRead, remote_unread: !myMsgIsRead }"
              ></div>
              <div class="div-content">{{ props.msg.content }}</div>
            </el-main>
          </el-container>
        </el-main>
        <el-aside class="el-aside-right">
          <UserAvatarIcon
            class="avatar-message-item"
            :showId="account"
            :showName="nickName"
            :showAvatarThumb="avatarThumb"
            @click="onShowUserCard"
          ></UserAvatarIcon>
        </el-aside>
      </el-container>

      <el-container class="el-container-left" v-else>
        <el-aside class="el-aside-left">
          <UserAvatarIcon
            class="avatar-message-item"
            :showId="account"
            :showName="nickName"
            :showAvatarThumb="avatarThumb"
            @click="onShowUserCard"
          ></UserAvatarIcon>
        </el-aside>
        <el-main class="el-main-left">
          <el-container class="message-content-wrapper">
            <el-header class="message-time">
              <span v-if="isGroupChatMsgType" style="margin-right: 5px">{{ nickName }}</span>
              <span>{{ msgTime }}</span>
            </el-header>
            <el-main class="message-content">
              <div class="div-content">{{ props.msg.content }}</div>
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .no-more-message {
    width: 100%;
    height: 30px;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: gray;
    user-select: text;
  }

  .load-more-wrapper {
    width: 100%;
    height: 30px;
    padding: 10px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .load-more {
      color: #409eff;
      font-size: 14px;
    }

    :deep(.circular) {
      width: 24px;
      height: 24px;
      position: absolute;
      top: 12px;
      left: -12px;
    }
  }

  .new-messages-tips {
    width: 40%;
    :deep(.el-divider__text) {
      background-color: #f5f5f5;
      font-size: 14px;
      font-weight: normal;
      color: gray;
      white-space: nowrap;
    }
  }

  .datetime {
    border-radius: 2px;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 12px;
    background-color: #c8c9cc;
    color: white;
    user-select: text;
  }

  .system-message {
    width: 60%;
    padding: 10px;
    text-align: center;
    font-size: 14px;
    color: gray;
    user-select: text;
  }

  .message-container-wrapper {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;

    .el-container-right {
      width: 100%;
      display: flex;

      .el-aside-right {
        width: auto;
        margin-top: 5px;
        display: flex;
      }
      .el-main-right {
        padding: 0;
        display: flex;

        .message-content-wrapper {
          margin-right: 10px;

          .message-time {
            height: auto;
            padding: 0;
            font-size: 12px;
            color: gray;
            user-select: text;
            text-align: end;
          }

          .message-content {
            margin-top: 5px;
            padding: 0;
            display: flex;
            justify-content: right;

            .div-content {
              max-width: 500px;
              padding: 8px;
              font-size: 14px;
              background-color: #c6e2ff;
              border-radius: 10px;
              border-top-right-radius: 0;
              user-select: text;
            }

            .remote_read {
              margin-right: 5px;
              display: flex;
              align-items: end;

              &::before {
                content: '●';
                font-size: 10px;
                color: #95d475;
              }
            }

            .remote_unread {
              margin-right: 5px;
              display: flex;
              align-items: end;

              &::before {
                content: '●';
                font-size: 10px;
                color: #eebe77;
              }
            }
          }
        }
      }
    }

    .el-container-left {
      width: 100%;
      display: flex;

      .el-aside-left {
        width: auto;
        margin-top: 5px;
        display: flex;
      }
      .el-main-left {
        padding: 0;
        display: flex;

        .message-content-wrapper {
          margin-left: 10px;

          .message-time {
            height: auto;
            padding: 0;
            font-size: 12px;
            color: gray;
            user-select: text;
          }

          .message-content {
            margin-top: 5px;
            padding: 0;
            display: flex;
            justify-content: left;

            .div-content {
              max-width: 500px;
              padding: 8px;
              font-size: 14px;
              background-color: #dedfe0;
              border-radius: 10px;
              border-top-left-radius: 0;
              user-select: text;
            }
          }
        }
      }
    }
  }
}

.el-container {
  width: 100%;
  display: flex;
}
</style>
