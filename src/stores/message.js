import { defineStore } from 'pinia'
import { ref } from 'vue'

// 消息功能相关需要缓存的数据
export const messageStore = defineStore(
  'anyim-message',
  () => {
    const last = ref({
      lastSessionId: '',
      lastSessionType: '',
      lastObject: {}
    })

    const msgRecords = ref({})

    const setLast = ({ sessionId, sessionType, objectInfo }) => {
      last.value = {
        lastSessionId: sessionId ? sessionId : last.value.lastSessionId,
        lastSessionType: sessionType ? sessionType : last.value.lastSessionType,
        lastObject: objectInfo ? objectInfo : last.value.lastObject
      }
    }

    const addMsgRecord = (sessionId, { msgId, fromId, msgType, msgTime, content }) => {
      if (!msgRecords.value[sessionId]) {
        // 如果这个sessionId还没有数据，直接赋值成一个元素的数组
        msgRecords.value[sessionId] = [
          {
            msgId: msgId,
            fromId: fromId,
            msgType: msgType,
            msgTime: msgTime,
            content: content
          }
        ]
      } else {
        // 如果这个sessionId有数据，在原有数组基础上追加
        msgRecords.value[sessionId].push({
          msgId: msgId,
          fromId: fromId,
          msgType: msgType,
          msgTime: msgTime,
          content: content
        })
      }
    }

    return {
      last,
      setLast,
      msgRecords,
      addMsgRecord
    }
  },
  {
    persist: true
  }
)
