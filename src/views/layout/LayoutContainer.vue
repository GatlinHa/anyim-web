<script setup>
import {
  ChatRound,
  Notebook,
  VideoCameraFilled,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref } from 'vue'
import avatar from '@/assets/default_avatar.png'
import { userStore } from '@/stores'
import router from '@/router'
import MyCard from '@/components/navigate/MyCard.vue'

const myCardDialog = ref()
const myAvatar = ref()
const userData = userStore()

onMounted(() => {
  userData.getUser()
  document.addEventListener('click', clickListener)
})

onUnmounted(() => {
  document.removeEventListener('click', clickListener)
})

const clickListener = (e) => {
  // 鼠标点击不在头像或卡片范围内，则关闭卡片
  if (!myCardDialog.value?.$el.contains(e.target) && !myAvatar.value?.$el.contains(e.target)) {
    myCardDialog.value.close()
  }
}

const openMyCardDialog = () => {
  myCardDialog.value.open()
}

const onExit = async () => {
  await ElMessageBox.confirm('你确认要退出吗？', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
  userData.clearAt()
  userData.clearRt()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="100px">
      <span class="avatar">
        <el-avatar
          ref="myAvatar"
          :src="userData.user.avatarThumb || avatar"
          @click="openMyCardDialog"
        />
      </span>

      <el-menu
        active-text-color="#ecf5ff"
        background-color="#409eff"
        :default-active="$route.path"
        text-color="#fff"
        router
      >
        <navi-menu funcName="消息" index="/message">
          <template #iconSlot>
            <ChatRound />
          </template>
        </navi-menu>
        <navi-menu funcName="通讯录" index="/contacts">
          <template #iconSlot>
            <Notebook />
          </template>
        </navi-menu>
        <navi-menu funcName="会议" index="/meeting">
          <template #iconSlot>
            <VideoCameraFilled />
          </template>
        </navi-menu>
        <navi-menu funcName="设置" index="/setting">
          <template #iconSlot>
            <Setting />
          </template>
        </navi-menu>
      </el-menu>

      <div class="exit-button" @click="onExit()" title="退出">
        <el-icon :size="20"><SwitchButton /></el-icon>
      </div>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
    <my-card ref="myCardDialog"></my-card>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  .el-aside {
    background-color: #409eff;
    .el-menu {
      border-right: none;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .exit-button {
      position: absolute;
      bottom: 30px;
      left: 30px;
      width: 40px;
      height: 40px;
      border-radius: 16px;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
}

.avatar {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 30px;
  cursor: pointer;
}

.el-menu-item {
  margin-top: 20px;
}
</style>
