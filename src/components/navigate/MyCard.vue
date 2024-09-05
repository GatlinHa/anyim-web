<script setup>
import { ref, computed } from 'vue'
import { Close, Male, Female } from '@element-plus/icons-vue'
import { userStore } from '@/stores'

const userData = userStore()

const truncatedSignature = computed(() => {
  const signature = userData.user.signature || '您还没有个性签名。'
  const lengthLimit = 50
  return signature.length > lengthLimit ? signature.slice(0, lengthLimit) + '...' : signature
})

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
      <div class="main">
        <el-avatar class="avatar" :src="userData.user.avatarThumb" />

        <div class="gender">
          <el-icon v-if="userData.user.sex === 1" color="#508afe"><Male /></el-icon>
          <el-icon v-if="userData.user.sex === 2" color="#ff5722"><Female /></el-icon>
        </div>

        <div class="nickname text-ellipsis">
          {{ userData.user.nickName || '未设置昵称' }}({{ userData.user.account }})
        </div>

        <el-text class="signature" type="primary" size="large">
          {{ truncatedSignature }}
        </el-text>
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
      color: #fff;
      background-color: red;
    }
  }

  .main {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .avatar {
      width: 100px;
      height: 100px;
      position: absolute;
      top: 40px;
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
      top: 145px;
      width: 80%;
      height: 24px;
      font-size: 16px;
      text-align: center;
      color: #409eff;
      font-weight: bold;
      user-select: text;
    }

    .signature {
      width: 80%;
      height: 85px;
      position: absolute;
      top: 200px;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      white-space: normal; //允许文本内容自动换行
      user-select: text;
      color: black;
    }
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
