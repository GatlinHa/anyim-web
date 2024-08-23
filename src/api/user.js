import request from '@/utils/request'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION, CLIENT_ID } from '@/const/userConst'
import { refreshToken } from '@/api/common'

export const userRegisterService = ({ username, password }) => {
  return request.post('/user/register', {
    account: username,
    nickName: '',
    password: password,
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  })
}

export const userLoginService = ({ username, password }) => {
  return request.post('/user/login', {
    account: username,
    password: password,
    clientId: CLIENT_ID,
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  })
}

export const userInfoService = async () => {
  await refreshToken()
  return request.post('/user/querySelf', {
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  })
}
