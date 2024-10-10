<script setup>
import { computed } from 'vue'
import { getRandomColor, getFontColor } from '@/utils/common'

const props = defineProps(['showName', 'showId', 'showAvatarThumb', 'size'])

const avatarSize = props.size || 40

const isShowImg = computed(() => {
  return props.showAvatarThumb ? true : false
})

const firstChar = computed(() => {
  return props.showName ? props.showName.charAt(0) : '未'
})

const randomColor = getRandomColor(props.showName || props.showId)
const fontColor = getFontColor(randomColor)
</script>

<template>
  <div class="avatar-box" :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }">
    <el-avatar v-if="isShowImg" :src="props.showAvatarThumb" :size="avatarSize" />
    <span class="first-char-box" v-else :style="{ backgroundColor: randomColor, color: fontColor }">
      {{ firstChar }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.avatar-box {
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;

  .first-char-box {
    font-size: 18px;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
