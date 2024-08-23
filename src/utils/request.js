import axios from 'axios'
import { userStore } from '@/stores'
import { ElMessage } from 'element-plus'
import router from '@/router'
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'

const baseURL = '/api' //配合vite.config.js中的代理配置解决跨域问题

const instance = axios.create({
  baseURL,
  timeout: 3000
})

const generateSign = (key, content) => {
  try {
    const hash = CryptoJS.HmacSHA256(content, key)
    return CryptoJS.enc.Base64.stringify(hash)
  } catch (e) {
    return null
  }
}

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userData = userStore()
    if (userData.at) {
      const traceId = uuidv4()
      const timestamp = Math.floor(new Date().getTime() / 1000)
      const sigh = generateSign(userData.at.secret, `${traceId}${timestamp}`)
      config.headers.traceId = traceId
      config.headers.timestamp = timestamp
      config.headers.sign = sigh
      config.headers.accessToken = userData.at.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    if (res.data.code === 0) {
      return res
    }

    ElMessage.error(res.data.desc || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    // 401错误返回登录页
    if (err.response?.status === 401) {
      router.push('/login')
      ElMessage.error('您还未登录，请先登录！')
    } else {
      ElMessage.error(err.response.message || '服务异常')
    }

    //TODO token过期处理，刷新tokne再发一次请求

    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
