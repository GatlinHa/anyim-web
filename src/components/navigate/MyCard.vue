<script setup>
import { ref } from 'vue'
import { Close, Male, Female } from '@element-plus/icons-vue'

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
  <transition name="fade">
    <div class="card-dialog" v-show="dialogVisible">
      <el-icon class="close-button" @click="dialogVisible = false"><Close /></el-icon>
      <div class="header">
        <el-avatar
          class="avatar"
          src="http://127.0.0.1:9001/box-im/image/20240818/1723972279844.jpg"
        />

        <div class="gender">
          <el-icon v-if="true" color="#508afe"><Male /></el-icon>
          <el-icon v-if="false" color="#ff5722"><Female /></el-icon>
        </div>

        <div class="nickname text-ellipsis">未设置昵称</div>
      </div>

      <div class="signature">
        <el-input
          v-model="input"
          style="width: 240px"
          size="small"
          placeholder="编辑个性签名，展示我的独特态度。"
        />
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.card-dialog {
  background: linear-gradient(to bottom, #a0cfff, #fff);
  width: 300px;
  height: 300px;
  position: absolute;
  left: 0px;
  top: 20px;
  margin-left: 100px;
  border-radius: 10px;
  padding: 0px;
  box-shadow: 2px 2px 20px gray;
  overflow: hidden;

  &::before {
    width: 150px;
    height: 150px;
    content: '';
    background: linear-gradient(to right, #79bbff, #fff);
    position: absolute;
    z-index: 1;
    border-radius: 50%;
    right: -25%;
    top: -25%;
  }

  .close-button {
    color: gray;
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 1;

    &:hover {
      color: red;
    }
  }

  .header {
    width: 100%;
    height: 60%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .avatar {
      width: 100px;
      height: 100px;
    }

    .gender {
      width: 20px;
      height: 20px;
      position: absolute;
      left: 190px;
      top: 125px;
      border-radius: 50%;
    }

    .nickname {
      position: absolute;
      top: 160px;
      width: 80%;
      height: 24px;
      font-size: 16px;
      text-align: center;
      color: black;
    }
  }

  .signature {
    margin-top: 50px;
    display: flex;
    justify-content: center;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
