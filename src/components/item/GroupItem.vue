<script setup>
import { computed } from 'vue'
import { MsgType } from '@/proto/msg'
import { highLightedText } from '@/js/utils/common'
import GroupAvatarIcon from '@/components/common/GroupAvatarIcon.vue'

/**
 * groupInfo: 群组详情
 * keyWords：搜索关键字，用于高亮显示检索的关键字
 * size：尺寸，不传即显示默认值
 * disableClickAvatar：是否允许点击头像，默认false
 */
const props = defineProps(['groupInfo', 'keyWords', 'size', 'disableClickAvatar'])
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

const showName = computed(() => {
  return highLightedText(props.groupInfo.groupName, props.keyWords, '#409eff')
})

const showId = computed(() => {
  return highLightedText(props.groupInfo.groupId, props.keyWords, '#409eff', 'full')
})

const onShowCard = (event) => {
  event.preventDefault()
  if (!props.disableClickAvatar) {
    emit('showGroupCard', props.groupInfo)
  }
}

const onOpenSession = () => {
  emit('openSession', { msgType: MsgType.GROUP_CHAT, objectInfo: props.groupInfo })
}
</script>

<template>
  <div class="group-item" :style="{ height: itemHeight + 'px' }">
    <GroupAvatarIcon
      :avatarThumb="props.groupInfo.avatarThumb"
      :size="props.size"
      @click="onShowCard"
      :style="{ cursor: !props.disableClickAvatar ? 'pointer' : 'auto' }"
    >
    </GroupAvatarIcon>

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
