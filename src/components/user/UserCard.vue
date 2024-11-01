<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Close, Male, Female, Check, Edit } from '@element-plus/icons-vue'
import avatar from '@/assets/default_avatar.png'
import { userStore, messageStore } from '@/stores'
import { combineId } from '@/js/utils/common'

const props = defineProps(['isShow', 'userInfo'])
const emit = defineEmits(['close'])

const userData = userStore()
const messageData = messageStore()

const userCardRef = ref()

const sessionId = computed(() => {
  return combineId(userData.user.account, props.userInfo?.account)
})
const mark = computed(() => {
  return messageData.sessionList[sessionId.value].mark
})
const markEditing = ref(false)
const newMark = ref('')
const markEditRef = ref()

const isSelf = computed(() => {
  return userData.user.account === props.userInfo.account
})

const preventClose = (event) => {
  event.stopPropagation()
}

const closeCardIfOutside = (event) => {
  if (!props.isShow) return
  if (
    !event.target.closest('.user-card') &&
    !event.target.closest('.avatar-session-item') &&
    !event.target.closest('.avatar-message-item') &&
    !event.target.closest('.avatar-contact-item') &&
    !event.target.closest('.value') &&
    !event.target.closest('.edit')
  ) {
    onClose()
  }
}

const handleEscEvent = (event) => {
  if (event.key === 'Escape') {
    onClose()
  }
}

const truncatedSignature = computed(() => {
  const signature = props.userInfo.signature || 'TA还没有个性签名。'
  const lengthLimit = 50
  return signature.length > lengthLimit ? signature.slice(0, lengthLimit) + '...' : signature
})

// 关闭的时候触发
const onClose = () => {
  emit('close')
  markEditing.value = false
}

const onClickEditMark = () => {
  newMark.value = mark.value || ''
  markEditing.value = true
  nextTick(() => {
    markEditRef.value.focus()
  })
}

const saveMark = () => {
  if (newMark.value.trim() !== mark.value) {
    messageData.updateSession({
      sessionId: sessionId.value,
      mark: newMark.value.trim()
    })
  }
  markEditing.value = false
}

const cancelMark = () => {
  markEditing.value = false
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
      <div class="user-card" v-if="props.isShow" @click.self="preventClose($event)">
        <div class="header">
          <el-icon class="close-button" @click="onClose"><Close /></el-icon>
          <div class="main">
            <el-avatar class="avatar" :src="props.userInfo.avatarThumb || avatar" />
            <div class="gender">
              <el-icon v-if="props.userInfo.gender === 1" color="#508afe"><Male /></el-icon>
              <el-icon v-if="props.userInfo.gender === 2" color="#ff5722"><Female /></el-icon>
            </div>
            <div class="nickname">
              {{ props.userInfo.nickName || '未设置昵称' }}({{ props.userInfo.account }})
            </div>
          </div>
        </div>

        <div class="body">
          <el-text class="signature">
            {{ truncatedSignature }}
          </el-text>
          <div class="info-item phone">
            <span class="label">手机：</span>
            <span class="value">{{ props.userInfo.phoneNum || '-' }}</span>
          </div>
          <div class="info-item email">
            <span class="label">邮箱：</span>
            <span class="value">{{ props.userInfo.email || '-' }}</span>
          </div>
          <div class="info-item nickname">
            <span class="label">部门：</span>
            <span class="value">{{ props.userInfo.organize || '-' }}</span>
          </div>
          <div v-if="!isSelf" class="info-item mark">
            <span class="label">备注：</span>
            <div v-if="!markEditing" class="value value-mark">
              <span @click="onClickEditMark" style="cursor: pointer">{{ mark || '-' }}</span>
              <el-button
                type="primary"
                :icon="Edit"
                size="small"
                circle
                @click="onClickEditMark"
              ></el-button>
            </div>
            <div v-else class="edit">
              <el-input
                ref="markEditRef"
                v-model="newMark"
                maxlength="10"
                show-word-limit
                size="small"
                style="margin: 0 2px 0 10px"
                @keyup.enter="saveMark"
              ></el-input>
              <el-button
                type="success"
                :icon="Check"
                size="small"
                circle
                style="margin: 0 2px 0 2px"
                @click="saveMark"
              ></el-button>
              <el-button
                type="info"
                :icon="Close"
                size="small"
                circle
                style="margin: 0 2px 0 2px"
                @click="cancelMark"
              ></el-button>
            </div>
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
  display: flex;
  flex-direction: column;
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
        top: 35px;
      }

      .gender {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 190px;
        top: 120px;
        border-radius: 50%;
      }

      .nickname {
        position: absolute;
        top: 145px;
        width: 80%;
        height: 48px;
        font-size: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: #409eff;
        font-weight: bold;
        user-select: text;
        word-break: break-all;
      }
    }
  }

  .body {
    width: 100%;
    flex: 1;
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

      .value-mark {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }

      .edit {
        display: flex;
        justify-content: space-between;
      }
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
