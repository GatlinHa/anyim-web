<!-- eslint-disable prettier/prettier -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  Phone, 
  VideoCamera, 
  Position, 
  CirclePlus,
  Setting, 
  LocationInformation, 
  Clock, 
  Picture,
  FolderAdd,
  CreditCard,
  PictureRounded
} from '@element-plus/icons-vue'
import DragLine from '@/components/common/DragLine.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import AddBotton from '@/components/common/AddBotton.vue'
import SessionBox from '@/components/message/SessionBox.vue'
import InputTool from '@/components/message/InputTool.vue'
import InputEditor from '@/components/message/InputEditor.vue'
import MessageItem from '@/components/message/MessageItem.vue'
import { userStore, settingStore, messageStore } from '@/stores'
import backgroupImage from '@/assets/messagebx_bg.webp'
import { msgChatSessionListService } from '@/api/message'
import { msgType } from '@/const/msgConst'

const userData = userStore()
const settingData = settingStore()
const messageData = messageStore()

const asideWidth = ref(0)
const asideWidthMin = 200
const asideWidthMax = 500

const inputBoxHeight = ref(0)
const inputBoxHeightMin = 150
const inputBoxHeightMax = 400

const curSessionId = ref('')
const curSessionType = ref('')
const curObject = ref({})
const sessionList = ref([])

const isShowTopLoading = ref(false)
const isTopLoading = ref(false)
const loadMoreTips = ref('查看更多消息')
const loadCursor = computed(() => {
  return isTopLoading.value ? 'auto' : 'pointer'
})

onMounted(async () => {
  curSessionId.value = messageData.lastSessionId
  curSessionType.value = messageData.lastSessionType
  curObject.value = messageData.lastObject

  asideWidth.value = settingData.sessionListDrag[userData.user.account] || 200
  inputBoxHeight.value = settingData.inputBoxDrag[userData.user.account] || 200

  const res = await msgChatSessionListService()
  sessionList.value = sessionList.value.concat(res.data.data)
})

const showName = computed(() => {
  switch (curSessionType.value) {
    case 'chat':
      return curObject.value.nickName
    case 'groupchat':
      return curObject.value.groupName
    default:
      return ''
  }
})

const showId = computed(() => {
  switch (curSessionType.value) {
    case 'chat':
      return curObject.value.account
    case 'groupchat':
      return curObject.value.groupId
    default:
      return ''
  }
})

const onAsideDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag({
    ...settingData.sessionListDrag,
    [userData.user.account]: width
  })
}

const onInputBoxDragUpdate = ({ height }) => {
  inputBoxHeight.value = height
  settingData.setInputBoxDrag({
    ...settingData.inputBoxDrag,
    [userData.user.account]: height
  })
}

const handleExportData = (data) => {
  curSessionId.value = data.sessionId
  curSessionType.value = data.sessionType
  curObject.value = data.objectInfo

  messageData.setLastSessionId(data.sessionId)
  messageData.setLastSessionType(data.sessionType)
  messageData.setLastObject(data.objectInfo)
}

const onLoadMore = () => {
  isTopLoading.value = true
  loadMoreTips.value = ''
}

</script>

<template>
  <el-container class="msg-container-hole">
    <el-aside class="msg-aside bdr-r" :style="{ width: asideWidth + 'px' }">
      <div class="msg-aside-main">
        <div class="header">
          <SearchBox></SearchBox>
          <AddBotton></AddBotton>
        </div>

        <div class="session-list">
          <SessionBox
            v-for="item in sessionList"
            :key="item.sessionId"
            :objectInfo="item.objectInfo"
            :sessionId="item.sessionId"
            :sessionType="item.sessionType"
            @exportData="handleExportData"
          ></SessionBox>
        </div>
      </div>

      <DragLine
        direction="right"
        :min="asideWidthMin"
        :max="asideWidthMax"
        :origin-size="asideWidth"
        @drag-update="onAsideDragUpdate"
      ></DragLine>
    </el-aside>

    <el-main class="msg-box">
      <el-image
        class="backgroup-image"
        v-if="!curSessionId"
        :src="backgroupImage"
        fit="cover"
      ></el-image>

      <el-container v-else class="container">
        <el-header class="header bdr-b">
          <div class="show-name-id">
            <span class="show-name">{{ showName }}</span>
            <span v-if="curSessionType === 'chat'" class="show-id">{{ showId }}</span>
          </div>

          <div class="action-set">
            <el-button class="action-button" :icon="Phone" circle />
            <el-button class="action-button" :icon="VideoCamera" circle />
            <el-button class="action-button" :icon="Position" circle />
            <el-button class="action-button" :icon="CirclePlus" circle />
            <el-button class="action-button" :icon="Setting" circle />
          </div>
        </el-header>
        <el-main class="body">
          <div class="show-box">
            <div v-if="isShowTopLoading" class="top-loading">
              <div
                v-loading="isTopLoading"
                :fullscreen="false"
                class="loading-box"
                @click="onLoadMore"
                :style="{ cursor: loadCursor }"
              >
                {{ loadMoreTips }}
              </div>
            </div>
            <div class="message-main">
              <MessageItem :type="msgType.NO_MORE_MSG"></MessageItem>
              <MessageItem :type="msgType.USER_MSG" :objectInfo="curObject"></MessageItem>
              <MessageItem></MessageItem>
            </div>
          </div>
          <div class="input-box bdr-t" :style="{ height: inputBoxHeight + 'px' }">
            <el-container class="input-box-container">
              <el-header class="input-box-header">
                <DragLine
                  direction="top"
                  :min="inputBoxHeightMin"
                  :max="inputBoxHeightMax"
                  :origin-size="inputBoxHeight"
                  @drag-update="onInputBoxDragUpdate"
                ></DragLine>
                <div class="tool-set">
                  <div class="left-tools">
                    <InputTool tips="表情">
                      <template #iconSlot>
                        <PictureRounded />
                      </template>
                    </InputTool>
                    <InputTool tips="图片">
                      <template #iconSlot>
                        <Picture />
                      </template>
                    </InputTool>
                    <InputTool tips="文件">
                      <template #iconSlot>
                        <FolderAdd />
                      </template>
                    </InputTool>
                    <InputTool tips="代码">
                      <template #iconSlot>
                        <CreditCard />
                      </template>
                    </InputTool>
                    <InputTool tips="位置">
                      <template #iconSlot>
                        <LocationInformation />
                      </template>
                    </InputTool>
                  </div>
                  <div class="right-tools">
                    <InputTool tips="历史记录">
                      <template #iconSlot>
                        <Clock />
                      </template>
                    </InputTool>
                  </div>
                </div>
              </el-header>
              <el-main class="input-box-main">
                <InputEditor></InputEditor>
              </el-main>
            </el-container>
          </div>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.msg-container-hole {
  height: 100%;
  user-select: none;

  .msg-aside {
    height: 100%;
    position: relative;

    .msg-aside-main {
      width: 100%;
      height: 100%;
      display: flex; // 需要flex布局，否则session-list的滚动条会有问题
      flex-direction: column;
      overflow: hidden; // 禁用它的滚动条

      .header {
        margin-top: 10px;
        margin-bottom: 10px;
        display: flex;
      }

      .session-list {
        width: 100%;
        overflow-y: scroll; // 用它的滚动条
      }
    }
  }

  .msg-box {
    padding: 0;
    overflow: hidden; // 禁用它的滚动条

    .backgroup-image {
      width: 100%;
      height: 100%;
    }

    .container {
      width: 100%;
      height: 100%;

      .header {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .show-name-id {
          display: flex;
          align-items: center;
          user-select: text;

          .show-name {
            font-size: 16px;
            font-weight: bold;
          }

          .show-id {
            margin-left: 10px;
            font-size: 14px;
            color: gray;
          }
        }

        .action-set {
          margin-right: 20px;

          .action-button {
            border: 0;
          }
        }
      }

      .body {
        width: 100%;
        height: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;

        .show-box {
          width: 100%;
          display: flex;
          flex: 1;
          position: relative;

          .top-loading {
            width: 100%;
            height: 30px;
            position: absolute;
            top: 0;
            display: flex;
            justify-content: center;
            align-items: center;

            .loading-box {
              color: #409eff;
              font-size: 14px;
            }
          }

          :deep(.circular) {
            width: 24px;
            height: 24px;
            position: absolute;
            top: 12px;
            left: -12px;
          }

          .message-main {
            width: 100%;
            height: 100%;
            padding: 15px;
          }
        }

        .input-box {
          width: 100%;
          display: flex;
          position: relative;

          .input-box-header {
            width: 100%;
            height: auto;
            padding: 0;
            display: flex;
            flex-direction: column;

            .tool-set {
              display: flex;
              justify-content: space-between;

              .left-tools {
                display: flex;
              }

              .right-tools {
                margin-right: 10px;
              }
            }
          }

          .input-box-main {
            width: 100%;
            padding: 0;
          }
        }
      }
    }
  }
}
</style>
