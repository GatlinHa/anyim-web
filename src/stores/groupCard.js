import { defineStore } from 'pinia'
import { ref } from 'vue'
import {} from '@/api/group'

// groupCard群组详情卡片相关的缓存数据，不持久化存储
export const groupCardStore = defineStore('anyim-groupCard', () => {
  const isShow = ref(false)

  const groupId = ref({})

  const showModel = ref('')

  const changeMemberModel = ref('')

  const setIsShow = (flag) => {
    isShow.value = flag
  }

  const setGroupId = (id) => {
    groupId.value = id
  }

  const setShowModel = (model) => {
    showModel.value = model
  }

  const setChangeMemberModel = (model) => {
    changeMemberModel.value = model
  }

  return {
    isShow,
    groupId,
    showModel,
    changeMemberModel,

    setIsShow,
    setGroupId,
    setShowModel,
    setChangeMemberModel
  }
})
