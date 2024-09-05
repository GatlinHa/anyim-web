<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Close, Male, Female } from '@element-plus/icons-vue'
import avatar from '@/assets/default_avatar.png'

const props = defineProps(['isShow', 'user'])
const emit = defineEmits(['update:isShow'])

// const isLoading = ref(false)
const userCardRef = ref()

const preventClose = (event) => {
  event.stopPropagation()
}

const closeCardIfOutside = (event) => {
  if (!event.target.closest('.user-card') && !event.target.closest('.avatar-box') && props.isShow) {
    emit('update:isShow', false)
  }
}

const handleEscEvent = (event) => {
  if (event.key === 'Escape') {
    emit('update:isShow', false)
  }
}

const truncatedSignature = computed(() => {
  const signature = props.user.signature || 'TA还没有个性签名。'
  const lengthLimit = 50
  return signature.length > lengthLimit ? signature.slice(0, lengthLimit) + '...' : signature
})

// 关闭的时候触发
const onClose = () => {
  emit('update:isShow', false)
}

onMounted(() => {
  document.addEventListener('click', closeCardIfOutside)
  document.addEventListener('keydown', handleEscEvent)
})

onUnmounted(() => {
  document.removeEventListener('click', closeCardIfOutside)
  document.removeEventListener('keydown', handleEscEvent)
})
</script>

<template>
  <div ref="userCardRef">
    <transition name="fade">
      <div v-if="isShow" class="overlay"></div>
    </transition>
    <transition name="fade">
      <div class="user-card" v-if="isShow" @click.self="preventClose($event)">
        <div class="header">
          <el-icon class="close-button" @click="onClose"><Close /></el-icon>
          <div class="main">
            <el-avatar class="avatar" :src="props.user.avatarThumb || avatar" />
            <div class="gender">
              <el-icon v-if="props.user.sex === 1" color="#508afe"><Male /></el-icon>
              <el-icon v-if="props.user.sex === 2" color="#ff5722"><Female /></el-icon>
            </div>
            <div class="nickname text-ellipsis">
              {{ props.user.nickName || '未设置昵称' }}({{ props.user.account }})
            </div>
          </div>
        </div>

        <div class="body">
          <el-text class="signature">
            {{ truncatedSignature }}
          </el-text>
          <div class="info-item phone">
            <span class="label">手机：</span>
            <span class="value">{{ props.user.phoneNum || '-' }}</span>
          </div>
          <div class="info-item email">
            <span class="label">邮箱：</span>
            <span class="value">{{ props.user.email || '-' }}</span>
          </div>
          <div class="info-item email">
            <span class="label">驻地：</span>
            <span class="value">{{ props.user.base || '-' }}</span>
          </div>
          <div class="info-item nickname">
            <span class="label">部门：</span>
            <span class="value">{{ props.user.organize || '-' }}</span>
          </div>
          <div class="info-item remark">
            <span class="label">备注：</span>
            <span class="value">{{ props.user.remark || 'TODO' }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.user-card {
  width: 300px;
  height: 500px;
  border-radius: 10px;
  padding: 0px;
  box-shadow: 2px 2px 20px gray;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  z-index: 1;

  .header {
    width: 100%;
    height: 200px;
    background: linear-gradient(to bottom, #a0cfff, #ecf5ff);

    &::before {
      width: 150px;
      height: 150px;
      content: '';
      background: linear-gradient(to right, #79bbff, #fff);
      position: absolute;
      z-index: 1;
      border-radius: 50%;
      right: -25%;
      top: -15%;
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
        top: 150px;
        width: 80%;
        height: 48px;
        font-size: 16px;
        text-align: center;
        color: #409eff;
        font-weight: bold;
        user-select: text;
      }
    }
  }

  .body {
    width: 100%;
    height: 300px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;

    .signature {
      width: 80%;
      margin-top: 16px;
      margin-bottom: 10px;
      padding: 5px;
      border-radius: 4px;
      background-color: #f5f5f5;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      white-space: normal; //允许文本内容自动换行
      user-select: text;
    }

    .info-item {
      margin-top: 10px;
      width: 80%;
      display: flex;
      font-size: 14px;

      .label {
        color: #909399;
        flex-shrink: 0;
      }

      .value {
        margin-left: 10px;
        color: #409eff;
        user-select: text;
      }
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
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
