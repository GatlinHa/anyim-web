import { userStore, messageStore } from '@/stores'
import { combineId } from '@/js/utils/common'

export const onReceiveStatusResMsg = () => {
  return async (msg) => {
    const userData = userStore()
    const messageData = messageStore()
    const content = JSON.parse(msg.body.content)
    if (content[userData.user.account]) {
      userData.updateUserStatus(content[userData.user.account])
    }

    //遍历content的每个属性，属性key是account
    Object.keys(content).forEach((key) => {
      const sessionId = combineId(userData.user.account, key)
      if (messageData.sessionList[sessionId]) {
        messageData.updateSession({
          sessionId: sessionId,
          objectInfo: {
            ...messageData.sessionList[sessionId].objectInfo,
            status: content[key]
          }
        })
      }
    })
  }
}
