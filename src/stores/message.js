import { defineStore } from 'pinia'
import { ref } from 'vue'

// 消息功能相关需要缓存的数据
export const messageStore = defineStore(
  'anyim-message',
  () => {
    const lastSessionId = ref('')
    const lastChatObj = ref({})

    const setLastSessionId = (sessionId) => {
      lastSessionId.value = sessionId
    }

    const setLastChatObj = (obj) => {
      lastChatObj.value = obj
    }

    return {
      lastSessionId,
      lastChatObj,
      setLastSessionId,
      setLastChatObj
    }
  },
  {
    persist: true
  }
)
