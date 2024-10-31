import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { msgUpdateSessionService } from '@/api/message'
import { ElMessage } from 'element-plus'

// 消息功能相关需要缓存的数据，不持久化存储
export const messageStore = defineStore('anyim-message', () => {
  /**
   * 格式：{sessionId_1: session_1, sessionId_2: session_2, ...}
   */
  const sessionList = ref({})

  const setSessionList = (sessions) => {
    sessionList.value = sessions
  }

  // 加入新的会话（陌生人发消息，产生新的会话）
  const addSession = (session) => {
    sessionList.value[session.sessionId] = session
  }

  const deleteSession = (sessionId) => {
    delete sessionList.value[sessionId]
  }

  const updateSession = async (obj) => {
    let params = { sessionId: obj.sessionId }
    let flag = false // 是否需要更新云端的数据
    if ('top' in obj) {
      params.top = obj.top
      flag = true
    }
    if ('muted' in obj) {
      params.muted = obj.muted
      flag = true
    }
    // 注意,这里draft允许为""空串,有实际意义
    if ('draft' in obj && sessionList.value[obj.sessionId].draft !== obj.draft) {
      params.draft = obj.draft
      flag = true
    }
    if ('mark' in obj) {
      params.mark = obj.mark
      flag = true
    }

    const mySession = sessionList.value[obj.sessionId]
    if ('lastMsgId' in obj) mySession.lastMsgId = obj.lastMsgId
    if ('lastMsgContent' in obj) mySession.lastMsgContent = obj.lastMsgContent
    if ('lastMsgTime' in obj) mySession.lastMsgTime = obj.lastMsgTime
    if ('unreadCount' in obj) mySession.unreadCount = obj.unreadCount
    if ('remoteRead' in obj) mySession.remoteRead = obj.remoteRead
    if ('readMsgId' in obj) mySession.readMsgId = obj.readMsgId
    if ('readTime' in obj) mySession.readTime = obj.readTime
    if ('pullMsgDone' in obj) mySession.pullMsgDone = obj.pullMsgDone
    if ('objectInfo' in obj) mySession.objectInfo = obj.objectInfo

    if (flag) {
      msgUpdateSessionService(params).then((res) => {
        // 云端更新成功再更新本地，保持数据同步
        if (res.data.code === 0) {
          if ('top' in obj) mySession.top = obj.top
          if ('muted' in obj) mySession.muted = obj.muted
          if ('draft' in obj) mySession.draft = obj.draft
          if ('mark' in obj) {
            mySession.mark = obj.mark
            ElMessage.success('保存成功')
          }
        }
      })
    }
  }

  const totalUnReadCount = computed(() => {
    return Object.values(sessionList.value).reduce(
      (sum, item) => (item?.unreadCount ? sum + item.unreadCount : sum),
      0
    )
  })

  const el = document.getElementsByTagName('title')[0]
  const title = import.meta.env.VITE_TITLE
  let task = null
  watch(
    () => totalUnReadCount.value,
    (newValue) => {
      if (totalUnReadCount.value > 0) {
        const newTitle = `您有(${newValue})条未读消息!`
        clearInterval(task)
        task = setInterval(() => {
          el.innerText = el.innerText === title ? newTitle : title
        }, 1000)
      } else {
        clearInterval(task)
        el.innerText = title
      }
    }
  )

  /**
   * 格式：{sessionId_1: msgRecord_1, sessionId_2: msgRecord_2, ...}
   * 其中msgRecord_x是数组
   */
  const msgRecordsList = ref({})

  /**
   * 对话列表中加入新的消息
   * @param {*} sessionId 会话id
   * @param {*} msgRecords 新的消息数组
   */
  const addMsgRecords = (sessionId, msgRecords) => {
    if (!msgRecordsList.value[sessionId]) {
      msgRecordsList.value[sessionId] = msgRecords.sort((a, b) => a.msgId - b.msgId)
    } else {
      msgRecordsList.value[sessionId] = [...msgRecordsList.value[sessionId], ...msgRecords].sort(
        (a, b) => a.msgId - b.msgId
      )
    }
  }

  const clear = () => {
    sessionList.value = {}
    msgRecordsList.value = {}
  }

  return {
    sessionList,
    setSessionList,
    addSession,
    deleteSession,
    updateSession,

    msgRecordsList,
    addMsgRecords,

    clear
  }
})
