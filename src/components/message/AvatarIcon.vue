<script setup>
import { computed } from 'vue'
import { getRandomColor, getFontColor } from '@/utils/common'

const props = defineProps(['user'])

const isShowImg = computed(() => {
  return props.user.avatarThumb ? true : false
})

const firstChar = computed(() => {
  return props.user.nickName ? props.user.nickName.charAt(0) : '未'
})

const randomColor = getRandomColor(props.user.account)
const fontColor = getFontColor(randomColor)

const openSessionCardDialog = () => {
  // 打开用户头像卡片
}
</script>

<template>
  <div class="avatar-box">
    <el-avatar v-if="isShowImg" :src="props.user.avatarThumb" @click="openSessionCardDialog" />
    <span class="first-char-box" v-else :style="{ backgroundColor: randomColor, color: fontColor }">
      {{ firstChar }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.avatar-box {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  cursor: pointer;

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
