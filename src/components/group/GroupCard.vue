<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps(['isShow', 'group'])
const emit = defineEmits(['update:isShow'])

// const isLoading = ref(false)
const groupCardRef = ref()

const preventClose = (event) => {
  event.stopPropagation()
}

const closeCardIfOutside = (event) => {
  if (
    !event.target.closest('.group-card') &&
    !event.target.closest('.avatar-box') &&
    props.isShow
  ) {
    emit('update:isShow', false)
  }
}

const handleEscEvent = (event) => {
  if (event.key === 'Escape') {
    emit('update:isShow', false)
  }
}

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
  <div ref="groupCardRef">
    <transition name="fade">
      <div v-if="isShow" class="overlay"></div>
    </transition>
    <transition name="fade">
      <div class="group-card" v-if="isShow" @click.self="preventClose($event)">
        <div class="header">
          <el-icon class="close-button" @click="onClose"><Close /></el-icon>
          <div class="main">我是群组的信息卡片，待完善</div>
        </div>

        <div class="body"></div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.group-card {
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
    }
  }

  .body {
    width: 100%;
    height: 300px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
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
