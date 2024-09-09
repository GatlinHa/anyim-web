<script setup>
import { ref, computed } from 'vue'
import { msgType } from '@/const/msgConst'
import { userStore } from '@/stores'
import { messageSysShowTime, messageBoxShowTime } from '@/utils/common'
import AvatarIcon from './AvatarIcon.vue'

const props = defineProps(['obj', 'lastMsgTime'])

const userData = userStore()
const isShowUserCard = ref(false)

const isSelf = computed(() => {
  return userData.user.account === props.obj.user.account
})

const sysShowTime = computed(() => {
  const testTime = new Date(props.obj.msgTime - 0 * 24 * 60 * 60 * 1000)
  return messageSysShowTime(testTime)
})

// 判断是否是连续的会话，与上个会话时间差小于1分钟
const isContinuousSession = computed(() => {
  if (!props.lastMsgTime) {
    return false
  }

  const diff = props.obj.msgTime.getTime() - props.lastMsgTime.getTime()
  if (diff < 1 * 60 * 1000) {
    return true
  } else {
    return false
  }
})

const msgTime = computed(() => {
  return messageBoxShowTime(props.obj.msgTime)
})

const handleUserCard = (flag) => {
  isShowUserCard.value = flag
}

const onShowUserCard = () => {
  isShowUserCard.value = true
}
</script>

<template>
  <div v-if="props.obj.type === msgType.USER_MSG" class="user-message">
    <span v-if="!isContinuousSession" class="datetime">{{ sysShowTime }}</span>
    <div class="message-container-wrapper">
      <el-container class="el-container-right" v-if="isSelf">
        <el-main class="el-main-right">
          <el-container class="message-content-wrapper">
            <el-header class="message-time">{{ msgTime }}</el-header>
            <el-main class="message-content">
              <div class="div-blank"></div>
              <div class="div-content">{{ props.obj.content }}</div>
            </el-main>
          </el-container>
        </el-main>
        <el-aside class="el-aside-right">
          <AvatarIcon
            :showId="props.obj.user.account"
            :showName="props.obj.user.nickName"
            :showAvatarThumb="props.obj.user.avatarThumb"
            @click="onShowUserCard"
            :size="30"
          ></AvatarIcon>
        </el-aside>
      </el-container>

      <el-container class="el-container-left" v-else>
        <el-aside class="el-aside-left">
          <AvatarIcon
            :showId="props.obj.user.account"
            :showName="props.obj.user.nickName"
            :showAvatarThumb="props.obj.user.avatarThumb"
            @click="onShowUserCard"
            :size="30"
          ></AvatarIcon>
        </el-aside>
        <el-main class="el-main-left">
          <el-container class="message-content-wrapper">
            <el-header class="message-time">{{ msgTime }}</el-header>
            <el-main class="message-content">
              <div class="div-content">{{ props.obj.content }}</div>
              <div class="div-blank"></div>
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </div>
  </div>
  <UserCard
    :isShow="isShowUserCard"
    @update:isShow="handleUserCard"
    :user="props.obj.user"
  ></UserCard>
</template>

<style lang="scss" scoped>
.user-message {
  width: 100%;
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

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
              background-color: #c6e2ff;
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
