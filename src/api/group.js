import request from '@/js/utils/request'
import { getReqBody } from '@/api/common'

export const groupCreateService = (obj) => {
  return request.post('/groupmng/createGroup', getReqBody(obj))
}

export const groupListAllService = () => {
  return request.post('/groupmng/queryGroupList', getReqBody())
}

export const groupListCreatedService = () => {
  return request.post(
    '/groupmng/queryGroupList',
    getReqBody({
      roleList: [2]
    })
  )
}

export const groupListManagedService = () => {
  return request.post(
    '/groupmng/queryGroupList',
    getReqBody({
      roleList: [1, 2]
    })
  )
}

export const groupListJoinedService = () => {
  return request.post(
    '/groupmng/queryGroupList',
    getReqBody({
      roleList: [0]
    })
  )
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
