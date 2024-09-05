import { defineStore } from 'pinia'
import { ref } from 'vue'

// 消息功能相关需要缓存的数据
export const messageStore = defineStore(
  'anyim-message',
  () => {
    const lastSessionId = ref('')
    const lastSessionType = ref('')
    const lastObject = ref({})

    const setLastSessionId = (sessionId) => {
      lastSessionId.value = sessionId
    }

    const setLastSessionType = (sessionType) => {
      lastSessionType.value = sessionType
    }

    const setLastObject = (obj) => {
      lastObject.value = obj
    }

    return {
      lastSessionId,
      lastSessionType,
      lastObject,
      setLastSessionId,
      setLastSessionType,
      setLastObject
    }
  },
  {
    persist: true
  }
)
