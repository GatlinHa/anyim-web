import request from '@/utils/request'
import { CLIENT_ID } from '@/const/userConst'
import { refreshToken, getReqBody } from '@/api/common'

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

export const userLogoutnService = ({ username }) => {
  return request.post('/user/logout', getReqBody({ account: username }))
}

export const userInfoService = async () => {
  await refreshToken()
  return request.post('/user/querySelf', getReqBody({}))
}

export const userModifySelfService = async (obj) => {
  await refreshToken()
  return request.post('/user/modifySelf', getReqBody(obj))
}

export const userModifyPassword = async (obj) => {
  await refreshToken()
  return request.post('/user/modifyPwd', getReqBody(obj))
}

export const userUploadAvatarService = async (obj) => {
  await refreshToken()
  return request.postForm('/user/upload', getReqBody(obj))
}
