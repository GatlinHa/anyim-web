<script setup>
import { computed } from 'vue'
import UserAvatarIcon from '@/components/common/UserAvatarIcon.vue'
import { MsgType } from '@/proto/msg'
import { highLightedText } from '@/js/utils/common'

/**
 * contactInfo：用户详情，至少包括昵称和账号，status不传则不显示状态圆圈
 * keyWords：搜索关键字，用于高亮显示检索的关键字
 * size：尺寸，不传即显示默认值
 */
const props = defineProps(['contactInfo', 'keyWords', 'size'])
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

const showName = computed(() => {
  return highLightedText(props.contactInfo.nickName, props.keyWords, '#409eff')
})

const showId = computed(() => {
  return highLightedText(props.contactInfo.account, props.keyWords, '#409eff', 'full')
})

const onShowCard = (event) => {
  event.preventDefault()
  emit('showContactCard', props.contactInfo)
}

const onOpenSession = () => {
  emit('openSession', { msgType: MsgType.CHAT, objectInfo: props.contactInfo })
}
</script>

<template>
  <div class="contact-item" :style="{ height: contactItemHeight + 'px' }">
    <UserAvatarIcon
      class="avatar-contact-item"
      :showName="props.contactInfo.nickName"
      :showId="props.contactInfo.account"
      :showAvatarThumb="props.contactInfo.avatarThumb"
      :userStatus="props.contactInfo.status"
      :size="props.size"
      @click="onShowCard"
    ></UserAvatarIcon>
    <div class="body" @click="onOpenSession">
      <div class="title">
        <span
          class="name text-ellipsis"
          :title="props.contactInfo.nickName"
          v-html="showName"
        ></span>
        <span class="account" :title="props.contactInfo.account" v-html="showId"></span>
      </div>
      <div class="info">
        <span class="organization" :title="props.contactInfo.organization || '-'"
          >部门: {{ props.contactInfo.organization || '-' }}</span
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact-item {
  min-width: 160px;
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
    user-select: text;

    .title {
      height: 20px;
      display: flex;
      align-items: center;

      .name {
        margin-right: 5px;
        font-size: 14px;
      }

      .account {
        font-size: 12px;
        white-space: nowrap; /*不换行*/
      }
    }

    .info {
      height: 20px;
      display: flex;
      align-items: center;

      .organization {
        font-size: 12px;
      }
    }
  }
}
</style>
