import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userInfoService } from '@/api/user'

// 用户模块
export const userStore = defineStore(
  'anyim-user',
  () => {
    const at = ref({
      token: '',
      secret: '',
      expiretime: 0
    })
    const rt = ref({
      token: '',
      secret: '',
      expiretime: 0
    })
    const setAt = (newAt) => {
      const now = new Date()
      at.value = {
        token: newAt.token,
        secret: newAt.secret,
        expiretime: now.getTime() + newAt.expire * 1000
      }
    }
    const setRt = (newRt) => {
      const now = new Date()
      rt.value = {
        token: newRt.token,
        secret: newRt.secret,
        expiretime: now.getTime() + newRt.expire * 1000
      }
    }
    const clearAt = () => {
      at.value = {
        token: '',
        secret: '',
        expiretime: 0
      }
    }
    const clearRt = () => {
      rt.value = {
        token: '',
        secret: '',
        expiretime: 0
      }
    }

    const user = ref({})

    const getUser = async () => {
      const res = await userInfoService()
      user.value = res.data.data
    }

    const setUser = (obj) => {
      user.value = obj
    }

    const isAtExpired = () => {
      const now = new Date().getTime()
      return at.value.expiretime && now > at.value.expiretime
    }

    const isRemenberMe = ref(false)

    const setIsRemenberMe = (flag) => {
      isRemenberMe.value = flag
    }

    return {
      at,
      rt,
      setAt,
      setRt,
      clearAt,
      clearRt,
      user,
      getUser,
      setUser,
      isAtExpired,
      isRemenberMe,
      setIsRemenberMe
    }
  },
  {
    persist: true
  }
)
