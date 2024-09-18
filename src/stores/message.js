import { defineStore } from 'pinia'
import { ref } from 'vue'

// 消息功能相关需要缓存的数据
export const messageStore = defineStore(
  'anyim-message',
  () => {
    const lastSessionId = ref()

    const sessionList = ref({})

    const setLastSessionId = (sessionId) => {
      lastSessionId.value = sessionId
    }

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
    }

    return {
      lastSessionId,
      sessionList,
      setLastSessionId,
      setSessionList,
      updateSession
    }
  },
  {
    persist: true
  }
)
