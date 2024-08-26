import request from '@/utils/request'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION, CLIENT_ID } from '@/const/userConst'
import { refreshToken } from '@/api/common'

const getReqBody = (obj) => {
  return {
    ...obj,
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  }
}

export const userRegisterService = ({ username, password }) => {
  return request.post(
    '/user/register',
    getReqBody({
      account: username,
      nickName: '',
      password: password
    })
  )
}

export const userLoginService = ({ username, password }) => {
  return request.post(
    '/user/login',
    getReqBody({ account: username, password: password, clientId: CLIENT_ID })
  )
}

export const userInfoService = async () => {
  await refreshToken()
  return request.post('/user/querySelf', getReqBody({}))
}

export const userModifySelfService = async (obj) => {
  await refreshToken()
  return request.post('/user/modifySelf', getReqBody(obj))
}
