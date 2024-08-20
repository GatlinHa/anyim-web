import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户模块 groupxx setGroupxx......
export const groupStore = defineStore(
  'anyim-group',
  () => {
    const groupxx = ref('')
    const setGroupxx = (newGroupxx) => {
      groupxx.value = newGroupxx
    }

    return {
      groupxx,
      setGroupxx
    }
  },
  {
    persist: true
  }
)
