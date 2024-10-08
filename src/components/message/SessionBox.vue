<script setup>
import { ref, computed } from 'vue'
import AvatarIcon from './AvatarIcon.vue'
import SessionTag from './SessionTag.vue'
import UserCard from '../user/UserCard.vue'
import GroupCard from '../group/GroupCard.vue'
import { sessionShowTime } from '@/utils/common'
import { Top, Bottom, MuteNotification, Bell } from '@element-plus/icons-vue'
import { MsgType } from '@/proto/msg'
import { messageStore } from '@/stores'

const props = defineProps(['sessionId', 'choosedSessionId'])
const emit = defineEmits(['isChoosed', 'switchTag'])
const messageData = messageStore()
const sessionInfo = computed(() => {
  return messageData.sessionList[props.sessionId]
})

const top = ref(sessionInfo.value.top)
const muted = ref(sessionInfo.value.muted)
const isShowUserCard = ref(false)
const isShowGroupCard = ref(false)

const exportSession = {
  sessionId: props.sessionId,
  sessionType: sessionInfo.value.sessionType,
  objectInfo: sessionInfo.value.objectInfo
}

const hasBeenChoosed = computed(() => {
  return props.sessionId === props.choosedSessionId
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
  return !hasBeenChoosed.value && sessionInfo.value.draft
})

const isShowUnreadCount = computed(() => {
  return sessionInfo.value.unreadCount > 0
})

const handleUserCard = (flag) => {
  isShowUserCard.value = flag
}
const handleGroupCard = (flag) => {
  isShowGroupCard.value = flag
}
const onShowUserCard = () => {
  switch (sessionInfo.value.sessionType) {
    case MsgType.CHAT:
      isShowUserCard.value = true
      break
    case MsgType.GROUP_CHAT:
      isShowGroupCard.value = true
      break
    default:
      break
  }
}

let timer
const switchTag = (func) => {
  func()
  clearTimeout(timer)
  timer = setTimeout(() => {
    emit('switchTag', {
      sessionId: props.sessionId,
      top: top.value,
      muted: muted.value
    })
  }, 1000)
}
</script>

<template>
  <div class="session-box" :class="{ 'session-box-active': hasBeenChoosed }">
    <AvatarIcon
      :showName="showName"
      :showId="showId"
      :showAvatarThumb="showAvatarThumb"
      @click="onShowUserCard"
    ></AvatarIcon>
    <div v-if="isShowUnreadCount" class="unread-tips"></div>
    <div class="content-box" @click="emit('isChoosed', exportSession)">
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
            @click="
              switchTag(() => {
                top = !top
              })
            "
            circle
          />
          <el-button
            class="action-button"
            :icon="muted ? Bell : MuteNotification"
            @click="
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
  <UserCard
    :isShow="isShowUserCard"
    :sessionId="props.sessionId"
    :account="sessionInfo.objectInfo.account"
    @update:isShow="handleUserCard"
  ></UserCard>
  <GroupCard
    :isShow="isShowGroupCard"
    @update:isShow="handleGroupCard"
    :group="sessionInfo.objectInfo"
  ></GroupCard>
</template>

<style lang="scss" scoped>
.session-box-active {
  background-color: #c6e2ff;
}

.session-box {
  height: 60px;
  margin: 5px;
  padding: 4px;
  border-radius: 6px;
  padding-right: 0;
  display: flex;
  align-items: center;
  user-select: none;
  position: relative;

  &:hover {
    background-color: #c6e2ff;
  }

  .unread-tips {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: red;
    position: absolute;
    top: 5px;
    left: 40px;
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
          color: gray;
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
