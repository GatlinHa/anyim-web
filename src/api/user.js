import request from '@/js/utils/request'
import { getReqBody } from '@/api/common'
import { userStore } from '@/stores'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION } from '@/const/userConst'

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

export const userQueryByNickService = (obj) => {
  return request.post('/user/findByNick', getReqBody(obj))
}

export const refreshToken = async () => {
  return request.post('/user/refreshToken', {
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  })
}

export const userCreatePartitionService = (obj) => {
  return request.post('/user/createPartition', getReqBody(obj))
}

export const userQueryPartitionService = () => {
  return request.post('/user/queryPartition', getReqBody())
}

export const userUpdatePartitionService = (obj) => {
  return request.post('/user/updatePartition', getReqBody(obj))
}

export const userDeletePartitionService = (obj) => {
  return request.post('/user/delPartition', getReqBody(obj))
}
