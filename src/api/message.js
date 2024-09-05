import request from '@/utils/request'
import { refreshToken, getReqBody } from '@/api/common'

export const msgChatSessionListService = async () => {
  await refreshToken()
  return request.post('/chat/sessionList', getReqBody())
}
