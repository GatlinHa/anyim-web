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

export const msgCreatePartitionService = (obj) => {
  return request.post('/chat/createPartition', getReqBody(obj))
}

export const msgQueryPartitionService = () => {
  return request.post('/chat/queryPartition', getReqBody())
}

export const msgUpdatePartitionService = (obj) => {
  return request.post('/chat/updatePartition', getReqBody(obj))
}

export const msgDeletePartitionService = (obj) => {
  return request.post('/chat/delPartition', getReqBody(obj))
}
