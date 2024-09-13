import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userInfoService } from '@/api/user'
import { refreshToken } from '@/api/user'

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
    const getAccessToken = async () => {
      const now = new Date().getTime()
      if (at.value.expiretime && now < at.value.expiretime) {
        return at.value.token
      } else {
        const res = await refreshToken()
        setAt(res.data.data.accessToken)
        return at.value.token
      }
    }
    const getRefreshToken = () => {
      return rt.value.token
    }
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

    const isRemenberMe = ref(false)

    const setIsRemenberMe = (flag) => {
      isRemenberMe.value = flag
    }

    const clientId = ref('')

    const setClientId = (id) => {
      clientId.value = id
    }

    return {
      at,
      rt,
      setAt,
      setRt,
      getAccessToken,
      getRefreshToken,
      clearAt,
      clearRt,
      user,
      getUser,
      setUser,
      isRemenberMe,
      setIsRemenberMe,
      clientId,
      setClientId
    }
  },
  {
    persist: true
  }
)
