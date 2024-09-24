<script setup>
import { ref, computed } from 'vue'
import { MsgType } from '@/proto/msg'
import { userStore } from '@/stores'
import { messageSysShowTime, messageBoxShowTime } from '@/utils/common'
import AvatarIcon from './AvatarIcon.vue'

const props = defineProps([
  'msg',
  'obj',
  'lastMsgTime',
  'firstMsgId',
  'hasNoMoreMsg',
  'isLoadMoreLoading'
])
const emit = defineEmits(['loadMore'])

const userData = userStore()
const isShowUserCard = ref(false)
const loadMoreTips = ref('查看更多消息')
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
  return isSelf.value ? userData.user.account : props.obj.account
})

const nickName = computed(() => {
  return isSelf.value ? userData.user.nickName : props.obj.nickName
})

const avatarThumb = computed(() => {
  return isSelf.value ? userData.user.avatarThumb : props.obj.avatarThumb
})

const sysShowTime = computed(() => {
  return messageSysShowTime(new Date(props.msg.msgTime))
})

// 判断是否是连续的会话，与上个会话时间差小于1分钟
const isContinuousSession = computed(() => {
  if (!props.lastMsgTime) {
    return false
  }

  const diff = new Date(props.msg.msgTime).getTime() - new Date(props.lastMsgTime).getTime()
  if (diff < 1 * 60 * 1000) {
    return true
  } else {
    return false
  }
})

const msgTime = computed(() => {
  return messageBoxShowTime(props.msg.msgTime)
})

const handleUserCard = (flag) => {
  isShowUserCard.value = flag
}

const onLoadMore = () => {
  loadMoreTips.value = ''
  emit('loadMore')
}

const onShowUserCard = () => {
  isShowUserCard.value = true
}
</script>

<template>
  <div v-if="props.msg.msgType === MsgType.CHAT" class="message-item">
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

    <span v-if="!isContinuousSession" class="datetime">{{ sysShowTime }}</span>
    <div class="message-container-wrapper">
      <el-container class="el-container-right" v-if="isSelf">
        <el-main class="el-main-right">
          <el-container class="message-content-wrapper">
            <el-header class="message-time">{{ msgTime }}</el-header>
            <el-main class="message-content">
              <div class="div-blank"></div>
              <div class="div-content">{{ props.msg.content }}</div>
            </el-main>
          </el-container>
        </el-main>
        <el-aside class="el-aside-right">
          <AvatarIcon
            :showId="account"
            :showName="nickName"
            :showAvatarThumb="avatarThumb"
            @click="onShowUserCard"
            :size="30"
          ></AvatarIcon>
        </el-aside>
      </el-container>

      <el-container class="el-container-left" v-else>
        <el-aside class="el-aside-left">
          <AvatarIcon
            :showId="account"
            :showName="nickName"
            :showAvatarThumb="avatarThumb"
            @click="onShowUserCard"
            :size="30"
          ></AvatarIcon>
        </el-aside>
        <el-main class="el-main-left">
          <el-container class="message-content-wrapper">
            <el-header class="message-time">{{ msgTime }}</el-header>
            <el-main class="message-content">
              <div class="div-content">{{ props.msg.content }}</div>
              <div class="div-blank"></div>
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </div>
  </div>
  <UserCard :isShow="isShowUserCard" :account="account" @update:isShow="handleUserCard"></UserCard>
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

  .datetime {
    border-radius: 2px;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 12px;
    background-color: #c8c9cc;
    color: white;
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

            .div-content {
              max-width: 500px;
              padding: 5px;
              font-size: 14px;
              background-color: #c6e2ff;
              border-radius: 10px;
              border-top-right-radius: 0;
              user-select: text;
            }

            .div-blank {
              flex: 1;
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

            .div-content {
              max-width: 500px;
              padding: 5px;
              font-size: 14px;
              background-color: #dedfe0;
              border-radius: 10px;
              border-top-left-radius: 0;
              user-select: text;
            }

            .div-blank {
              flex: 1;
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
