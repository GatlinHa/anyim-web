<script setup>
import { ChatRound, Phone, VideoCamera, MoreFilled } from '@element-plus/icons-vue'
import AvatarIcon from '../common/AvatarIcon.vue'
import { sessionShowTime } from '@/utils/common'
import router from '@/router'

const props = defineProps(['type', 'session'])
const emit = defineEmits(['showUserCard'])

const onShowCard = () => {
  emit('showUserCard', {
    sessionId: props.session.sessionId,
    account: props.session.objectInfo.account
  })
}

const goToSessionTab = () => {
  router.push({
    path: '/message',
    query: {
      sessionId: props.session.sessionId
    }
  })
}
</script>

<template>
  <div class="contacts-user-item" @dblclick="goToSessionTab">
    <div class="content">
      <AvatarIcon
        class="avatar"
        :showName="props.session.objectInfo.nickName"
        :showId="props.session.objectInfo.account"
        :showAvatarThumb="props.session.objectInfo.avatarThumb"
        :userStatus="props.session.objectInfo.status"
        @click="onShowCard"
      ></AvatarIcon>
      <div class="name-account">
        <div class="nick-name">{{ props.session.objectInfo.nickName }}</div>
        <div class="account">{{ props.session.objectInfo.account }}</div>
      </div>
      <div class="organization" :title="props.session.objectInfo.organization">
        {{ props.session.objectInfo.organization || '没有部门' }}
      </div>
      <div class="diff-display">
        <div v-if="props.type === 'last'" class="last">
          <div class="last-time">{{ sessionShowTime(props.session.lastMsgTime) }}</div>
          <div class="last-content" :title="props.session.lastMsgContent">
            {{ props.session.lastMsgContent }}
          </div>
        </div>
        <div v-if="props.type === 'mark'" class="mark">mark</div>
        <div v-if="props.type === 'partition'" class="partition">partition</div>
      </div>
    </div>
    <div class="action">
      <el-button size="large" :icon="ChatRound" circle @click="goToSessionTab" />
      <el-button size="large" :icon="Phone" circle />
      <el-button size="large" :icon="VideoCamera" circle />
      <el-button
        v-if="['mark', 'partition'].includes(props.type)"
        size="large"
        :icon="MoreFilled"
        circle
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contacts-user-item {
  height: 40px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e9e9eb;
  display: flex;
  justify-content: space-between;

  &:hover {
    border: 1px solid #409eff;
  }
}

.content {
  display: flex;
  justify-content: start;
  align-items: center;
  font-size: 14px;
}

.avatar {
  margin-left: 10px;
}

.name-account {
  width: 100px;
  margin-left: 20px;
  user-select: text;

  .nick-name {
    padding: 0;
    white-space: nowrap; /*不换行*/
    overflow: hidden; /*超出的文本隐藏*/
    text-overflow: ellipsis; /* 溢出用省略号*/
  }

  .account {
    padding: 0;
    font-size: 14px;
    color: gray;
    white-space: nowrap; /*不换行*/
    overflow: hidden; /*超出的文本隐藏*/
    text-overflow: ellipsis; /* 溢出用省略号*/
  }
}

.organization {
  width: 120px;
  margin-left: 20px;
  white-space: nowrap; /*不换行*/
  overflow: hidden; /*超出的文本隐藏*/
  text-overflow: ellipsis; /* 溢出用省略号*/
  user-select: text;
}

.diff-display {
  width: 300px;
  height: 100%;
  margin-left: 20px;
  user-select: text;

  .last {
    height: 100%;
    display: flex;
    align-items: center;
    .last-time {
      justify-content: start;
      border-radius: 4px;
      padding: 4px;
      background: #c8c9cc;
      flex-shrink: 0;
    }
    .last-content {
      margin-left: 5px;
      white-space: nowrap; /*不换行*/
      overflow: hidden; /*超出的文本隐藏*/
      text-overflow: ellipsis; /* 溢出用省略号*/
    }
  }
}

.action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
