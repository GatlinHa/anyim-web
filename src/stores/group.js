import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupListService } from '@/api/group'

// group群组相关的缓存数据，不持久化存储
export const groupStore = defineStore('anyim-group', () => {
  /**
   * 格式：{groupId_1: group_1, groupId_2: group_2}
   */
  const groupList = ref({})

  const setGroupList = (list) => {
    groupList.value = list
  }

  const addGroup = (groupInfo) => {
    groupList.value[groupInfo.groupId] = groupInfo
  }

  const deleteGroup = (groupId) => {
    delete groupList.value[groupId]
  }

  const updateGroup = () => {}

  const loadGroupList = async () => {
    if (Object.keys(groupList.value).length === 0) {
      const res = await groupListService()

      res.data.data.forEach((item) => {
        groupList.value[item.groupId] = item
      })
    }
  }

  return {
    groupList,
    setGroupList,
    addGroup,
    deleteGroup,
    updateGroup,
    loadGroupList
  }
})
