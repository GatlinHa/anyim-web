import request from '@/utils/request'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION } from '@/const/userConst'
import { userStore } from '@/stores'

/**
 * TODO 不应该这里判断AT是否过期，这里应该做纯粹的刷新
 */
export const refreshToken = async () => {
  const userData = userStore()
  const now = new Date().getTime()
  if (now > userData.at.expiretime && now <= userData.rt.expiretime) {
    console.log('refreshToken')
    const res = await request.post('/user/refreshToken', {
      clientType: CLIENT_TYPE,
      clientName: CLIENT_NAME,
      clientVersion: CLIENT_VERSION
    })
    userData.setAt(res.data.data.accessToken)
  }
}

export const getReqBody = (obj) => {
  return {
    ...obj,
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  }
}
