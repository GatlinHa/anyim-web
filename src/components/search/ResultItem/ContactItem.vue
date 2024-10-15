<script setup>
import AvatarIcon from '@/components/message/AvatarIcon.vue'

const props = defineProps(['user'])
const emit = defineEmits(['showUserCard'])

const onShowCard = () => {
  emit('showUserCard', { sessionId: props.sessionId, account: props.user.account })
}
</script>

<template>
  <div class="contact-item">
    <AvatarIcon
      class="avatar"
      :showName="props.user.nickName"
      :showId="props.user.account"
      :showAvatarThumb="props.user.avatarThumb"
      @click="onShowCard"
    ></AvatarIcon>
    <div class="body">
      <div class="title">
        <span class="name">{{ props.user.nickName }}</span>
        <span class="account">{{ props.user.account }}</span>
      </div>
      <div class="info">
        <span class="organization">部门: {{ props.user.organization || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact-item {
  height: 48px;
  padding: 2px;
  padding-left: 5px;
  border-radius: 6px;
  padding-right: 0;
  display: flex;
  align-items: center;
  user-select: none;
  position: relative;

  &:hover {
    background-color: #c6e2ff;
  }

  .body {
    margin-left: 10px;
    .title {
      height: 20px;
      display: flex;
      align-items: center;

      .name {
        margin-right: 5px;
        font-size: 14px;
        white-space: nowrap; /*不换行*/
        overflow: hidden; /*超出的文本隐藏*/
        text-overflow: ellipsis; /* 溢出用省略号*/
        color: #000;
      }

      .account {
        font-size: 12px;
        color: gray;
        white-space: nowrap; /*不换行*/
      }
    }

    .info {
      height: 20px;
      display: flex;
      align-items: center;

      .organization {
        font-size: 14px;
      }
    }
  }
}
</style>
