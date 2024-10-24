<script setup>
import { computed } from 'vue'
import { getRandomColor, getFontColor } from '@/js/utils/common'

const props = defineProps(['showName', 'showId', 'showAvatarThumb', 'userStatus', 'size'])

const avatarSize = props.size || 40

const isShowImg = computed(() => {
  return props.showAvatarThumb ? true : false
})

const firstChar = computed(() => {
  return props.showName ? props.showName.charAt(0) : '*'
})

const randomColor = getRandomColor(props.showName || props.showId)
const fontColor = getFontColor(randomColor)

const statusCircleColor = computed(() => {
  switch (props.userStatus) {
    case 1:
      return 'yellow'
    case 2:
      return '#95d475'
    case 3:
      return 'red'
    case 0:
    default:
      return 'gray'
  }
})
</script>

<template>
  <div class="avatar-box" :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }">
    <el-avatar v-if="isShowImg" :src="props.showAvatarThumb" :size="avatarSize" />
    <span class="first-char-box" v-else :style="{ backgroundColor: randomColor, color: fontColor }">
      {{ firstChar }}
    </span>
    <div
      v-if="props.userStatus != null"
      class="status-circle"
      :style="{ backgroundColor: statusCircleColor }"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.avatar-box {
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  .first-char-box {
    font-size: 18px;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .status-circle {
    width: 12px;
    height: 12px;
    border: 1px solid #fff;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>
