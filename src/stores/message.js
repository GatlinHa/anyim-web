import { defineStore } from 'pinia'
import { ref } from 'vue'
import { msgUpdateSessionService } from '@/api/message'

// 消息功能相关需要缓存的数据
export const messageStore = defineStore('anyim-message', () => {
  const sessionList = ref({})

  const setSessionList = (sessions) => {
    sessionList.value = sessions
  }

  const updateSession = (session) => {
    if (sessionList.value[session.sessionId]) {
      sessionList.value[session.sessionId] = session
    } else {
      sessionList.value = {
        ...sessionList.value,
        [session.sessionId]: session
      }
    }

    msgUpdateSessionService({
      sessionId: session.sessionId,
      readMsgId: session.readMsgId,
      readTime: session.readTime,
      top: session.top,
      muted: session.muted,
      draft: session.draft
    })
  }

  return {
    sessionList,
    setSessionList,
    updateSession
  }
})
