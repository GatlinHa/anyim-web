<script setup>
import { computed } from 'vue'
import AvatarIcon from '@/components/common/AvatarIcon.vue'
import { MsgType } from '@/proto/msg'

const props = defineProps(['contactInfo', 'size'])
const emit = defineEmits(['showContactCard', 'openSession'])

const contactItemHeight = computed(() => {
  switch (props.size) {
    case 'large':
      return 64
    case 'small':
      return 32
    case 'default':
    default:
      return 48
  }
})

const onShowCard = () => {
  emit('showContactCard', props.contactInfo)
}

const onOpenSession = () => {
  emit('openSession', { msgType: MsgType.CHAT, objectInfo: props.contactInfo })
}
</script>

<template>
  <div class="contact-item" :style="{ height: contactItemHeight + 'px' }">
    <AvatarIcon
      class="avatar-contact-item"
      :showName="props.contactInfo.nickName"
      :showId="props.contactInfo.account"
      :showAvatarThumb="props.contactInfo.avatarThumb"
      :userStatus="props.contactInfo.status"
      :size="props.size"
      @click="onShowCard"
    ></AvatarIcon>
    <div class="body" @click="onOpenSession">
      <div class="title">
        <span class="name text-ellipsis">{{ props.contactInfo.nickName }}</span>
        <span class="account">{{ props.contactInfo.account }}</span>
      </div>
      <div class="info">
        <span class="organization">部门: {{ props.contactInfo.organization || '-' }}</span>
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

  .body {
    margin-left: 5px;
    flex: 1;
    overflow: hidden;

    .title {
      height: 20px;
      display: flex;
      align-items: center;

      .name {
        margin-right: 5px;
        font-size: 14px;
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
