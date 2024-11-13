import { defineStore } from 'pinia'
import { ref } from 'vue'
import {} from '@/api/group'

// groupCard群组详情卡片相关的缓存数据，不持久化存储
export const groupCardStore = defineStore('anyim-groupCard', () => {
  const isShow = ref(false)

  const groupInfo = ref({})

  const setIsShow = (flag) => {
    isShow.value = flag
  }

  const setGroupInfo = (info) => {
    groupInfo.value = info
  }

  return {
    isShow,
    groupInfo,

    setIsShow,
    setGroupInfo
  }
})
