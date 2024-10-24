<script setup>
import {
  ChatRound,
  Notebook,
  VideoCameraFilled,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { userStore, messageStore, searchStore } from '@/stores'
import router from '@/router'
import MyCard from '@/components/navigate/MyCard.vue'
import NaviMenu from '@/components/navigate/NaviMenu.vue'
import { userLogoutService } from '@/api/user'
import wsConnect from '@/js/websocket/wsConnect'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { ElMessageBox } from 'element-plus'
import AvatarIcon from '@/components/common/AvatarIcon.vue'

const myCardDialog = ref()
const myAvatar = ref()
const userData = userStore()
const messageData = messageStore()
const searchData = searchStore()

const userStatusDesc = computed(() => {
  switch (userData.user.status) {
    case 1:
      return '离开'
    case 2:
      return '在线'
    case 3:
      return '忙碌'
    case 0:
    default:
      return '离线'
  }
})

const statusCircleColor = computed(() => {
  switch (userData.user.status) {
    case 1:
      return 'yellow'
    case 2:
      return '#95d475'
    case 3:
      return 'red'
    case 0:
    default:
      return 'gray'
  }
})

let statusReqTask
onMounted(async () => {
  setTimeout(() => {
    wsConnect.createWs()
  }, 1500) // 延迟启动，防止token刷新碰撞
  document.addEventListener('click', clickListener)

  // 定时查询自己的状态（多端设备场景，比如其他设备正在忙碌，要同步过来）
  let accounts = []
  accounts.push(userData.user.account)
  statusReqTask = setInterval(() => {
    wsConnect.statusReq(JSON.stringify(accounts))
  }, 5000)
})

onUnmounted(() => {
  document.removeEventListener('click', clickListener)
  clearInterval(statusReqTask)
  timer && clearTimeout(timer)

  userData.clear()
  messageData.clear()
  searchData.clear()
  wsConnect.closeWs()
})

// 监听用户的离开事件：5分钟内未移动鼠标表示离开
let timer
const onListenLeave = () => {
  if (!document.hasFocus()) return

  if (userData.user.status === 1) {
    userData.updateUserStatus(2) //修改本地状态
    wsConnect.statusSync(2) //状态同步给云端
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (userData.user.status === 2) {
      userData.updateUserStatus(1) //修改本地状态
      wsConnect.statusSync(1) //状态同步给云端
    }
  }, 300000)
}

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
        userData.clear()
        messageData.clear()
        searchData.clear()
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
  <el-container class="layout-container" @contextmenu.prevent @mousemove="onListenLeave">
    <el-aside width="100px">
      <span class="avatar">
        <AvatarIcon
          ref="myAvatar"
          :showName="userData.user.nickName"
          :showId="userData.user.account"
          :showAvatarThumb="userData.user.avatarThumb"
          @click="openMyCardDialog"
        >
        </AvatarIcon>
        <div class="user-status">
          <div class="status-circle" :style="{ backgroundColor: statusCircleColor }"></div>
          <span class="status-desc">{{ userStatusDesc }}</span>
        </div>
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
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 30px;

      .el-avatar {
        width: 40px;
        height: 40px;
        cursor: pointer;
      }

      .user-status {
        display: flex;
        align-items: center;

        .status-circle {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid #fff;
        }

        .status-desc {
          padding-left: 2px;
          font-size: 14px;
        }
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
