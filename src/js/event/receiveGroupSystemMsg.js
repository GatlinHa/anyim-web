import { messageStore, groupStore } from '@/stores'
import { msgChatQuerySessionService } from '@/api/message'
import { groupInfoService } from '@/api/group'

export const onReceiveGroupSystemMsg = () => {
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
  }
}
