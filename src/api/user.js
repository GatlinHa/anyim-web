import request from '@/utils/request'
import { getReqBody } from '@/api/common'
import { userStore } from '@/stores'

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
  const userData = userStore()
  return request.post(
    '/user/login',
    getReqBody({ account: username, password: password, clientId: userData.clientId })
  )
}

export const userLogoutService = ({ username }) => {
  return request.post('/user/logout', getReqBody({ account: username }))
}

export const userInfoService = () => {
  return request.post('/user/querySelf', getReqBody({}))
}

export const userModifySelfService = (obj) => {
  return request.post('/user/modifySelf', getReqBody(obj))
}

export const userModifyPassword = (obj) => {
  return request.post('/user/modifyPwd', getReqBody(obj))
}

export const userUploadAvatarService = (obj) => {
  return request.postForm('/user/upload', getReqBody(obj))
}

export const userQueryService = (obj) => {
  return request.post('/user/query', getReqBody(obj))
}
