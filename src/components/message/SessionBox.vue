<script setup>
import { ref, computed, watch } from 'vue'
import AvatarIcon from '../common/AvatarIcon.vue'
import SessionTag from './SessionTag.vue'
import { sessionShowTime } from '@/utils/common'
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
  'switchTag',
  'showUserCard',
  'showGroupCard',
  'customContextmenu',
  'updateMenu',
  'noneSelected'
])
const messageData = messageStore()
const sessionInfo = computed(() => {
  return messageData.sessionList[props.sessionId]
})

const top = ref(sessionInfo.value.top)
const muted = ref(sessionInfo.value.muted)

// 这里不能用ref，因为这个结构不能响应top和muted变化
const menu = computed(() => {
  return [
    {
      label: 'top',
      value: top.value,
      desc: top.value ? '取消置顶' : '置顶'
    },
    {
      label: 'muted',
      value: muted.value,
      desc: muted.value ? '取消免打扰' : '设置免打扰'
    },
    {
      label: 'delete',
      value: '',
      desc: '删除会话'
    }
  ]
})

const hasBeenSelected = computed(() => {
  return props.sessionId === props.selectedSessionId
})

const hasBeenShowMenu = computed(() => {
  return props.sessionId === props.showMenuSessionId
})

const showName = computed(() => {
  switch (sessionInfo.value.sessionType) {
    case MsgType.CHAT:
      return sessionInfo.value.objectInfo.nickName
    case MsgType.GROUP_CHAT:
      return sessionInfo.value.objectInfo.groupName
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
    if (top.value === sessionInfo.value.top && muted.value === sessionInfo.value.muted) {
      return
    }

    emit('switchTag', {
      sessionId: props.sessionId,
      top: top.value,
      muted: muted.value
    })
  }, 100) // 这个时间太长会影响置顶按钮的响应时长
}

watch(
  () => props.selectedMenuItem,
  async () => {
    if (hasBeenShowMenu.value && props.selectedMenuItem) {
      switch (props.selectedMenuItem.label) {
        case 'top':
          top.value = !top.value
          switchTag(() => {})
          emit('updateMenu', menu.value) //更新之后要同步菜单变化
          break
        case 'muted':
          muted.value = !muted.value
          switchTag(() => {})
          emit('updateMenu', menu.value) //更新之后要同步菜单变化
          break
        case 'delete':
          await msgChatDeleteSessionService({ sessionId: props.sessionId })
          // 如果删除的session是这个选中的session，需要通知父组件处理
          if (hasBeenSelected.value) emit('noneSelected')
          messageData.deleteSession(props.sessionId)
          break
        default:
          break
      }
    }
  }
)

const onContextmenu = () => {
  emit('customContextmenu', { sessionId: props.sessionId, menu: menu.value })
}
</script>

<template>
  <div class="session-box-wrapper" @contextmenu.prevent="onContextmenu">
    <div
      class="session-box"
      :class="{ 'bgc-for-active': hasBeenSelected, 'bgc-for-top': top && !hasBeenSelected }"
    >
      <AvatarIcon
        class="avatar-session-box"
        :showName="showName"
        :showId="showId"
        :showAvatarThumb="showAvatarThumb"
        :userStatus="sessionInfo.objectInfo.status"
        @click="onShowCard"
      ></AvatarIcon>
      <div class="content-box" @click="emit('isSelected', props.sessionId)">
        <div class="header">
          <div class="title">
            <span class="showName">{{ showName || showId }}</span>
            <span v-if="sessionInfo.objectInfo.account" class="showAccount">
              {{ sessionInfo.objectInfo.account }}
            </span>
            <SessionTag :tagType="sessionInfo.sessionType"></SessionTag>
            <SessionTag v-if="top" tagType="top"></SessionTag>
            <SessionTag v-if="muted" tagType="mute"></SessionTag>
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
            <span class="detail">{{
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
              :icon="muted ? Bell : MuteNotification"
              @click.stop="
                switchTag(() => {
                  muted = !muted
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

.session-box {
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
          white-space: nowrap; /*不换行*/
          overflow: hidden; /*超出的文本隐藏*/
          text-overflow: ellipsis; /* 溢出用省略号*/
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
          white-space: nowrap; /*不换行*/
          overflow: hidden; /*超出的文本隐藏*/
          text-overflow: ellipsis; /* 溢出用省略号*/
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
