<!-- eslint-disable prettier/prettier -->
<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
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
import { msgChatSessionListService, msgChatPullMsgService } from '@/api/message'
import { MsgType } from '@/proto/msg'
import wsConnect from '@/js/websocket/wsConnect'

const userData = userStore()
const settingData = settingStore()
const messageData = messageStore()

const asideWidth = ref(0)
const asideWidthMin = 200
const asideWidthMax = 500

const inputBoxHeight = ref(0)
const inputBoxHeightMin = 200
const inputBoxHeightMax = 500

const msgListDiv = ref()

const hasNoMoreMsg = ref(false)
const isLoadMoreLoading = ref(true)

const capacity = ref(15) //TODO 现在是调试值
const step = 15 //TODO 现在是调试值
const startIndex = computed(() => {
  if (userData.curSessionId) {
    const len = messageData.msgRecordsList[userData.curSessionId]?.length
    return len > capacity.value ? len - capacity.value : 0
  }
  else {
     return 0
  }
})

const reset = () => {
  capacity.value = 15
  msgListReachBottom(false) //复位时msgList要触底
  hasNoMoreMsg.value = false
}

const msgRecords = computed(() => {
  return userData.curSessionId ? messageData.msgRecordsList[userData.curSessionId]?.slice(startIndex.value) : []
})

const choosedSession = computed(() => {
  return userData.curSessionId ? messageData.sessionList[userData.curSessionId] : {}
})

onMounted(async () => {
  asideWidth.value = settingData.sessionListDrag[userData.user.account] || 300
  inputBoxHeight.value = settingData.inputBoxDrag[userData.user.account] || 300

  const res = await msgChatSessionListService()
  messageData.setSessionList(res.data.data) //入缓存
  
  if (userData.curSessionId) pullMsg()  //页面加载进来,如果缓存了sessionId,则要加载对话
})

const handleMsgListScroll = async () => {
  if (msgListDiv.value.scrollTop === 0) {
    const scrollHeight = msgListDiv.value.scrollHeight
    if (messageData.msgRecordsList[userData.curSessionId]?.length === capacity.value) {
      await pullMsg(1, msgRecords.value[0].msgId)
    }

    const len = messageData.msgRecordsList[userData.curSessionId]?.length
    if (len > capacity.value) {
      if (len - capacity.value > step) {
        capacity.value += step
      }
      else {
        capacity.value = len
      }
    }

    // 保持页面对话的锚定位置
    nextTick(() => {
      msgListDiv.value.scrollTop = msgListDiv.value.scrollHeight - scrollHeight
    });
  }
}

// 把sessionList转成数组，并按照lastMsgTime排序
const sessionListSorted = computed(() => {
  if (!messageData.sessionList) {
    return []
  }
  else {
    let sessionArr = Object.values(messageData.sessionList)
    return sessionArr.sort((a, b) => b.lastMsgTime - a.lastMsgTime)
  }
})

const showName = computed(() => {
  switch (choosedSession.value?.sessionType) {
    case MsgType.CHAT:
      return choosedSession.value.objectInfo.nickName
    case MsgType.GROUP_CHAT:
      return choosedSession.value.objectInfo.groupName
    default:
      return ''
  }
})

const showId = computed(() => {
  switch (choosedSession.value?.sessionType) {
    case MsgType.CHAT:
      return choosedSession.value.objectInfo.account
    case MsgType.GROUP_CHAT:
      return choosedSession.value.objectInfo.groupId
    default:
      return ''
  }
})

const firstMsgId = computed(() => {
  return messageData.msgRecordsList[userData.curSessionId][0].msgId
})

const getLastMsgTime = (index) => {
  if (index > 0) {
    return msgRecords.value[index - 1].msgTime;
  } else {
    return null;
  }
}

const onAsideDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag({
    ...settingData.sessionListDrag,
    [userData.user.account]: width
  })
}

const onInputBoxDragUpdate = ({ height }) => {
  inputBoxHeight.value = height
  msgListReachBottom()
  settingData.setInputBoxDrag({
    ...settingData.inputBoxDrag,
    [userData.user.account]: height
  })
}

const pullMsg = async (mode = 0, ref = -1) => {
  if (hasNoMoreMsg.value) {
    return
  }

  const params = {
    sessionId: userData.curSessionId, 
    pageSize: 30, 
    mode: mode, 
    refMsgId: ref
  }

  if (mode === 1) isLoadMoreLoading.value = true // mode=1才需要显示"加载更多中..."
  const res = await msgChatPullMsgService(params)
  const msgCount = res.data.data.count
  if (msgCount > 0) {
    messageData.addMsgRecords(userData.curSessionId, res.data.data.msgList)
    messageData.updateSession({
      sessionId: userData.curSessionId, 
      lastMsgId: res.data.data.lastMsgId,
      lastMsgContent: res.data.data.msgList[msgCount - 1].content, 
      lastMsgTime: res.data.data.msgList[msgCount - 1].msgTime
    })
    if (mode === 0) msgListReachBottom()
  }
  else {
    if (mode === 1) {
      hasNoMoreMsg.value = true
    }
  }
  if (mode === 1) isLoadMoreLoading.value = false
}

// 表示有个session被选中了
const handleIsChoosed = (exportSession) => {
  if (userData.curSessionId !== exportSession.sessionId) {
    userData.setCurSessionId(exportSession.sessionId)
    reset()
  }
  else {
    // TODO 这个是为了临时消除接收端当前session下出现的未读图标,后面要通过""已读消息"来消除的
    messageData.updateSession({
        sessionId: userData.curSessionId, 
        unreadCount: 0
      })
  }

  // 如果切换到的session,在之前都没有pull过消息,则需要pull一次(mode=0方式),且lastMsgId有值才pull
  if (!msgRecords.value && choosedSession.value.lastMsgId) {
    pullMsg()
  }
}

const handleSwitchTag = (obj) => {
  messageData.updateSession(obj)
}

const handleSendMessage = (content) => {
  // TODO 这里还要考虑失败情况：1）消息发不出去；2）消息发出去了，服务器不发“已发送”
  wsConnect.sendMsg(showId.value, choosedSession.value.sessionType, content, (deliveredMsg) => {

    const now = new Date()
    messageData.updateSession({
      sessionId: userData.curSessionId,
      lastMsgId: deliveredMsg.body.msgId,  // 最后一条消息（自己发的）
      lastMsgContent: content,
      lastMsgTime: now,
      unreadCount: 0,  // 最后一条消息（自己发的），因此未读是0
      draft: ''  //草稿意味着要清空
    })

    messageData.addMsgRecords(userData.curSessionId, [{
      sessionId: userData.curSessionId,
      msgId: deliveredMsg.body.msgId,  
      fromId: userData.user.account,
      msgType: choosedSession.value.sessionType,
      content: content,
      msgTime: now
    }])

    msgListReachBottom(false) // 发送消息之后,msgList要触底
  })
}

const onLoadMore = async () => {
  const scrollHeight = msgListDiv.value.scrollHeight
  const scrollTop = msgListDiv.value.scrollTop
  await pullMsg(1, msgRecords.value[0].msgId)
  const len = messageData.msgRecordsList[userData.curSessionId]?.length
  if (len > capacity.value) {
    if (len - capacity.value > step) {
      capacity.value += step
    }
    else {
      capacity.value = len
    }
  }

  // 保持页面对话的锚定位置
  nextTick(() => {
    msgListDiv.value.scrollTop = msgListDiv.value.scrollHeight - scrollHeight + scrollTop
  });
}

watch(msgRecords, () => { 
  // nextTick(() => {
  //   console.log('======>2.scrollTopBefore: ', scrollTopBefore);
  //   // msgListDiv.value.scrollTop = scrollTopBefore
  //   console.log('======>3.scrollTop: ', msgListDiv.value.scrollTop);
  // })
}, {deep: true})

const msgListReachBottom = (isSmooth = true) => {
  const behavior = isSmooth ? 'smooth' : 'instant'
  nextTick(() => {
    msgListDiv.value.scrollTo({
      top: msgListDiv.value.scrollHeight,
      behavior: behavior  // 还有一种是instant,没有动画过渡效果
    })
  })
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

        <div class="session-list my-scrollbar">
          <SessionBox
            v-for="item in sessionListSorted"
            :key="item.sessionId"
            :sessionId="item.sessionId"
            @isChoosed="handleIsChoosed"
            @switchTag="handleSwitchTag"
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
        v-if="!userData.curSessionId"
        :src="backgroupImage"
        fit="cover"
      ></el-image>

      <el-container v-else class="container">
        <el-header class="header bdr-b">
          <div class="show-name-id">
            <span class="show-name">{{ showName }}</span>
            <span v-if="choosedSession?.sessionType === MsgType.CHAT" class="show-id">{{
              showId
            }}</span>
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
          <div class="show-box my-scrollbar" ref="msgListDiv" @scroll="handleMsgListScroll">
            <div class="message-main">
              <MessageItem
                v-for="(item, index) in msgRecords"
                :key="index"
                :msg="item"
                :obj="choosedSession?.objectInfo"
                :lastMsgTime="getLastMsgTime(index)"
                :firstMsgId="firstMsgId"
                :hasNoMoreMsg="hasNoMoreMsg"
                :isLoadMoreLoading="isLoadMoreLoading"
                @loadMore="onLoadMore"
              ></MessageItem>
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
                <InputEditor
                  :draft="choosedSession?.draft"
                  @sendMessage="handleSendMessage"
                ></InputEditor>
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
        overflow: hidden; // 禁用它的滚动条
        position: relative;

        .show-box {
          width: 100%;
          display: flex;
          flex: 1;
          overflow-y: scroll; // 用它的滚动条

          .message-main {
            width: 100%;
            height: 100%;
            padding: 20px;
            padding-right: 15px;
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
