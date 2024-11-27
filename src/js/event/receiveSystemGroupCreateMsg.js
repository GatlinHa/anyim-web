import { messageStore } from '@/stores'
import { msgChatQuerySessionService } from '@/api/message'

export const onReceiveSystemGroupCreateMsg = () => {
  return async (msg) => {
    const messageData = messageStore()
    const sessionId = msg.body.sessionId
    const now = new Date()

    // 如果sessionList中没有,需要加载这个session
    if (!messageData.sessionList[sessionId]) {
      msgChatQuerySessionService({
        sessionId: sessionId
      }).then((res) => {
        messageData.addSession(res.data.data)
      })
    }

    messageData.updateSession({
      sessionId: sessionId,
      lastMsgId: msg.body.msgId,
      lastMsgType: msg.header.msgType,
      lastMsgContent: msg.body.content,
      lastMsgAccount: msg.body.fromId,
      lastMsgTime: now
    })

    messageData.addMsgRecords(sessionId, [
      {
        sessionId: sessionId,
        msgId: msg.body.msgId,
        fromId: msg.body.fromId,
        msgType: msg.header.msgType,
        content: msg.body.content,
        msgTime: now
      }
    ])
  }
}
