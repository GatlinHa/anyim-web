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

export const userLogoutnService = ({ username }) => {
  return request.post('/user/logout', getReqBody({ account: username }))
}

export const userInfoService = async () => {
  return request.post('/user/querySelf', getReqBody({}))
}

export const userModifySelfService = async (obj) => {
  return request.post('/user/modifySelf', getReqBody(obj))
}

export const userModifyPassword = async (obj) => {
  return request.post('/user/modifyPwd', getReqBody(obj))
}

export const userUploadAvatarService = async (obj) => {
  return request.postForm('/user/upload', getReqBody(obj))
}
