<script setup>
import { computed } from 'vue'
import groupChatIcon from '@/assets/svg/groupchat.svg'

/**
 * avatarThumb: 群组头像
 * size：尺寸，不传即显示默认值
 */
const props = defineProps(['avatarThumb', 'size'])

const avatarSize = computed(() => {
  switch (props.size) {
    case 'huge':
      return 100
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
    case 'huge':
      return 80
    case 'large':
      return 30
    case 'small':
      return 18
    case 'default':
    default:
      return 24
  }
})
</script>

<template>
  <div class="group-avatar-box">
    <el-avatar v-if="props.avatarThumb" :src="props.avatarThumb" :size="avatarSize" />
    <div v-else class="svg-avatar" :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }">
      <groupChatIcon :style="{ width: svgSize + 'px', height: svgSize + 'px' }"></groupChatIcon>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svg-avatar {
  border-radius: 50%;
  background-color: #c0c4cc;
  display: flex;
  justify-content: center;
  align-items: center;

  .svg-icon {
    fill: #fff;
  }
}
</style>
