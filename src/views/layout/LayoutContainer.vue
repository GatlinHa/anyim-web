<script setup>
import {
  ChatRound,
  Notebook,
  VideoCameraFilled,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { userStore } from '@/stores'
import router from '@/router'
import MyCard from '@/components/navigate/MyCard.vue'
import NaviMenu from '@/components/navigate/NaviMenu.vue'
import { userLogoutService } from '@/api/user'
import wsConnect from '@/js/websocket/wsConnect'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { ElMessageBox } from 'element-plus'
import AvatarIcon from '@/components/message/AvatarIcon.vue'

const myCardDialog = ref()
const myAvatar = ref()
const userData = userStore()

onMounted(async () => {
  setTimeout(() => {
    wsConnect.createWs()
  }, 1500) // 延迟启动，防止token刷新碰撞
  document.addEventListener('click', clickListener)
})

onUnmounted(() => {
  document.removeEventListener('click', clickListener)
})

const clickListener = (e) => {
  if (!myCardDialog.value.isOpen()) return

  // 鼠标点击不在头像或卡片范围内，则关闭卡片
  if (!myCardDialog.value?.$el.contains(e.target) && !myAvatar.value?.$el.contains(e.target)) {
    myCardDialog.value.close()
  }
}

const openMyCardDialog = () => {
  if (!myCardDialog.value.isOpen()) {
    const loadingInstance = ElLoading.service(el_loading_options)
    userData
      .updateUser()
      .then(() => {
        myCardDialog.value.open()
      })
      .finally(() => {
        loadingInstance.close()
      })
  }
}

const onExit = async () => {
  ElMessageBox.confirm('你确认要退出吗？', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    .then(() => {
      userLogoutService(userData.user.account).finally(() => {
        userData.clearAt()
        userData.clearRt()
        userData.setUser({ account: userData.user.account })
        wsConnect.closeWs()
        router.push('/login')
      })
    })
    .catch(() => {
      // do nothing
    })
}
</script>

<template>
  <el-container class="layout-container" @contextmenu.prevent>
    <el-aside width="100px">
      <span class="avatar">
        <AvatarIcon
          ref="myAvatar"
          :showName="userData.user.nickName"
          :showId="userData.user.account"
          :showAvatarThumb="userData.user.avatarThumb"
          :userStatus="userData.user.status"
          @click="openMyCardDialog"
        >
        </AvatarIcon>
      </span>

      <el-menu
        active-text-color="#ecf5ff"
        background-color="#409eff"
        :default-active="$route.meta.active || $route.path"
        text-color="#fff"
        router
      >
        <NaviMenu funcName="消息" index="/message">
          <template #iconSlot>
            <ChatRound />
          </template>
        </NaviMenu>
        <NaviMenu funcName="通讯录" index="/contacts">
          <template #iconSlot>
            <Notebook />
          </template>
        </NaviMenu>
        <NaviMenu funcName="会议" index="/meeting">
          <template #iconSlot>
            <VideoCameraFilled />
          </template>
        </NaviMenu>
        <NaviMenu funcName="设置" index="/setting">
          <template #iconSlot>
            <Setting />
          </template>
        </NaviMenu>
      </el-menu>

      <div class="exit-button" @click="onExit()" title="退出">
        <el-icon :size="20"><SwitchButton /></el-icon>
      </div>
    </el-aside>
    <el-main style="padding: 0">
      <router-view></router-view>
    </el-main>
    <MyCard ref="myCardDialog"></MyCard>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  user-select: none;

  .el-aside {
    background-color: #409eff;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;

    .avatar {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 30px;
      cursor: pointer;
      .el-avatar {
        width: 40px;
        height: 40px;
      }
    }

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

  .el-main {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
}
</style>
