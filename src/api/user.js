import request from '@/js/utils/request'
import { userStore } from '@/stores'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION } from '@/const/userConst'

export const userRegisterService = ({ username, password }) => {
  return request.post('/user/register', {
    account: username,
    nickName: '',
    password: password
  })
}

export const userLoginService = ({ username, password }) => {
  const userData = userStore()
  return request.post('/user/login', {
    account: username,
    password: password,
    clientId: userData.clientId
  })
}

export const userLogoutService = ({ username }) => {
  return request.post('/user/logout', { account: username })
}

export const userInfoService = () => {
  return request.get('/user/querySelf')
}

export const userModifySelfService = (obj) => {
  return request.post('/user/modifySelf', obj)
}

export const userModifyPassword = (obj) => {
  return request.post('/user/modifyPwd', obj)
}

export const userQueryService = (obj) => {
  return request.get('/user/query', { params: obj })
}

export const userQueryByNickService = (obj) => {
  return request.get('/user/findByNick', { params: obj })
}

export const refreshToken = async () => {
  return request.post('/user/refreshToken', {
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  })
}
