import request from '@/js/utils/request'
import { getReqBody } from '@/api/common'

export const msgChatSessionListService = () => {
  return request.post('/chat/sessionList', getReqBody())
}

export const msgUpdateSessionService = (obj) => {
  return request.post('/chat/updateSession', getReqBody(obj))
}

export const msgChatPullMsgService = (obj) => {
  return request.post('/chat/pullMsg', getReqBody(obj))
}

export const msgChatCreateSessionService = (obj) => {
  return request.post('/chat/createSession', getReqBody(obj))
}

export const msgChatDeleteSessionService = (obj) => {
  return request.post('/chat/deleteSession', getReqBody(obj))
}
