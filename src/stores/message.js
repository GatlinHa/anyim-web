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
    if (obj.readMsgId) mySession.readMsgId = obj.readMsgId
    if (obj.readTime) mySession.readTime = obj.readTime
    if (obj.lastMsgId) mySession.lastMsgId = obj.lastMsgId
    if (obj.lastMsgContent) mySession.lastMsgContent = obj.lastMsgContent
    if (obj.lastMsgTime) mySession.lastMsgTime = obj.lastMsgTime
    if (obj.unreadCount) mySession.unreadCount = obj.unreadCount
    if (obj.top) mySession.top = obj.top
    if (obj.muted) mySession.muted = obj.muted
    if ('draft' in obj) mySession.draft = obj.draft

    let params = { sessionId: obj.sessionId }
    if (obj.top) params.top = obj.top
    if (obj.muted) params.muted = obj.muted
    if ('draft' in obj) params.draft = obj.draft

    if (obj.top || obj.muted || 'draft' in obj) {
      msgUpdateSessionService(params)
    }
  }

  /**
   * 格式：{sessionId_1: msgRecord_1, sessionId_2: msgRecord_2, ...}
   */
  const msgRecordList = ref({})

  const setMsgRecordList = (msgRecords) => {
    msgRecordList.value = msgRecords
  }

  const addMsgRecord = (msgRecord) => {
    msgRecordList.value[msgRecord.sessionId] = msgRecord
  }

  return {
    sessionList,
    setSessionList,
    addSession,
    updateSession,

    msgRecordList,
    setMsgRecordList,
    addMsgRecord
  }
})
