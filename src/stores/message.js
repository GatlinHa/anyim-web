import { defineStore } from 'pinia'
import { ref } from 'vue'
import { msgUpdateSessionService } from '@/api/message'

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

  const updateSession = (obj) => {
    const mySession = sessionList.value[obj.sessionId]
    if ('lastMsgId' in obj) mySession.lastMsgId = obj.lastMsgId
    if ('lastMsgContent' in obj) mySession.lastMsgContent = obj.lastMsgContent
    if ('lastMsgTime' in obj) mySession.lastMsgTime = obj.lastMsgTime
    if ('unreadCount' in obj) mySession.unreadCount = obj.unreadCount
    if ('top' in obj) mySession.top = obj.top
    if ('muted' in obj) mySession.muted = obj.muted
    if ('draft' in obj) mySession.draft = obj.draft

    let params = { sessionId: obj.sessionId }
    if ('top' in obj) params.top = obj.top
    if ('muted' in obj) params.muted = obj.muted
    if ('draft' in obj) params.draft = obj.draft

    if ('top' in obj || 'muted' in obj || 'draft' in obj) {
      msgUpdateSessionService(params)
    }
  }

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

  const getMsgRecords = (sessionId) => {
    return msgRecordsList.value[sessionId] ? msgRecordsList.value[sessionId] : []
  }

  return {
    sessionList,
    setSessionList,
    addSession,
    updateSession,

    msgRecordsList,
    addMsgRecords,
    getMsgRecords
  }
})
