import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  groupListAllService,
  groupListCreatedService,
  groupListJoinedService,
  groupListManagedService
} from '@/api/group'

// group群组相关的缓存数据，不持久化存储
export const groupStore = defineStore('anyim-group', () => {
  /**
   * 和我有关的所有群组，格式：{groupId_1: group_1, groupId_2: group_2}
   */
  const groupListAll = ref({})

  /**
   * 我创建的群组
   */
  const groupListCreated = ref({})
  /**
   * 我管理的群组
   */
  const groupListManaged = ref({})
  /**
   * 我加入的群组
   */
  const groupListJoined = ref({})

  /**
   * 群组成员，格式：双层对象结构，编译数据检索，第一层的key是groupId，第二层的key是account
   * {groupId_1: [accoount1: {accoount: xx, nickName: xx,...}, ...], groupId_2: {...}}
   */
  const groupMembers = ref({})

  const addCreatedGroup = (groupInfo) => {
    groupListAll.value[groupInfo.groupId] = groupInfo
    groupListCreated.value[groupInfo.groupId] = groupInfo
    groupListManaged.value[groupInfo.groupId] = groupInfo
  }

  const deleteGroup = (groupId) => {
    delete groupListAll.value[groupId]
    delete groupListCreated.value[groupId]
    delete groupListManaged.value[groupId]
    delete groupListJoined.value[groupId]
  }

  const updateGroup = () => {}

  const loadGroupListAll = async () => {
    if (Object.keys(groupListAll.value).length === 0) {
      const res = await groupListAllService()
      res.data.data?.forEach((item) => {
        groupListAll.value[item.groupId] = item
      })
    }
  }

  const loadGroupListCreated = async () => {
    if (Object.keys(groupListCreated.value).length === 0) {
      const res = await groupListCreatedService()
      res.data.data?.forEach((item) => {
        groupListCreated.value[item.groupId] = item
      })
    }
  }

  const loadGroupListManaged = async () => {
    if (Object.keys(groupListManaged.value).length === 0) {
      const res = await groupListManagedService()
      res.data.data?.forEach((item) => {
        groupListManaged.value[item.groupId] = item
      })
    }
  }

  const loadGroupListJoined = async () => {
    if (Object.keys(groupListJoined.value).length === 0) {
      const res = await groupListJoinedService()
      res.data.data?.forEach((item) => {
        groupListJoined.value[item.groupId] = item
      })
    }
  }

  /**
   * 这里只做全量更新，不做增量更新
   * @param {} param0
   */
  const setGroupMembers = ({ groupId, members }) => {
    groupMembers.value[groupId] = members
  }

  return {
    groupListAll,
    groupListCreated,
    groupListManaged,
    groupListJoined,

    addCreatedGroup,
    deleteGroup,
    updateGroup,

    loadGroupListAll,
    loadGroupListCreated,
    loadGroupListManaged,
    loadGroupListJoined,

    groupMembers,

    setGroupMembers
  }
})
