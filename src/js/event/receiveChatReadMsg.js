import { combineId } from '@/utils/common'
import { messageStore } from '@/stores'

export const onReceiveChatReadMsg = () => {
  return async (msg) => {
    const messageData = messageStore()
    const sessionId = combineId(msg.body.fromId, msg.body.toId)
    messageData.updateSession({
      sessionId: sessionId,
      remoteRead: msg.body.content
    })
  }
}
