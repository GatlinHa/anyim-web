import request from '@/utils/request'
import { getReqBody } from '@/api/common'

export const msgChatSessionListService = async () => {
  return request.post('/chat/sessionList', getReqBody())
}
