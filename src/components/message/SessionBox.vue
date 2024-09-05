<script setup>
import { ref, computed } from 'vue'
import AvatarIcon from './AvatarIcon.vue'
import SessionTag from './SessionTag.vue'
import UserCard from '../user/UserCard.vue'
import GroupCard from '../group/GroupCard.vue'
import { Top, Bottom, MuteNotification, Bell } from '@element-plus/icons-vue'

const props = defineProps(['sessionId', 'sessionType', 'objectInfo'])
const emit = defineEmits(['exportData'])
const isPinToTop = ref(false)
const isMute = ref(false)
const isShowUserCard = ref(false)
const isShowGroupCard = ref(false)

const sessionInfo = computed(() => {
  return {
    sessionId: props.sessionId,
    chatObj: props.objectInfo
  }
})

const showName = computed(() => {
  switch (props.sessionType) {
    case 'chat':
      return props.objectInfo.nickName
    case 'groupchat':
      return props.objectInfo.groupName
    default:
      return ''
  }
})

const showId = computed(() => {
  switch (props.sessionType) {
    case 'chat':
      return props.objectInfo.account
    case 'groupchat':
      return props.objectInfo.groupId
    default:
      return ''
  }
})

const showAvatarThumb = computed(() => {
  switch (props.sessionType) {
    case 'chat':
    case 'groupchat':
      return props.objectInfo.avatarThumb
    default:
      return ''
  }
})

const handleUserCard = (flag) => {
  isShowUserCard.value = flag
}
const handleGroupCard = (flag) => {
  isShowGroupCard.value = flag
}
const showSomeoneCard = () => {
  switch (props.sessionType) {
    case 'chat':
      isShowUserCard.value = true
      break
    case 'groupchat':
      isShowGroupCard.value = true
      break
    default:
      break
  }
}
</script>

<template>
  <div class="session-box">
    <AvatarIcon
      :showName="showName"
      :showId="showId"
      :showAvatarThumb="showAvatarThumb"
      @click="showSomeoneCard"
    ></AvatarIcon>
    <div class="content-box" @click="emit('exportData', sessionInfo)">
      <div class="header">
        <div class="title">
          <span class="nickname">{{ showName || showId }}</span>
          <SessionTag :tagType="props.sessionType"></SessionTag>
          <SessionTag v-if="isPinToTop" tagType="pinToTop"></SessionTag>
          <SessionTag v-if="isMute" tagType="mute"></SessionTag>
        </div>
        <div class="datetime">
          <span>15:10</span>
        </div>
      </div>
      <div class="body">
        <div class="content">
          <span class="draft">[草稿]</span>
          <span class="detail">你吃饭了吗？</span>
        </div>
        <div class="action">
          <el-button
            class="action-button pin-to-top"
            :icon="isPinToTop ? Bottom : Top"
            @click="isPinToTop = !isPinToTop"
            circle
          />
          <el-button
            class="action-button no-not-disturb"
            :icon="isMute ? Bell : MuteNotification"
            @click="isMute = !isMute"
            circle
          />
        </div>
      </div>
    </div>
  </div>
  <UserCard
    :isShow="isShowUserCard"
    @update:isShow="handleUserCard"
    :user="props.objectInfo"
  ></UserCard>
  <GroupCard
    :isShow="isShowGroupCard"
    @update:isShow="handleGroupCard"
    :group="props.objectInfo"
  ></GroupCard>
</template>

<style lang="scss" scoped>
.session-box {
  height: 50px;
  margin: 5px;
  padding: 4px;
  padding-right: 0;
  display: flex;
  align-items: center;
  user-select: none;
  // cursor: pointer;

  &:hover {
    background-color: #c6e2ff;
    border-radius: 6px;
  }

  .content-box {
    width: 100%;
    height: 100%;
    margin-left: 10px;
    display: flex;
    flex: 1 1;
    flex-direction: column;
    overflow: hidden;

    .header {
      width: 100%;
      height: 24px;
      display: flex;
      align-items: center;

      .title {
        line-height: 20px;
        display: flex;
        align-items: center;
        flex: 1 1;
        overflow: hidden;

        .nickname {
          font-size: 14px;
          margin-right: 5px;
          white-space: nowrap; /*不换行*/
          overflow: hidden; /*超出的文本隐藏*/
          text-overflow: ellipsis; /* 溢出用省略号*/
        }
      }

      .datetime {
        display: block;
        margin-left: 10px;
        width: 40px;
        font-size: 12px;
        color: gray;
      }
    }

    .body {
      height: 20px;
      display: flex;
      align-items: center;

      .content {
        font-size: 12px;
        display: flex;
        flex: 1 1;
        overflow: hidden;

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
        .action-button {
          width: 20px;
          height: 20px;
          margin-left: 2px;
          opacity: 0;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
