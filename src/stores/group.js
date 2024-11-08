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
   * 格式：{groupId_1: group_1, groupId_2: group_2}
   */
  const groupListAll = ref({})

  const groupListCreated = ref({})

  const groupListManaged = ref({})

  const groupListJoined = ref({})

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

      res.data.data.forEach((item) => {
        groupListAll.value[item.groupId] = item
      })
    }
  }

  const loadGroupListCreated = async () => {
    if (Object.keys(groupListCreated.value).length === 0) {
      const res = await groupListCreatedService()

      res.data.data.forEach((item) => {
        groupListCreated.value[item.groupId] = item
      })
    }
  }

  const loadGroupListManaged = async () => {
    if (Object.keys(groupListManaged.value).length === 0) {
      const res = await groupListManagedService()

      res.data.data.forEach((item) => {
        groupListManaged.value[item.groupId] = item
      })
    }
  }

  const loadGroupListJoined = async () => {
    if (Object.keys(groupListJoined.value).length === 0) {
      const res = await groupListJoinedService()

      res.data.data.forEach((item) => {
        groupListJoined.value[item.groupId] = item
      })
    }
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
    loadGroupListJoined
  }
})
