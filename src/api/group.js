import request from '@/js/utils/request'

export const groupCreateService = (obj) => {
  return request.post('/groupmng/createGroup', obj)
}

export const groupInfoListService = () => {
  return request.get('/groupmng/queryGroupList')
}

export const groupSearchMemberService = (obj) => {
  return request.get('/groupmng/searchGroupMember', { params: obj })
}

export const groupInfoService = (obj) => {
  return request.get('/groupmng/queryGroupInfo', { params: obj })
}

export const groupAddMembersService = (obj) => {
  return request.post('/groupmng/addMembers', obj)
}

export const groupDelMembersService = (obj) => {
  return request.post('/groupmng/delMembers', obj)
}

export const groupUpdateInfoService = (obj) => {
  return request.post('/groupmng/updateGroupInfo', obj)
}

export const groupChangeRoleService = (obj) => {
  return request.post('/groupmng/changeRole', obj)
}

export const groupUpdateNickNameInGroupService = (obj) => {
  return request.post('/groupmng/updateNickNameInGroup', obj)
}

export const groupLeaveService = (obj) => {
  return request.post('/groupmng/leaveGroup', obj)
}

export const groupDropService = (obj) => {
  return request.post('/groupmng/dropGroup', obj)
}

export const groupOwnerTransferService = (obj) => {
  return request.post('/groupmng/ownerTransfer', obj)
}

export const groupUpdateMuteService = (obj) => {
  return request.post('/groupmng/updateMute', obj)
}

export const groupSearchGroupInfoService = (obj) => {
  return request.get('/groupmng/searchGroupInfo', { params: obj })
}
