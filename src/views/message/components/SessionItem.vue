<script setup>
import { ref, computed } from 'vue'
import UserAvatarIcon from '@/components/common/UserAvatarIcon.vue'
import GroupAvatarIcon from '@/components/common/GroupAvatarIcon.vue'
import SessionTag from './SessionTag.vue'
import { sessionShowTime } from '@/js/utils/common'
import { Top, Bottom, MuteNotification, Bell } from '@element-plus/icons-vue'
import { MsgType } from '@/proto/msg'
import { messageStore } from '@/stores'
import { msgChatDeleteSessionService } from '@/api/message'

const props = defineProps([
  'sessionId',
  'selectedSessionId',
  'showMenuSessionId',
  'selectedMenuItem'
])
const emit = defineEmits([
  'isSelected',
  'showUserCard',
  'showGroupCard',
  'openSessionMenu',
  'noneSelected',
  'showUpdateMarkDialog'
])
const messageData = messageStore()
const sessionInfo = computed(() => {
  return messageData.sessionList[props.sessionId]
})

const top = ref(sessionInfo.value.top)
const dnd = ref(sessionInfo.value.dnd)

const hasBeenSelected = computed(() => {
  return props.sessionId === props.selectedSessionId
})

const hasBeenShowMenu = computed(() => {
  return props.sessionId === props.showMenuSessionId
})

const showName = computed(() => {
  switch (sessionInfo.value.sessionType) {
    case MsgType.CHAT:
      return sessionInfo.value.objectInfo.nickName || '没有昵称'
    case MsgType.GROUP_CHAT:
      return sessionInfo.value.objectInfo.groupName || '没有群名称'
    default:
      return ''
  }
})

const showId = computed(() => {
  switch (sessionInfo.value.sessionType) {
    case MsgType.CHAT:
      return sessionInfo.value.objectInfo.account
    case MsgType.GROUP_CHAT:
      return sessionInfo.value.objectInfo.groupId
    default:
      return ''
  }
})

const showAvatarThumb = computed(() => {
  switch (sessionInfo.value.sessionType) {
    case MsgType.CHAT:
    case MsgType.GROUP_CHAT:
      return sessionInfo.value.objectInfo.avatarThumb
    default:
      return ''
  }
})

const showTime = computed(() => {
  return sessionShowTime(sessionInfo.value.lastMsgTime)
})

const isShowDraft = computed(() => {
  return !hasBeenSelected.value && sessionInfo.value.draft
})

const isShowUnreadCount = computed(() => {
  return sessionInfo.value.unreadCount > 0
})

const onShowCard = () => {
  switch (sessionInfo.value.sessionType) {
    case MsgType.CHAT:
      emit('showUserCard', { sessionId: props.sessionId, account: showId.value })
      break
    case MsgType.GROUP_CHAT:
      emit('showGroupCard', { sessionId: props.sessionId, groupId: showId.value })
      break
    default:
      break
  }
}

// 这里有防抖动效果
let timer
const switchTag = (func) => {
  func()
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (top.value === sessionInfo.value.top && dnd.value === sessionInfo.value.dnd) {
      return
    }

    //自己可以自己就处理了，不用交给父组件
    messageData.updateSession({
      sessionId: props.sessionId,
      top: top.value,
      dnd: dnd.value
    })
  }, 100) // 这个时间太长会影响置顶按钮的响应时长
}

const handleSelectedMenuItem = async () => {
  if (hasBeenShowMenu.value && props.selectedMenuItem) {
    switch (props.selectedMenuItem.label) {
      case 'top':
        switchTag(() => {
          top.value = !top.value
        })
        break
      case 'dnd':
        switchTag(() => {
          dnd.value = !dnd.value
        })
        break
      case 'delete':
        await msgChatDeleteSessionService({ sessionId: props.sessionId })
        if (hasBeenSelected.value) emit('noneSelected') // 如果删除的session是这个选中的session，需要通知父组件处理
        messageData.deleteSession(props.sessionId)
        break
      case 'mark':
        emit('showUpdateMarkDialog') //返回父组件处理：弹窗 + 保存修改
        break
      default:
        break
    }
  }
}

const openSessionMenu = () => {
  emit('openSessionMenu', props.sessionId)
}

defineExpose({
  handleSelectedMenuItem
})
</script>

<template>
  <div class="session-item-wrapper" @contextmenu.prevent="openSessionMenu">
    <div
      class="session-item"
      :class="{ 'bgc-for-active': hasBeenSelected, 'bgc-for-top': top && !hasBeenSelected }"
    >
      <UserAvatarIcon
        v-if="sessionInfo.sessionType === MsgType.CHAT"
        class="avatar-session-item"
        :showName="showName"
        :showId="showId"
        :showAvatarThumb="showAvatarThumb"
        :userStatus="sessionInfo.objectInfo.status"
        @click="onShowCard"
      ></UserAvatarIcon>
      <GroupAvatarIcon
        v-else-if="sessionInfo.sessionType === MsgType.GROUP_CHAT"
        :avatarThumb="showAvatarThumb"
        style="cursor: pointer"
      ></GroupAvatarIcon>
      <div class="content-box" @click="emit('isSelected', props.sessionId)">
        <div class="header">
          <div class="title">
            <span
              class="showName text-ellipsis"
              :title="sessionInfo.mark ? `${sessionInfo.mark}(${showName})` : showName"
            >
              {{ sessionInfo.mark ? `${sessionInfo.mark}(${showName})` : showName }}
            </span>
            <span
              v-if="sessionInfo.objectInfo.account"
              class="showAccount"
              :title="sessionInfo.objectInfo.account"
            >
              {{ sessionInfo.objectInfo.account }}
            </span>
            <SessionTag :tagType="sessionInfo.sessionType"></SessionTag>
            <SessionTag v-if="top" tagType="top"></SessionTag>
            <SessionTag v-if="dnd" tagType="dnd"></SessionTag>
          </div>
          <div class="datetime">
            <span>{{ showTime }}</span>
          </div>
        </div>
        <div class="body">
          <div class="content">
            <span v-if="isShowUnreadCount" class="unread-count"
              >[{{ sessionInfo.unreadCount }}条]</span
            >
            <span v-if="isShowDraft" class="draft">[草稿]</span>
            <span class="detail text-ellipsis">{{
              isShowDraft ? sessionInfo.draft : sessionInfo.lastMsgContent
            }}</span>
          </div>
          <div class="action">
            <el-button
              class="action-button"
              :icon="top ? Bottom : Top"
              @click.stop="
                switchTag(() => {
                  top = !top
                })
              "
              circle
            />
            <el-button
              class="action-button"
              :icon="dnd ? Bell : MuteNotification"
              @click.stop="
                switchTag(() => {
                  dnd = !dnd
                })
              "
              circle
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bgc-for-active {
  background-color: #c6e2ff;
}

.bgc-for-top {
  background-color: #ecf5ff;
}

.session-item {
  height: 60px;
  margin: 1px;
  margin-left: 5px;
  padding: 5px;
  border-radius: 6px;
  padding-right: 0;
  display: flex;
  align-items: center;
  user-select: none;
  position: relative;

  &:hover {
    background-color: #c6e2ff;
  }

  .content-box {
    width: 100%;
    height: 100%;
    margin-left: 10px;
    display: flex;
    justify-content: center;
    flex: 1 1;
    flex-direction: column;
    overflow: hidden;

    .header {
      width: 100%;
      height: 24px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;

      .title {
        line-height: 20px;
        display: flex;
        align-items: center;
        flex: 1 1;
        overflow: hidden;

        .showName {
          font-size: 14px;
          margin-right: 5px;
          flex-shrink: 0;
        }

        .showAccount {
          font-size: 12px;
          margin-right: 5px;
          color: gray;
          white-space: nowrap; /*不换行*/
        }
      }

      .datetime {
        width: 52px;
        font-size: 12px;
        margin-right: 10px;
        color: gray;
        display: flex;
        justify-content: flex-end;
      }
    }

    .body {
      height: 20px;
      display: flex;
      justify-content: space-between;

      .content {
        font-size: 12px;
        display: flex;
        flex: 1 1;
        overflow: hidden;

        .unread-count {
          color: red;
          flex-shrink: 0;
        }

        .draft {
          color: red;
          flex-shrink: 0;
        }

        .detail {
          color: gray;
        }
      }

      .action {
        margin-right: 10px;
        display: flex;

        .action-button {
          width: 20px;
          height: 20px;
          margin-left: 2px;
          opacity: 0;

          &:hover {
            opacity: 1;
            background-color: #409eff;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>
