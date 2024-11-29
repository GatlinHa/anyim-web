eslint-disable prettier/prettier
<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import {
  Microphone,
  VideoCamera,
  MoreFilled,
  CirclePlus,
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
import AddButton from '@/components/common/AddButton.vue'
import SessionItem from '@/views/message/components/SessionItem.vue'
import InputTool from '@/views/message/components/InputTool.vue'
import InputEditor from '@/views/message/components/InputEditor.vue'
import MessageItem from '@/views/message/components/MessageItem.vue'
import SessionTag from '@/views/message/components/SessionTag.vue'
import SelectDialog from '@/components/common/SelectDialog.vue'
import {
  userStore,
  settingStore,
  messageStore,
  userCardStore,
  groupCardStore,
  groupStore
} from '@/stores'
import backgroupImage from '@/assets/messagebx_bg.webp'
import {
  msgChatPullMsgService,
  msgChatCreateSessionService,
  msgChatQuerySessionService
} from '@/api/message'
import { groupInfoService, groupCreateService } from '@/api/group'
import { MsgType } from '@/proto/msg'
import wsConnect from '@/js/websocket/wsConnect'
import {
  onReceiveChatMsg,
  onReceiveChatReadMsg,
  onReceiveGroupChatMsg,
  onReceiveGroupChatReadMsg
} from '@/js/event'
import { userQueryService } from '@/api/user'
import { ElLoading, ElMessage } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import { combineId, sessionIdConvert } from '@/js/utils/common'
import SessionMenu from '@/views/message/components/SessionMenu.vue'
import router from '@/router'
import { BEGIN_MSG_ID } from '@/const/msgConst'
import EditDialog from '@/components/common/EditDialog.vue'
import AddOprMenu from './components/AddOprMenu.vue'

const userData = userStore()
const settingData = settingStore()
const messageData = messageStore()
const userCardData = userCardStore()
const groupCardData = groupCardStore()
const groupData = groupStore()
const selectedSessionId = ref('') //当前被选中的session
const sessionListRef = ref()

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

const myAccount = computed(() => {
  return userData.user.account
})

// 消息拉取是否结束
const pullMsgDone = computed(() => {
  return selectedSession.value.pullMsgDone || false
})
// 是否是msgRecordsList为空
const noMsgRecords = computed(() => {
  return (
    !messageData.msgRecordsList[selectedSessionId.value] ||
    messageData.msgRecordsList[selectedSessionId.value].length === 0
  )
})
// msgRecordsList的第一条消息ID
const firstMsgId = computed(() => {
  if (!noMsgRecords.value) {
    return messageData.msgRecordsList[selectedSessionId.value][0].msgId
  } else {
    return 0
  }
})
// 是否是没有更多消息了：从服务器拉取结束了，或者firstMsgId是BEGIN_MSG_ID
const hasNoMoreMsg = computed(() => {
  return pullMsgDone.value || firstMsgId.value === BEGIN_MSG_ID
})

const isMutedInGroup = computed(() => {
  if (selectedSession.value.sessionType === MsgType.GROUP_CHAT) {
    const groupInfo = groupData.groupInfoList[selectedSession.value.remoteId]
    const members = groupData.groupMembersList[selectedSession.value.remoteId]
    const me = members[myAccount.value]
    if (me.mutedMode === 1 || (groupInfo.allMuted && me.mutedMode !== 2)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
})

const isShowReturnBottom = ref(false)

// 留在该页面上的session状态缓存，例如：
//  isLoading: 正在加载数据，解释：会话首次被打开时开场加载数据的loading场景
//  isLoadMoreLoading: 是否加载更多中，解释：会话被打开后，向上移动滚轮到顶出现“加载更多”字样，继续滚动或者点击的loading场景
// 这些数据不能放在messageData，因为这个cache会随页面消亡而清除数据，重新回到页面后使用初始默认数据即可
// 数据格式示例：{'sessionId_xxx': {isLoadMoreLoading: false, isLoading: false}}
// 触发选中session事件后，才会给这个数据里面插入被选中session状态的缓存
const selectedSessionCache = ref({})

const capacity = ref(15) //TODO 现在是调试值
const step = 15 //TODO 现在是调试值
const startIndex = computed(() => {
  if (selectedSessionId.value) {
    const len = messageData.msgRecordsList[selectedSessionId.value]?.length
    return len > capacity.value ? len - capacity.value : 0
  } else {
    return 0
  }
})

const initSession = (sessionId) => {
  capacity.value = 15 //会话的默认显示消息记录数
  msgListReachBottom(false) //会话默认滚到最底部
  isShowReturnBottom.value = false //会话默认不弹出“返回底部”的按钮
  // 如果selectedSessionCache有这个sessionId就不重置
  if (!selectedSessionCache.value[sessionId]) {
    selectedSessionCache.value[sessionId] = {
      isLoading: false,
      isLoadMoreLoading: false
    }
  }
}

const locateSession = (sessionId) => {
  nextTick(() => {
    const selectedElement = document.querySelector(`#session-item-${sessionIdConvert(sessionId)}`)
    // 如果被选中元素的上边在scrollTop之的上面，或这在下边在scrollTop+clientHeight的下面（显示不全或者完全没有显示），则需要重新定位
    // 由于offsetTop和offsetHeight不包含外边距，因此定位存在细小误差，暂不处理
    if (selectedElement.offsetTop - selectedElement.offsetHeight < sessionListRef.value.scrollTop) {
      sessionListRef.value.scrollTop = selectedElement.offsetTop - selectedElement.offsetHeight
    } else if (
      selectedElement.offsetTop >
      sessionListRef.value.scrollTop + sessionListRef.value.clientHeight
    ) {
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
  await messageData.loadSessionList()
  await messageData.loadPartitions()
  await groupData.loadGroupInfoList()

  asideWidth.value = settingData.sessionListDrag[myAccount.value] || 300
  inputBoxHeight.value = settingData.inputBoxDrag[myAccount.value] || 300

  wsConnect.bindEvent(MsgType.CHAT, onReceiveChatMsg(selectedSessionId, msgListDiv, capacity)) //绑定接收Chat消息的事件
  wsConnect.bindEvent(MsgType.CHAT_READ, onReceiveChatReadMsg()) //绑定接收Chat已读消息的事件
  wsConnect.bindEvent(
    MsgType.GROUP_CHAT,
    onReceiveGroupChatMsg(selectedSessionId, msgListDiv, capacity)
  ) //绑定接收GroupChat消息的事件
  wsConnect.bindEvent(MsgType.GROUP_CHAT_READ, onReceiveGroupChatReadMsg()) //绑定接收GroupChat已读消息的事件

  // 定时更新单聊对象的状态
  const accounts = []
  Object.keys(messageData.sessionList).forEach((key) => {
    const session = messageData.sessionList[key]
    const sessionType = session.sessionType
    if (sessionType === MsgType.CHAT) {
      //只看单聊的，群里在打开聊天窗时触发查询
      accounts.push(session.objectInfo.account)
    }
  })

  setInterval(() => {
    wsConnect.statusReq(JSON.stringify(accounts))
  }, 5000)

  // 这里要接收从其他页面跳转过来传递的sessionId参数
  const routerSessionId = router.currentRoute.value.query.sessionId
  if (routerSessionId) {
    if (routerSessionId in messageData.sessionList) {
      handleSelectedSession(routerSessionId)
    } else {
      const res = await msgChatQuerySessionService({ sessionId: routerSessionId })
      if (res.data.data) {
        messageData.addSession(res.data.data)
        handleSelectedSession(routerSessionId)
      }
    }
  }
})

const handleMsgListWheel = async () => {
  if (
    msgListDiv.value.scrollTop === 0 &&
    !selectedSessionCache.value[selectedSessionId.value].isLoadMoreLoading
  ) {
    await onLoadMore()
  }

  const clientHeight = document.querySelector('.message-main').clientHeight
  const diffToBottom = msgListDiv.value.scrollHeight - msgListDiv.value.scrollTop - clientHeight
  // diffToBottom接近50个像素的时候，关闭底部未读tips控件
  newMsgTips.value.isShowBottomTips = diffToBottom < 50 ? false : newMsgTips.value.isShowBottomTips
  // isShowReturnBottom.value = diffToBottom > 300  // 控制是否显示"回到底部"的按钮。暂时取消这个提示功能，与消息提示的按钮显得有点重复

  if (newMsgTips.value.firstElement?.getBoundingClientRect().top > 0) {
    newMsgTips.value.isShowTopTips = false
  }
}

// 把sessionList转成数组，并按照lastMsgTime排序
const sessionListSorted = computed(() => {
  if (!Object.keys(messageData.sessionList)) {
    return []
  } else {
    let sessionArr = Object.values(messageData.sessionList)
    return sessionArr.sort((a, b) => {
      if (a.top && !b.top) {
        // 排序第一优先级：是否置顶
        return -1
      } else if (!a.top && b.top) {
        return 1
      } else {
        if (a.draft && !b.draft) {
          // 排序第二优先级：是否有草稿
          return -1
        } else if (!a.draft && b.draft) {
          return 1
        } else {
          // 排序第三优先级：最后一条消息的时间
          const bTime = new Date(b.lastMsgTime).getTime()
          const aTIme = new Date(a.lastMsgTime).getTime()
          if (bTime !== aTIme) {
            return bTime - aTIme
          }
        }
      }
    })
  }
})

const showName = computed(() => {
  switch (selectedSession.value.sessionType) {
    case MsgType.CHAT:
      return selectedSession.value.objectInfo.nickName || '没有昵称'
    case MsgType.GROUP_CHAT:
      return (
        groupData.groupInfoList[selectedSession.value.remoteId]?.groupName ||
        selectedSession.value.objectInfo.groupName ||
        '没有群名称'
      )
    default:
      return ''
  }
})

const showId = computed(() => {
  return selectedSession.value.remoteId
})

const getPreMsgTime = (index) => {
  if (index > 0) {
    return msgRecords.value[index - 1].msgTime
  } else {
    return null
  }
}

const getMsgSenderObj = (item) => {
  if (selectedSession.value.sessionType === MsgType.GROUP_CHAT) {
    // 如果此时memberList还没有加载完成，先return account给MessageItem子组件
    const memberList = groupData.groupMembersList[selectedSession.value.remoteId]
    return memberList ? memberList[item.fromId] : { account: item.fromId }
  } else {
    if (myAccount.value === item.fromId) {
      return userData.user
    } else {
      return selectedSession.value.objectInfo
    }
  }
}

const lastReadMsgId = ref()
/**
 * 判断是否是打开session后的第一条未读消息
 * @param index
 */
const isFirstNew = (index) => {
  if (index > 0 && msgRecords.value[index - 1].msgId == lastReadMsgId.value) {
    return true
  }
  return false
}

const onAsideDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag({
    ...settingData.sessionListDrag,
    [myAccount.value]: width
  })
}

const onInputBoxDragUpdate = ({ height }) => {
  inputBoxHeight.value = height
  msgListReachBottom()
  settingData.setInputBoxDrag({
    ...settingData.inputBoxDrag,
    [myAccount.value]: height
  })
}

/**
 * 通过REST接口主动拉取消息
 * @param mode 0:拉取最近N条;1:按refMsgId向上拉取N条(上滑加载更多消息)
 * @param ref mode=1时要携带,标记更新的msgId位置
 */
const pullMsg = async (mode = 0, ref = -1) => {
  // 下列三种情况不拉取数据
  if (
    hasNoMoreMsg.value ||
    selectedSessionCache.value[selectedSessionId.value].isLoading ||
    selectedSessionCache.value[selectedSessionId.value].isLoadMoreLoading
  ) {
    return
  }

  const pageSize = 30
  const params = {
    sessionId: selectedSessionId.value,
    pageSize: pageSize,
    mode: mode,
    refMsgId: ref
  }

  // mode=0才需要显示"数据加载中..."
  if (mode === 0) selectedSessionCache.value[selectedSessionId.value].isLoading = true
  // mode=1才需要显示"加载更多中..."
  if (mode === 1) selectedSessionCache.value[selectedSessionId.value].isLoadMoreLoading = true
  // 这里一定不要响应式的sessionId，否则快速点击切换session会导致数据都叠加到最后一次的selectedSessionId上面
  const sessionId = selectedSessionId.value
  try {
    const res = await msgChatPullMsgService(params)
    const msgCount = res.data.data.count
    if (msgCount > 0) {
      messageData.addMsgRecords(sessionId, res.data.data.msgList)
      if (mode === 0) {
        messageData.updateSession({
          sessionId: sessionId,
          lastMsgId: res.data.data.lastMsgId,
          lastMsgType: res.data.data.msgList[msgCount - 1].msgType,
          lastMsgContent: res.data.data.msgList[msgCount - 1].content,
          lastMsgAccount: res.data.data.msgList[msgCount - 1].fromId,
          lastMsgTime: res.data.data.msgList[msgCount - 1].msgTime
        })
      }
    }

    if (msgCount < pageSize) {
      messageData.updateSession({
        sessionId: sessionId,
        pullMsgDone: true
      })
    }
  } finally {
    if (mode === 0) selectedSessionCache.value[selectedSessionId.value].isLoading = false
    if (mode === 1) selectedSessionCache.value[selectedSessionId.value].isLoadMoreLoading = false
  }
}

// 表示有个session被选中了
const handleSelectedSession = async (sessionId) => {
  if (selectedSessionId.value !== sessionId) {
    selectedSessionId.value = sessionId
    router.push({
      path: '/message',
      query: {
        sessionId: sessionId
      }
    })
    initSession(sessionId)
    locateSession(sessionId)

    // 如果是群组，要加载成员列表（显示消息需要account，nickName，avatar信息）
    if (selectedSession.value.sessionType === MsgType.GROUP_CHAT) {
      const groupId = selectedSession.value.remoteId
      // 没有members数据才需要加载成员列表，加载过了就不重复加载了
      if (!groupData.groupMembersList[groupId]) {
        const res = await groupInfoService({ groupId: groupId })
        groupData.setGroupInfo(res.data.data.groupInfo)
        groupData.setGroupMembers({
          groupId: groupId,
          members: res.data.data.members
        })
      }
    }

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
  if (
    selectedSessionId.value &&
    selectedSession.value.readMsgId < selectedSession.value.lastMsgId
  ) {
    const content = selectedSession.value.lastMsgId.toString()
    const msgType =
      selectedSession.value.sessionType === MsgType.CHAT
        ? MsgType.CHAT_READ
        : MsgType.GROUP_CHAT_READ
    wsConnect.sendMsg(selectedSessionId.value, showId.value, msgType, content + '', () => {})
    // 更新本地缓存的已读位置
    messageData.updateSession({
      sessionId: selectedSessionId.value,
      readMsgId: content,
      readTime: new Date(),
      unreadCount: 0
    })
  }
}

const handleSendMessage = (content) => {
  if (isMutedInGroup.value) {
    ElMessage.warning('您已被禁言，请联系管理员')
    return
  }

  // TODO 这里还要考虑失败情况：1）消息发不出去；2）消息发出去了，服务器不发“已发送”
  wsConnect.sendMsg(
    selectedSessionId.value,
    showId.value,
    selectedSession.value.sessionType,
    content,
    (msgId) => {
      const now = new Date()
      messageData.updateSession({
        sessionId: selectedSessionId.value,
        lastMsgId: msgId, // 最后一条消息（自己发的）
        lastMsgType: selectedSession.value.sessionType,
        lastMsgContent: content,
        lastMsgAccount: myAccount.value,
        lastMsgTime: now,
        readMsgId: msgId, // 最后一条消息是自己发的，因此已读更新到刚发的这条消息的msgId
        readTime: now,
        unreadCount: 0, // 最后一条消息是自己发的，因此未读是0
        draft: '' //草稿意味着要清空
      })

      messageData.addMsgRecords(selectedSessionId.value, [
        {
          sessionId: selectedSessionId.value,
          msgId: msgId,
          fromId: myAccount.value,
          msgType: selectedSession.value.sessionType,
          content: content,
          msgTime: now
        }
      ])

      msgListReachBottom(false) // 发送消息之后,msgList要触底
    }
  )
}

const onLoadMore = async () => {
  const scrollHeight = msgListDiv.value.scrollHeight
  const scrollTop = msgListDiv.value.scrollTop
  if (messageData.msgRecordsList[selectedSessionId.value]?.length <= capacity.value) {
    await pullMsg(1, msgRecords.value[0].msgId)
  }
  const len = messageData.msgRecordsList[selectedSessionId.value]?.length
  if (len > capacity.value) {
    if (len - capacity.value > step) {
      capacity.value += step
    } else {
      capacity.value = len
    }
  }

  // 保持页面对话的锚定位置
  nextTick(() => {
    msgListDiv.value.scrollTop = msgListDiv.value.scrollHeight - scrollHeight + scrollTop
  })
}

// 消息列表拉到最底部
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

const onReachFirstUnReadMsg = () => {
  const msgListRect = msgListDiv.value.getBoundingClientRect()
  const firstElRect = newMsgTips.value.firstElement.getBoundingClientRect()
  nextTick(() => {
    msgListDiv.value.scrollTop = msgListDiv.value.scrollTop - (msgListRect.top - firstElRect.top)
  })
  newMsgTips.value.isShowTopTips = false
}

const onClickMsgContainer = () => {
  handleRead()
}

const onShowUserCard = async ({ sessionId, account }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  if (myAccount.value === account) {
    userData
      .updateUser()
      .then(() => {
        userCardData.setUserInfo(userData.user)
        userCardData.setIsShow(true)
      })
      .finally(() => {
        //防止请求异常，导致loading关不掉
        loadingInstance.close()
      })
  } else {
    userQueryService({ account: account })
      .then((res) => {
        userCardData.setUserInfo(res.data.data)
        userCardData.setIsShow(true)
        // 如果是单聊，需要更新session中的objectInfo. 因为群成员有可能不在sessionList中，所以不更新
        if (messageData.sessionList[sessionId].sessionType === MsgType.CHAT) {
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
        }
      })
      .finally(() => {
        //防止请求异常，导致loading关不掉
        loadingInstance.close()
      })
  }
}

const showMenuSessionId = ref('') //当前被点击右键的sessionId（它可以不是选中的）
const selectedMenuItem = ref('') //菜单组件反馈用户点击的某个菜单项

const isShowUpdateMarkDialog = ref(false)
const titleForUpdateMark = ref('')
const onShowUpdateMarkDialog = () => {
  isShowUpdateMarkDialog.value = true
  const objectInfo = messageData.sessionList[showMenuSessionId.value].objectInfo
  if (messageData.sessionList[showMenuSessionId.value].sessionType === MsgType.CHAT) {
    titleForUpdateMark.value = `${objectInfo.nickName} ${objectInfo.account}`
  } else if (messageData.sessionList[showMenuSessionId.value].sessionType === MsgType.GROUP_CHAT) {
    titleForUpdateMark.value = `${objectInfo.groupName} ${objectInfo.groupId}`
  }
}

const onUpdateMarkConfirm = (inputValue) => {
  // 如果没有更改，不需要执行保存
  if (inputValue !== messageData.sessionList[showMenuSessionId.value].mark) {
    messageData.updateSession({
      sessionId: showMenuSessionId.value,
      mark: inputValue
    })
  }
  isShowUpdateMarkDialog.value = false
}

const onShowGroupCard = async ({ groupId }) => {
  const loadingInstance = ElLoading.service(el_loading_options)
  groupInfoService({ groupId: groupId })
    .then((res) => {
      groupCardData.setGroupId(groupId)
      groupCardData.setIsShow(true)
      groupData.setGroupInfo(res.data.data.groupInfo)
      groupData.setGroupMembers({
        groupId: groupId,
        members: res.data.data.members
      })
    })
    .finally(() => {
      loadingInstance.close()
    })
}

const onShowContactCard = (contactInfo) => {
  userCardData.setUserInfo(contactInfo)
  userCardData.setIsShow(true)
}

const onOpenSession = async ({ msgType, objectInfo }) => {
  if (myAccount.value === objectInfo.account) {
    console.log('暂不支持自己给自己发消息') //TODO
    return
  }

  let sessionId
  let remoteId
  if (msgType === MsgType.CHAT) {
    sessionId = combineId(myAccount.value, objectInfo.account)
    remoteId = objectInfo.account
  } else if (msgType === MsgType.GROUP_CHAT) {
    sessionId = objectInfo.groupId
    remoteId = objectInfo.groupId
  } else {
    return
  }

  if (messageData.sessionList[sessionId]) {
    handleSelectedSession(sessionId)
  } else {
    const res = await msgChatCreateSessionService({
      sessionId: sessionId,
      remoteId: remoteId,
      sessionType: msgType
    })
    messageData.addSession(res.data.data)
    handleSelectedSession(sessionId)
  }
}

/**
 * 监视msgRecords的数据变化,给出新消息的tips提示
 */
watch(
  () => msgRecords.value,
  (newValue) => {
    if (!newValue || selectedSession.value.unreadCount === 0) return
    nextTick(() => {
      const unreadMsgEls = document.querySelectorAll('.unreadMsg')
      if (unreadMsgEls.length === 0) return
      const msgListRect = msgListDiv.value.getBoundingClientRect()
      Array.from(unreadMsgEls).some((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.bottom < msgListRect.top) {
          newMsgTips.value.isShowTopTips = true
          newMsgTips.value.unreadCount = selectedSession.value.unreadCount
          newMsgTips.value.firstElement = el
          return true
        } else if (rect.top > msgListRect.bottom) {
          newMsgTips.value.isShowBottomTips = true
          newMsgTips.value.unreadCount = selectedSession.value.unreadCount
          return true
        }
      })
    })
  }
)

watch(
  () => router.currentRoute.value.query.sessionId,
  (newValue) => {
    if (newValue) {
      handleSelectedSession(newValue)
    }
  }
)

const sessionItemRefCollection = ref({})
const setSessionItemRef = (sessionId, el) => {
  sessionItemRefCollection.value[sessionId] = el
}

const onSelectMenu = (item) => {
  selectedMenuItem.value = item
  nextTick(() => {
    // 要延后执行，否则selectedMenuItem的值还没有传过去，点击无效
    sessionItemRefCollection.value[showMenuSessionId.value].handleSelectedMenuItem()
  })
}

const onOpenSessionMenu = (sessionId) => {
  showMenuSessionId.value = sessionId
}

const onNoneSelected = () => {
  selectedSessionId.value = ''
}

const onVoiceCall = () => {
  ElMessage.warning('功能开发中')
}

const onVideoCall = () => {
  ElMessage.warning('功能开发中')
}

const onInviteIntoGroup = () => {
  ElMessage.warning('功能开发中')
}

const onMoreSetting = () => {
  if (selectedSession.value.sessionType === MsgType.CHAT) {
    onShowUserCard({
      sessionId: selectedSession.value.sessionId,
      account: selectedSession.value.objectInfo.account
    })
  } else if (selectedSession.value.sessionType === MsgType.GROUP_CHAT) {
    onShowGroupCard({ groupId: selectedSession.value.remoteId })
  }
}

const isShowSelectDialog = ref(false)
const addOprMenuRef = ref()
const onSelectOprMenu = (label) => {
  switch (label) {
    case 'createGroup':
      isShowSelectDialog.value = true
      break
    case 'createVoiceMeeting':
      ElMessage.warning('功能开发中')
      break
    case 'createVideoMeeting':
      ElMessage.warning('功能开发中')
      break
    default:
      break
  }
}

const showAddOprMenu = (e) => {
  addOprMenuRef.value.handleSessionMenu(e)
}

/**
 * 用于显示创建群组弹窗中的候选成员名单
 */
const selectDialogOptions = computed(() => {
  const data = {}
  Object.values(messageData.sessionList).forEach((item) => {
    if (item.sessionType === MsgType.CHAT) {
      data[item.objectInfo.account] = item.objectInfo
    }
  })
  return data
})

const onConfirmSelect = async (selected) => {
  if (selected.length < 2) {
    ElMessage.warning('请至少选择两位群成员')
    return
  }

  const members = selected.map((item) => ({ account: item.account, nickName: item.nickName }))
  members.push({ account: userData.user.account, nickName: userData.user.nickName })
  const res = await groupCreateService({
    groupName: `${userData.user.nickName}、${selected[0].nickName}、${selected[1].nickName}等的群组`,
    groupType: 1, //普通群
    members: members
  })
  groupData.setGroupInfo(res.data.data.groupInfo)
  isShowSelectDialog.value = false

  // 所有成员拿到chat_session在群主创建群组的时候统一新增了，所有这里只需要查询
  msgChatQuerySessionService({
    sessionId: res.data.data.groupInfo.groupId
  }).then((res) => {
    messageData.addSession(res.data.data)
    handleSelectedSession(res.data.data.sessionId)
  })
}
</script>

<template>
  <el-container class="msg-container-hole" @click="onClickMsgContainer">
    <el-aside class="msg-aside bdr-r" :style="{ width: asideWidth + 'px' }">
      <div class="msg-aside-main">
        <div class="header">
          <SearchBox
            @showContactCard="onShowContactCard"
            @showGroupCard="onShowGroupCard"
            @openSession="onOpenSession"
          ></SearchBox>
          <AddOprMenu ref="addOprMenuRef" @selectMenu="onSelectOprMenu">
            <AddButton :size="30" @click="showAddOprMenu($event)"></AddButton>
          </AddOprMenu>
        </div>

        <SessionMenu :sessionId="showMenuSessionId" @selectMenu="onSelectMenu">
          <div class="session-list my-scrollbar" ref="sessionListRef">
            <SessionItem
              :ref="(el) => setSessionItemRef(item.sessionId, el)"
              :id="`session-item-${sessionIdConvert(item.sessionId)}`"
              v-for="item in sessionListSorted"
              :key="item.sessionId"
              :sessionId="item.sessionId"
              :selectedSessionId="selectedSessionId"
              :showMenuSessionId="showMenuSessionId"
              :selectedMenuItem="selectedMenuItem"
              @isSelected="handleSelectedSession"
              @showUserCard="onShowUserCard"
              @showGroupCard="onShowGroupCard"
              @openSessionMenu="onOpenSessionMenu"
              @noneSelected="onNoneSelected"
              @showUpdateMarkDialog="onShowUpdateMarkDialog"
            ></SessionItem>
          </div>
        </SessionMenu>
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
            <SessionTag
              v-if="selectedSession?.sessionType === MsgType.GROUP_CHAT"
              tagType="groupchat"
            ></SessionTag>
            <span
              class="show-name text-ellipsis"
              :title="selectedSession.mark ? `${selectedSession.mark}(${showName})` : showName"
            >
              {{ selectedSession.mark ? `${selectedSession.mark}(${showName})` : showName }}
            </span>
            <span class="show-id" :title="showId">{{ showId }}</span>
          </div>

          <div class="action-set">
            <el-icon
              class="action-button"
              size="20"
              :title="selectedSession.sessionType === MsgType.GROUP_CHAT ? '多人语音' : '语音通话'"
              @click="onVoiceCall"
            >
              <Microphone />
            </el-icon>
            <el-icon
              class="action-button"
              size="20"
              :title="selectedSession.sessionType === MsgType.GROUP_CHAT ? '视频会议' : '视频通话'"
              @click="onVideoCall"
            >
              <VideoCamera />
            </el-icon>
            <el-icon
              v-if="selectedSession.sessionType === MsgType.GROUP_CHAT"
              class="action-button"
              size="20"
              title="邀请进群"
              @click="onInviteIntoGroup"
            >
              <CirclePlus />
            </el-icon>
            <el-icon class="action-button" size="20" title="更多设置" @click="onMoreSetting">
              <MoreFilled />
            </el-icon>
          </div>
        </el-header>
        <el-main class="body">
          <div class="show-box">
            <div v-if="selectedSessionCache[selectedSessionId].isLoading" class="show-loading">
              数据加载中……
            </div>
            <div v-else-if="!selectedSession.lastMsgId" class="no-more-message">当前无更多消息</div>
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
                :obj="getMsgSenderObj(item)"
                :readMsgId="selectedSession.readMsgId"
                :remoteRead="selectedSession.remoteRead"
                :preMsgTime="getPreMsgTime(index)"
                :isFirstNew="isFirstNew(index)"
                :firstMsgId="firstMsgId"
                :hasNoMoreMsg="hasNoMoreMsg"
                :isLoadMoreLoading="selectedSessionCache[selectedSessionId].isLoadMoreLoading"
                @loadMore="onLoadMore"
                @showUserCard="onShowUserCard"
                @showGroupCard="onShowGroupCard"
              ></MessageItem>
            </div>
            <el-button
              type="primary"
              class="return-bottom"
              :class="{ showIt: isShowReturnBottom }"
              @click="onReturnBottom"
            >
              返回底部
              <el-icon class="el-icon--right"><ArrowDownBold /></el-icon>
            </el-button>
            <el-button
              type="primary"
              class="bottom-tips"
              :class="{ showIt: newMsgTips.isShowBottomTips }"
              @click="onReturnBottom"
            >
              {{ newMsgTips.unreadCount > 99 ? `99+` : newMsgTips.unreadCount }}条未读消息
              <el-icon class="el-icon--right"><ArrowDownBold /></el-icon>
            </el-button>
            <el-button
              type="primary"
              class="top-tips"
              :class="{ showIt: newMsgTips.isShowTopTips }"
              @click="onReachFirstUnReadMsg"
            >
              {{ newMsgTips.unreadCount > 99 ? `99+` : newMsgTips.unreadCount }}条未读消息
              <el-icon class="el-icon--right"><ArrowUp /></el-icon>
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
  <EditDialog
    :isShow="isShowUpdateMarkDialog"
    :title="'修改备注：'"
    :titleExt="titleForUpdateMark"
    :placeholder="'请输入备注'"
    :defaultInput="messageData.sessionList[showMenuSessionId]?.mark || ''"
    @close="isShowUpdateMarkDialog = false"
    @confirm="onUpdateMarkConfirm"
  ></EditDialog>
  <SelectDialog
    v-model="isShowSelectDialog"
    :options="selectDialogOptions"
    :searchModel="'server'"
    @showUserCard="onShowUserCard"
    @confirm="onConfirmSelect"
  >
    <template #title>
      <div style="font-size: 16px; font-weight: bold; white-space: nowrap">创建群组</div>
    </template>
  </SelectDialog>
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
        padding: 10px 10px 10px 0;
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
          gap: 0; // 防止右键点击到两个sessionItem中间的真空地带，造成弹出的菜单不能准确找到到session
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
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .show-name-id {
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: text;

          .show-name {
            max-width: 300px;
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
          .action-button {
            padding: 8px;
            margin-left: 10px;
            border-radius: 50%;
            background-color: #fff;
            border: transparent solid 1px;
            cursor: pointer;

            &:hover {
              border: #409eff solid 1px;
              color: #409eff;
            }
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
          overflow: hidden;
          position: relative;

          .show-loading {
            width: 100%;
            height: 30px;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #409eff;
            font-size: 14px;
          }

          .no-more-message {
            width: 100%;
            height: 30px;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            color: gray;
            user-select: text;
          }

          .message-main {
            width: 100%;
            padding: 10px;
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
            right: 40%;
            bottom: -40px;
            transition: bottom 1s ease-in-out;

            &.showIt {
              bottom: -2px;
            }
          }

          .top-tips {
            position: absolute;
            right: 40%;
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
