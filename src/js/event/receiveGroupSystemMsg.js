import { nextTick } from 'vue'
import { messageStore, groupStore } from '@/stores'
import { msgChatQuerySessionService } from '@/api/message'
import { groupInfoService } from '@/api/group'

export const onReceiveGroupSystemMsg = (msgListDiv, capacity) => {
  return async (msg) => {
    const messageData = messageStore()
    const groupData = groupStore()
    const sessionId = msg.body.sessionId
    const now = new Date()

    // 如果sessionList中没有,需要加载这个session
    if (!messageData.sessionList[sessionId]) {
      const res = await msgChatQuerySessionService({ sessionId: sessionId })
      messageData.addSession(res.data.data)
    }

    const res = await groupInfoService({ groupId: msg.body.groupId })
    groupData.setGroupInfo(res.data.data.groupInfo)
    groupData.setGroupMembers({
      groupId: msg.body.groupId,
      members: res.data.data.members
    })

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

    // 如果是当前正打开的会话
    if (messageData.selectedSessionId === sessionId) {
      const scrollHeight = msgListDiv.value?.scrollHeight
      const clientHeight = document.querySelector('.show-message-box')?.clientHeight
      capacity.value += 1 //接收一条消息,展示列表的容量就+1
      nextTick(() => {
        // 如果滚动条触底,接收到新消息时继续保持触底
        if (scrollHeight - msgListDiv.value?.scrollTop - clientHeight < 1) {
          msgListDiv.value.scrollTop = msgListDiv.value?.scrollHeight
        }
      })
    }
  }
}
