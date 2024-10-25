<!-- eslint-disable prettier/prettier -->
<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
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
  PictureRounded,
  ArrowDownBold,
  ArrowUp
} from '@element-plus/icons-vue'
import DragLine from '@/components/common/DragLine.vue'
import SearchBox from '@/components/search/SearchBox.vue'
import AddBotton from '@/components/common/AddBotton.vue'
import SessionBox from '@/components/message/SessionBox.vue'
import InputTool from '@/components/message/InputTool.vue'
import InputEditor from '@/components/message/InputEditor.vue'
import MessageItem from '@/components/message/MessageItem.vue'
import UserCard from '@/components/user/UserCard.vue'
import GroupCard from '@/components/group/GroupCard.vue'
import { userStore, settingStore, messageStore } from '@/stores'
import backgroupImage from '@/assets/messagebx_bg.webp'
import { msgChatSessionListService, msgChatPullMsgService, msgChatCreateSessionService } from '@/api/message'
import { MsgType } from '@/proto/msg'
import wsConnect from '@/js/websocket/wsConnect'
import { onReceiveChatMsg, onReceiveChatReadMsg } from '@/js/event'
import { userQueryService } from '@/api/user'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { combineId, sessionIdConvert } from '@/js/utils/common'
import ContextMenu from '@/components/common/ContextMenu.vue'
import router from '@/router'

const userData = userStore()
const settingData = settingStore()
const messageData = messageStore()
const selectedSessionId = ref('') //当前被选中的session
const sessionListRef = ref()
const showMenuSessionId = ref('') //当前被点击右键的sessionId（它可以不是选中的）
const showMenu = ref([]) //传递给菜单组件的菜单选项
const selectedMenuItem = ref('') //菜单组件反馈用户点击的某个菜单项

const asideWidth = ref(0)
const asideWidthMin = 200
const asideWidthMax = 500

const inputBoxHeight = ref(0)
const inputBoxHeightMin = 200
const inputBoxHeightMax = 500

const msgListDiv = ref()
const newMsgTips = ref({
  isShowTopTips: false,
  isShowBottomTips: false,
  unreadCount: 0,
  firstElement: null
})

const lastReadMsgId = ref()
const hasNoMoreMsg = ref(false)
const isLoadMoreLoading = ref(false)
const isLoading = ref(false)
const isShowReturnBottom = ref(false)

const capacity = ref(15) //TODO 现在是调试值
const step = 15 //TODO 现在是调试值
const startIndex = computed(() => {
  if (selectedSessionId.value) {
    const len = messageData.msgRecordsList[selectedSessionId.value]?.length
    return len > capacity.value ? len - capacity.value : 0
  }
  else {
     return 0
  }
})

const reset = () => {
  capacity.value = 15
  msgListReachBottom(false)
  hasNoMoreMsg.value = false
  isLoadMoreLoading.value = false
  isLoading.value = false
  isShowReturnBottom.value = false
}

const locateSession = (sessionId) => {
  nextTick(() => {
    const selectedElement = document.querySelector(`#session-box-${sessionIdConvert(sessionId)}`)
    // 如果被选中元素的上边在scrollTop之的上面，或这在下边在scrollTop+clientHeight的下面（显示不全或者完全没有显示），则需要重新定位
    // 由于offsetTop和offsetHeight不包含外边距，因此定位存在细小误差，暂不处理
    if (selectedElement.offsetTop - selectedElement.offsetHeight < sessionListRef.value.scrollTop) {
      sessionListRef.value.scrollTop = selectedElement.offsetTop - selectedElement.offsetHeight
    }
    else if (selectedElement.offsetTop > sessionListRef.value.scrollTop + sessionListRef.value.clientHeight) {
      sessionListRef.value.scrollTop = selectedElement.offsetTop - sessionListRef.value.clientHeight
    }
  })
}

const msgRecords = computed(() => {
  return messageData.msgRecordsList[selectedSessionId.value]?.slice(startIndex.value)
})

const selectedSession = computed(() => {
  return messageData.sessionList[selectedSessionId.value]
})

onMounted(async () => {
  asideWidth.value = settingData.sessionListDrag[userData.user.account] || 300
  inputBoxHeight.value = settingData.inputBoxDrag[userData.user.account] || 300

  // 如果有缓存了，就不查
  if (!Object.keys(messageData.sessionList).length) {
    const res = await msgChatSessionListService()
    messageData.setSessionList(res.data.data) //入缓存
  }

  wsConnect.bindEvent(MsgType.CHAT, onReceiveChatMsg(msgListDiv, capacity)) //绑定接收Chat消息的事件
  wsConnect.bindEvent(MsgType.CHAT_READ, onReceiveChatReadMsg()) //绑定接收Chat已读消息的事件

    // 定时更新单聊对象的状态
  const accounts = []
  Object.keys(messageData.sessionList).forEach(key => {
    const session = messageData.sessionList[key]
    const sessionType = session.sessionType
    if (sessionType === MsgType.CHAT) { //只看单聊的，群里在打开聊天窗时触发查询
      accounts.push(session.objectInfo.account)
    }
  })
  
  setInterval(() => {
    wsConnect.statusReq(JSON.stringify(accounts))
  }, 5000)

  // 这里要接收从其他页面跳转过来传递的sessionId参数
  if (router.currentRoute.value.query.sessionId) {
    handleSelecteSession(router.currentRoute.value.query.sessionId);
  }
})

const handleMsgListWheel = async () => {
  if (msgListDiv.value.scrollTop === 0 && !isLoadMoreLoading.value && !hasNoMoreMsg.value) {
    const scrollHeight = msgListDiv.value.scrollHeight
    if (messageData.msgRecordsList[selectedSessionId.value]?.length <= capacity.value) {
      await pullMsg(1, msgRecords.value[0].msgId)
    }

    const len = messageData.msgRecordsList[selectedSessionId.value]?.length
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

  //控制是否显示"回到底部"的按钮
  const clientHeight = document.querySelector('.message-main').clientHeight
  const diffToBottom = msgListDiv.value.scrollHeight - msgListDiv.value.scrollTop - clientHeight
  newMsgTips.value.isShowBottomTips = diffToBottom < 50 ? false : newMsgTips.value.isShowBottomTips
  // isShowReturnBottom.value = diffToBottom > 300  // 暂时取消这个提示功能，与消息提示的按钮显得有点重复

  if (newMsgTips.value.firstElement?.getBoundingClientRect().top > 0) {
    newMsgTips.value.isShowTopTips = false
  }
}

// 把sessionList转成数组，并按照lastMsgTime排序
const sessionListSorted = computed(() => {
  if (!Object.keys(messageData.sessionList)) {
    return []
  }
  else {
    let sessionArr = Object.values(messageData.sessionList)
    return sessionArr.sort((a, b) => {
      if (a.top && !b.top) { // 排序第一优先级：是否置顶
        return -1
      }
      else if (!a.top && b.top) {
        return 1
      }
      else {
        if (a.draft && !b.draft) { // 排序第二优先级：是否有草稿
          return -1
        }
        else if (!a.draft && b.draft) {
          return 1
        }
        else {
          // 排序第三优先级：最后一条消息的时间
          const bTime = new Date(b.lastMsgTime).getTime()
          const aTIme = new Date(a.lastMsgTime).getTime()
          if (bTime !== aTIme) {
            return bTime - aTIme
          }
          else {
            // 排序第四优先级：昵称字典序
            return a.objectInfo.nickName > b.objectInfo.nickName ? 1 : -1
          }
        }
      }
    })
  }
})

const showName = computed(() => {
  const mark = selectedSession.value.mark
  switch (selectedSession.value.sessionType) {
    case MsgType.CHAT:
      return mark ? `${mark}(${selectedSession.value.objectInfo.nickName})` : selectedSession.value.objectInfo.nickName
    case MsgType.GROUP_CHAT:
      return mark ? `${mark}(${selectedSession.value.objectInfo.groupName})` : selectedSession.value.objectInfo.groupName
    default:
      return ''
  }
})

const showId = computed(() => {
  switch (selectedSession.value.sessionType) {
    case MsgType.CHAT:
      return selectedSession.value.objectInfo.account
    case MsgType.GROUP_CHAT:
      return selectedSession.value.objectInfo.groupId
    default:
      return ''
  }
})

const firstMsgId = computed(() => {
  return messageData.msgRecordsList[selectedSessionId.value][0].msgId
})

const getLastMsgTime = (index) => {
  if (index > 0) {
    return msgRecords.value[index - 1].msgTime;
  } else {
    return null;
  }
}

/**
 * 判断是否是打开session后的第一条未读消息
 * @param index 
 */
const isFirstNew = (index) => {
  if (index > 0 
    && msgRecords.value[index - 1].msgId == lastReadMsgId.value) {
    return true
  }
  return false;
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

/**
 * 通过REST接口主动拉取消息
 * @param mode 0:拉取最近N条;1:按refMsgId向上拉取N条(上滑加载更多消息)
 * @param ref mode=1时要携带,标记更新的msgId位置
 */
const pullMsg = async (mode = 0, ref = -1) => {
  if (hasNoMoreMsg.value) {
    return
  }

  const pageSize = 30;
  const params = {
    sessionId: selectedSessionId.value, 
    pageSize: pageSize, 
    mode: mode, 
    refMsgId: ref
  }

  if (mode === 0) isLoading.value = true // mode=0才需要显示"数据加载中..."
  if (mode === 1) isLoadMoreLoading.value = true // mode=1才需要显示"加载更多中..."
  const res = await msgChatPullMsgService(params)
  const msgCount = res.data.data.count
  if (msgCount > 0) {
    messageData.addMsgRecords(selectedSessionId.value, res.data.data.msgList)
    if (mode === 0) {
      messageData.updateSession({
        sessionId: selectedSessionId.value, 
        lastMsgId: res.data.data.lastMsgId,
        lastMsgContent: res.data.data.msgList[msgCount - 1].content, 
        lastMsgTime: res.data.data.msgList[msgCount - 1].msgTime
      })
    }
  }

  if (msgCount < pageSize) {
    hasNoMoreMsg.value = true
  }

  if (mode === 0) isLoading.value = false
  if (mode === 1) isLoadMoreLoading.value = false
}

// 表示有个session被选中了
const handleSelecteSession = async (sessionId) => {
  if (selectedSessionId.value !== sessionId) {
    selectedSessionId.value = sessionId
    reset()
    locateSession(sessionId)
    
    // 如果切换到的session在之前都没有pull过消息,则需要pull一次(mode=0),且lastMsgId有值才pull
    if (!msgRecords.value && selectedSession.value.lastMsgId) {
      await pullMsg()
      msgListReachBottom()
    }
    lastReadMsgId.value = selectedSession.value.readMsgId //保存这个readMsgId,要留给MessageItem用
    handleRead()
  }
}

const handleRead = () => {
  if (selectedSessionId.value && selectedSession.value.readMsgId < selectedSession.value.lastMsgId) {
    const content = selectedSession.value.lastMsgId.toString()
    wsConnect.sendMsg(showId.value, MsgType.CHAT_READ, content + '', () => {})
    // 更新本地缓存的已读位置
    messageData.updateSession({
      sessionId: selectedSessionId.value, 
      readMsgId: content,
      readTime: new Date(),
      unreadCount: 0
    })
  }
}

const handleSwitchTag = (obj) => {
  messageData.updateSession(obj)
}

const handleSendMessage = (content) => {
  // TODO 这里还要考虑失败情况：1）消息发不出去；2）消息发出去了，服务器不发“已发送”
  wsConnect.sendMsg(showId.value, selectedSession.value.sessionType, content, (msgId) => {
    const now = new Date()
    messageData.updateSession({
      sessionId: selectedSessionId.value,
      lastMsgId: msgId,  // 最后一条消息（自己发的）
      lastMsgContent: content,
      lastMsgTime: now,
      readMsgId: msgId, // 最后一条消息是自己发的，因此已读更新到最大（刚发的这条消息的msgId）
      readTime: now,
      unreadCount: 0,  // 最后一条消息是自己发的，因此未读是0
      draft: ''  //草稿意味着要清空
    })
    
    messageData.addMsgRecords(selectedSessionId.value, [{
      sessionId: selectedSessionId.value,
      msgId: msgId,  
      fromId: userData.user.account,
      msgType: selectedSession.value.sessionType,
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
  const len = messageData.msgRecordsList[selectedSessionId.value]?.length
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

const msgListReachBottom = (isSmooth = true) => {
  const behavior = isSmooth ? 'smooth' : 'instant'
  nextTick(() => {
    msgListDiv.value?.scrollTo({
      top: msgListDiv.value.scrollHeight,
      behavior: behavior
    })
  })
  newMsgTips.value.isShowBottomTips = false
}

const onReturnBottom = () => {
  msgListReachBottom()
}

const onReachFirtUnReadMsg = () => {
  const msgListRect = msgListDiv.value.getBoundingClientRect();
  const firstElRect = newMsgTips.value.firstElement.getBoundingClientRect()
  nextTick(() => {
    msgListDiv.value.scrollTop = msgListDiv.value.scrollTop - (msgListRect.top - firstElRect.top)
  });
  newMsgTips.value.isShowTopTips = false
}

const onClickMsgContainer = () => {
  handleRead()
}

const isShowUserCard = ref(false)
const userInfo = ref()

const isShowGroupCard = ref(false)
const groupInfo = ref()

const onShowUserCard = async ({ sessionId, account }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  if (userData.user.account === account) {
    await userData.updateUser()
    userInfo.value = userData.user
  }
  else {
    const res = await userQueryService({ account: account })
    messageData.updateSession({
      sessionId: sessionId,
      objectInfo: {
        ...messageData.sessionList[sessionId].objectInfo,
        nickName: res.data.data.nickName,
        signature: res.data.data.signature,
        avatarThumb: res.data.data.avatarThumb,
        gender: res.data.data.gender,
        phoneNum: res.data.data.phoneNum,
        email: res.data.data.email
      }
    })
    userInfo.value = messageData.sessionList[sessionId].objectInfo
    userInfo.value['mark'] = messageData.sessionList[sessionId].mark
  }
  loadingInstance.close()
  isShowGroupCard.value = false
  isShowUserCard.value = true
}

const onUpdateMark = async (obj) => {
  const sessionId = combineId(userData.user.account, obj.account)
  messageData.updateSession({
    sessionId: sessionId,
    mark: obj.mark
  })
  userInfo.value['mark'] = obj.mark
}

// TODO
const onShowGroupCard = () => {
  isShowUserCard.value = false
  isShowGroupCard.value = true
  groupInfo.value = {} 
}

const onShowContactCard = (contactInfo) => {
  userInfo.value = contactInfo
  isShowGroupCard.value = false
  isShowUserCard.value = true
}

const onOpenSession = async ({ msgType, objectInfo }) => {
  if (userData.user.account === objectInfo.account) {
    console.log('暂不支持自己给自己发消息'); //TODO
    return
  }
  const sessionId = combineId(userData.user.account, objectInfo.account)
  if (messageData.sessionList[sessionId]) {
    handleSelecteSession(sessionId)
  }
  else {
    const res = await msgChatCreateSessionService({
        sessionId: sessionId,
        account: userData.user.account,
        remoteId: objectInfo.account,
        sessionType: msgType
      })
    messageData.addSession(res.data.data)
    handleSelecteSession(sessionId)
  }
}

/**
 * 监视msgRecords的数据变化,给出新消息的tips提示
 */
watch(() => msgRecords.value, (oldValue) => {
  if (!oldValue || selectedSession.value.unreadCount === 0) return
  nextTick(() => {
    const unreadMsgEls = document.querySelectorAll('.unreadMsg');
    if (unreadMsgEls.length === 0) return
    const msgListRect = msgListDiv.value.getBoundingClientRect();
    Array.from(unreadMsgEls).some((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.bottom < msgListRect.top) {
        newMsgTips.value.isShowTopTips = true
        newMsgTips.value.unreadCount = selectedSession.value.unreadCount
        newMsgTips.value.firstElement = el
        return true
      }
      else if (rect.top > msgListRect.bottom) {
        newMsgTips.value.isShowBottomTips = true
        newMsgTips.value.unreadCount = selectedSession.value.unreadCount
        return true
      }
    })
  })
})

const onSelectMenu = (item) => {
  selectedMenuItem.value = item
  
}

const onCustomContextmenu = ({ sessionId, menu }) => {
  showMenuSessionId.value = sessionId
  showMenu.value = menu
}

const onUpdateMenu = (menu) => {
  showMenu.value = menu
}

const onNoneSelected = () => {
  selectedSessionId.value = ''
}

</script>

<template>
  <el-container class="msg-container-hole" @click="onClickMsgContainer">
    <el-aside class="msg-aside bdr-r" :style="{ width: asideWidth + 'px' }">
      <div class="msg-aside-main">
        <div class="header">
          <SearchBox @showContactCard="onShowContactCard" @openSession="onOpenSession"></SearchBox>
          <AddBotton></AddBotton>
        </div>

        <ContextMenu :menu="showMenu" @selectMenu="onSelectMenu">
          <div class="session-list my-scrollbar" ref="sessionListRef">
            <SessionBox
              :id="`session-box-${sessionIdConvert(item.sessionId)}`"
              v-for="item in sessionListSorted"
              :key="item.sessionId"
              :sessionId="item.sessionId"
              :selectedSessionId="selectedSessionId"
              :showMenuSessionId="showMenuSessionId"
              :selectedMenuItem="selectedMenuItem"
              @isSelected="handleSelecteSession"
              @switchTag="handleSwitchTag"
              @showUserCard="onShowUserCard"
              @showGroupCard="onShowGroupCard"
              @customContextmenu="onCustomContextmenu"
              @updateMenu="onUpdateMenu"
              @noneSelected="onNoneSelected"
            ></SessionBox>
          </div>
        </ContextMenu>
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
        v-if="!selectedSessionId"
        :src="backgroupImage"
        fit="cover"
      ></el-image>

      <el-container v-else class="container">
        <el-header class="header bdr-b">
          <div class="show-name-id">
            <span class="show-name">{{ showName }}</span>
            <span v-if="selectedSession?.sessionType === MsgType.CHAT" class="show-id">{{
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
          <div class="show-box">
            <div v-if="isLoading" class="show-loading">数据加载中……</div>
            <div
              v-else
              class="message-main my-scrollbar"
              ref="msgListDiv"
              @wheel="handleMsgListWheel"
            >
              <MessageItem
                v-for="(item, index) in msgRecords"
                :key="index"
                :sessionId="selectedSessionId"
                :msg="item"
                :obj="selectedSession.objectInfo"
                :remoteRead="selectedSession.remoteRead"
                :lastMsgTime="getLastMsgTime(index)"
                :isFirstNew="isFirstNew(index)"
                :firstMsgId="firstMsgId"
                :hasNoMoreMsg="hasNoMoreMsg"
                :isLoadMoreLoading="isLoadMoreLoading"
                @loadMore="onLoadMore"
                @showUserCard="onShowUserCard"
              ></MessageItem>
            </div>
            <el-button
              type="primary"
              class="return-bottom"
              :class="{ showIt: isShowReturnBottom }"
              @click="onReturnBottom"
            >
              返回底部<el-icon class="el-icon--right"><ArrowDownBold /></el-icon>
            </el-button>
            <el-button
              type="primary"
              class="bottom-tips"
              :class="{ showIt: newMsgTips.isShowBottomTips }"
              @click="onReturnBottom"
            >
              {{ newMsgTips.unreadCount }}条未读消息<el-icon class="el-icon--right"
                ><ArrowDownBold
              /></el-icon>
            </el-button>
            <el-button
              type="primary"
              class="top-tips"
              :class="{ showIt: newMsgTips.isShowTopTips }"
              @click="onReachFirtUnReadMsg"
            >
              {{ newMsgTips.unreadCount }}条未读消息<el-icon class="el-icon--right"
                ><ArrowUp
              /></el-icon>
            </el-button>
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
                    <InputTool tips="聊天记录">
                      <template #iconSlot>
                        <Clock />
                      </template>
                    </InputTool>
                  </div>
                </div>
              </el-header>
              <el-main class="input-box-main">
                <InputEditor
                  :sessionId="selectedSessionId"
                  :draft="selectedSession.draft || ''"
                  @sendMessage="handleSendMessage"
                ></InputEditor>
              </el-main>
            </el-container>
          </div>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
  <UserCard
    :isShow="isShowUserCard"
    :userInfo="userInfo"
    @update:mark="onUpdateMark"
    @close="isShowUserCard = false"
  ></UserCard>
  <GroupCard
    :isShow="isShowGroupCard"
    :groupInfo="groupInfo"
    @close="isShowGroupCard = false"
  ></GroupCard>
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
        align-items: center;
      }

      .context-menu-container {
        overflow: hidden;

        .session-list {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0; // 防止右键点击到两个sessionBox中间的真空地带，造成弹出的菜单不能准确找到到session
          overflow-y: scroll;
        }
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

        .show-loading {
          width: 100%;
          height: 30px;
          padding: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #409eff;
          font-size: 14px;
        }

        .show-box {
          width: 100%;
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;

          .message-main {
            width: 100%;
            padding: 20px;
            padding-right: 15px;
            overflow-y: scroll; // 用它的滚动条
          }

          .return-bottom {
            position: absolute;
            left: 0px;
            bottom: -40px;
            transition: bottom 1s ease-in-out;

            &.showIt {
              bottom: -2px;
            }
          }

          .bottom-tips {
            position: absolute;
            right: 60px;
            bottom: -40px;
            transition: bottom 1s ease-in-out;

            &.showIt {
              bottom: -2px;
            }
          }

          .top-tips {
            position: absolute;
            right: 60px;
            top: -40px;
            transition: top 1s ease-in-out;

            &.showIt {
              top: -2px;
            }
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
