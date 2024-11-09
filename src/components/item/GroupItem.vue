<script setup>
import { computed } from 'vue'
import { MsgType } from '@/proto/msg'
import groupChatIcon from '@/assets/svg/groupchat.svg'
import { highLightedText } from '@/js/utils/common'

const props = defineProps(['groupInfo', 'keyWords', 'size'])
const emit = defineEmits(['showGroupCard', 'openSession'])

const itemHeight = computed(() => {
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

const avatarSize = computed(() => {
  switch (props.size) {
    case 'large':
      return 50
    case 'small':
      return 30
    case 'default':
    default:
      return 40
  }
})

const svgSize = computed(() => {
  switch (props.size) {
    case 'large':
      return 30
    case 'small':
      return 18
    case 'default':
    default:
      return 24
  }
})

const showName = computed(() => {
  return highLightedText(props.groupInfo.groupName, props.keyWords, '#409eff')
})

const showId = computed(() => {
  return highLightedText(props.groupInfo.groupId, props.keyWords, '#409eff', 'full')
})

const onShowCard = (event) => {
  event.preventDefault()
  emit('showGroupCard', props.groupInfo)
}

const onOpenSession = () => {
  emit('openSession', { msgType: MsgType.GROUP_CHAT, objectInfo: props.groupInfo })
}
</script>

<template>
  <div class="group-item" :style="{ height: itemHeight + 'px' }">
    <div class="avatar" @click="onShowCard">
      <el-avatar
        v-if="props.groupInfo.avatarThumb"
        :src="props.groupInfo.avatarThumb"
        :size="avatarSize"
        shape="square"
      />
      <div
        v-else
        class="svg-avatar"
        :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }"
      >
        <groupChatIcon :style="{ width: svgSize + 'px', height: svgSize + 'px' }"></groupChatIcon>
      </div>
    </div>

    <div class="info" @click="onOpenSession">
      <span
        class="text-ellipsis"
        :title="props.groupInfo.groupName"
        v-html="showName"
        style="font-size: 14px"
      >
      </span>
      <span class="group-id" style="color: gray; font-size: 12px">
        <div v-html="showId"></div>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group-item {
  border-radius: 6px;
  display: flex;
  align-items: center;
  user-select: none;

  .avatar {
    cursor: pointer;

    .svg-avatar {
      border-radius: 4px;
      background-color: #c0c4cc;
      display: flex;
      justify-content: center;
      align-items: center;

      .svg-icon {
        fill: #fff;
      }
    }
  }

  .info {
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 0; //让浏览器在计算布局时不使用内部元素的宽度，而是完全依赖flex属性来确定高度
    user-select: text;
  }
}
</style>
