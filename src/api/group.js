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
