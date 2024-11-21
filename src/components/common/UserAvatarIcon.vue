<script setup>
import { computed } from 'vue'
import { getRandomColor, getFontColor } from '@/js/utils/common'
import { STATUS } from '@/const/userConst'

const props = defineProps(['showName', 'showId', 'showAvatarThumb', 'userStatus', 'size'])

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

const statusCircleSize = computed(() => {
  switch (props.size) {
    case 'large':
      return 16
    case 'small':
      return 10
    case 'default':
    default:
      return 12
  }
})

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
    case STATUS.LEAVING:
      return 'yellow'
    case STATUS.ONLINE:
      return '#95d475'
    case STATUS.BUSYING:
      return 'red'
    case STATUS.OFFLINE:
    default:
      return 'gray'
  }
})
</script>

<template>
  <div class="user-avatar-box" :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }">
    <el-avatar v-if="isShowImg" :src="props.showAvatarThumb" :size="avatarSize" />
    <span class="first-char-box" v-else :style="{ backgroundColor: randomColor, color: fontColor }">
      {{ firstChar }}
    </span>
    <div
      v-if="props.userStatus != null"
      class="status-circle"
      :style="{
        width: statusCircleSize + 'px',
        height: statusCircleSize + 'px',
        backgroundColor: statusCircleColor
      }"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.user-avatar-box {
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
    border: 1px solid #fff;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>
