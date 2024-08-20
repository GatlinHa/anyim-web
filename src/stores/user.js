import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户模块 token setToken......
export const userStore = defineStore(
  'anyim-user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }

    return {
      token,
      setToken
    }
  },
  {
    persist: true
  }
)
