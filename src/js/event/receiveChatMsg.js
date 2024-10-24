import { nextTick } from 'vue'
import { combineId } from '@/js/utils/common'
import { messageStore } from '@/stores'
import { msgChatCreateSessionService } from '@/api/message'
import { MsgType } from '@/proto/msg'

export const onReceiveChatMsg = (msgListDiv, capacity) => {
  return async (msg) => {
    const messageData = messageStore()
    const sessionId = combineId(msg.body.fromId, msg.body.toId)
    const now = new Date()

    // 如果sessionList中没有,需要先创建session
    if (!messageData.sessionList[sessionId]) {
      const res = await msgChatCreateSessionService({
        sessionId: sessionId,
        account: msg.body.toId,
        remoteId: msg.body.fromId,
        sessionType: MsgType.CHAT
      })
      messageData.addSession(res.data.data)
    }

    messageData.updateSession({
      sessionId: sessionId,
      lastMsgId: msg.body.msgId,
      lastMsgContent: msg.body.content,
      lastMsgTime: now,
      unreadCount: messageData.sessionList[sessionId].unreadCount + 1
    })

    messageData.addMsgRecords(sessionId, [
      {
        sessionId: sessionId,
        msgId: msg.body.msgId,
        fromId: msg.body.fromId,
        msgType: MsgType.CHAT,
        content: msg.body.content,
        msgTime: now
      }
    ])

    const scrollHeight = msgListDiv.value?.scrollHeight
    const clientHeight = document.querySelector('.show-box')?.clientHeight
    capacity.value += 1 //接收一条消息,展示列表的容量就+1
    nextTick(() => {
      // 如果滚动条触底,接收到新消息时继续保持触底
      if (scrollHeight - msgListDiv.value?.scrollTop - clientHeight < 1) {
        msgListDiv.value.scrollTop = msgListDiv.value?.scrollHeight
      }
    })
  }
}
