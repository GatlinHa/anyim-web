<script setup>
import { ref, computed } from 'vue'
import { msgType } from '@/const/msgConst'
import { userStore } from '@/stores'
import { messageShowTime } from '@/utils/common'
import AvatarIcon from './AvatarIcon.vue'

const props = defineProps(['type', 'objectInfo', 'content'])

const userData = userStore()
const isShowUserCard = ref(false)

const isSelf = computed(() => {
  return userData.user.account === props.objectInfo.account
})

const showTime = computed(() => {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
  return messageShowTime(oneDayAgo)
})

const handleUserCard = (flag) => {
  isShowUserCard.value = flag
}

const onShowUserCard = () => {
  isShowUserCard.value = true
}
</script>

<template>
  <div v-if="props.type === msgType.NO_MORE_MSG" class="no-more-message">
    <span>当前无更多消息</span>
  </div>
  <div v-if="props.type === msgType.USER_MSG" class="user-message">
    <span class="datetime">{{ showTime }}</span>
    <div class="message-container-wrapper">
      <el-container class="el-container-right" v-if="isSelf">
        <el-main class="el-main-right">Main</el-main>
        <el-aside class="el-aside-right">
          <AvatarIcon
            :showId="props.objectInfo.account"
            :showName="props.objectInfo.nickName"
            :showAvatarThumb="props.objectInfo.avatarThumb"
            @click="onShowUserCard"
            :size="30"
          ></AvatarIcon>
        </el-aside>
      </el-container>
      <el-container class="el-container-left" v-else>
        <el-aside class="el-aside-left">
          <AvatarIcon
            :showId="props.objectInfo.account"
            :showName="props.objectInfo.nickName"
            :showAvatarThumb="props.objectInfo.avatarThumb"
            @click="onShowUserCard"
            :size="30"
          ></AvatarIcon>
        </el-aside>
        <el-main class="el-main-left">Main</el-main>
      </el-container>
    </div>
  </div>
  <UserCard
    :isShow="isShowUserCard"
    @update:isShow="handleUserCard"
    :user="props.objectInfo"
  ></UserCard>
</template>

<style lang="scss" scoped>
.no-more-message {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: gray;
}

.user-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .datetime {
    // height: 30px;
    border-radius: 2px;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 14px;
    background-color: #c8c9cc;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
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
      .el-main-right {
      }
    }
  }
}

.el-container {
  width: 100%;
  display: flex;
}
</style>
