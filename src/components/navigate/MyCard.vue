<script setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

// 组件对外暴露打开方法
const open = () => {
  dialogVisible.value = true
}
const close = () => {
  dialogVisible.value = false
}
defineExpose({
  open,
  close
})
</script>

<template>
  <div class="avatar-dialog" v-show="dialogVisible">
    <div class="header">我是上部分</div>
    <div class="footer">我是下部分</div>
  </div>
</template>

<style lang="scss" scoped>
.avatar-dialog {
  background-color: hsl(241, 90%, 46%);
  width: 300px;
  height: 300px;
  position: absolute;
  left: 0px;
  top: 20px;
  margin-left: 100px;
  border-radius: 10px;
  padding: 0px;
}
</style>
