import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userInfoService } from '@/api/user'
import { USER_DATA_EXPIRE } from '@/const/userConst'

// 用户模块
export const userStore = defineStore(
  'anyim-user',
  () => {
    const at = ref({
      token: '',
      secret: '',
      expiretime: null
    })
    const rt = ref({
      token: '',
      secret: '',
      expiretime: null
    })
    const setAt = (newAt) => {
      const now = new Date()
      at.value = {
        token: newAt.token,
        secret: newAt.secret,
        expiretime: new Date(now.getTime() + newAt.expire * 1000)
      }
    }
    const setRt = (newRt) => {
      const now = new Date()
      rt.value = {
        token: newRt.token,
        secret: newRt.secret,
        expiretime: new Date(now.getTime() + newRt.expire * 1000)
      }
    }
    const clearAt = () => {
      at.value = {
        token: '',
        secret: '',
        expiretime: null
      }
    }
    const clearRt = () => {
      rt.value = {
        token: '',
        secret: '',
        expiretime: null
      }
    }

    const user = ref({})
    const loginTime = ref(0)
    const getUser = async () => {
      const now = new Date().getTime()
      if (loginTime.value === 0 || now - loginTime.value > USER_DATA_EXPIRE * 1000) {
        const res = await userInfoService()
        user.value = res.data.data
        loginTime.value = now
      }
    }
    const getUserForce = async () => {
      const res = await userInfoService()
      user.value = res.data.data
      loginTime.value = new Date().getTime()
    }
    const setUser = (obj) => {
      user.value = obj
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
      getUserForce,
      setUser,
      loginTime
    }
  },
  {
    persist: true
  }
)
