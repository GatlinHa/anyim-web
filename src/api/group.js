import request from '@/js/utils/request'
import { getReqBody } from '@/api/common'

export const groupCreateService = (obj) => {
  return request.post('/groupmng/createGroup', getReqBody(obj))
}

export const groupInfoListService = () => {
  return request.post('/groupmng/queryGroupList', getReqBody())
}

export const groupSearchByMemberService = (obj) => {
  return request.post('/groupmng/searchGroupByMember', getReqBody(obj))
}

export const groupInfoService = (obj) => {
  return request.post('/groupmng/queryGroupInfo', getReqBody(obj))
}

export const groupAddMembersService = (obj) => {
  return request.post('/groupmng/addMembers', getReqBody(obj))
}

export const groupDelMembersService = (obj) => {
  return request.post('/groupmng/delMembers', getReqBody(obj))
}

export const groupUpdateInfoService = (obj) => {
  return request.post('/groupmng/updateGroupInfo', getReqBody(obj))
}

export const groupChangeRoleService = (obj) => {
  return request.post('/groupmng/changeRole', getReqBody(obj))
}

export const groupUpdateNickNameService = (obj) => {
  return request.post('/groupmng/updateGroupNickName', getReqBody(obj))
}

export const groupLeaveService = (obj) => {
  return request.post('/groupmng/leaveGroup', getReqBody(obj))
}

export const groupDropService = (obj) => {
  return request.post('/groupmng/dropGroup', getReqBody(obj))
}

export const groupOwnerTransferService = (obj) => {
  return request.post('/groupmng/ownerTransfer', getReqBody(obj))
}

export const groupUpdateMuteService = (obj) => {
  return request.post('/groupmng/updateMute', getReqBody(obj))
}
