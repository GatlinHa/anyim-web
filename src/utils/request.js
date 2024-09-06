import axios from 'axios'
import { userStore } from '@/stores'
import router from '@/router'
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION } from '@/const/userConst'

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
    if (config.url === '/user/refreshToken' && userData.rt.token !== '') {
      const traceId = uuidv4()
      const timestamp = Math.floor(new Date().getTime() / 1000)
      const sigh = generateSign(userData.rt.secret, `${traceId}${timestamp}`)
      config.headers.traceId = traceId
      config.headers.timestamp = timestamp
      config.headers.sign = sigh
      config.headers.refreshToken = userData.rt.token
    } else if (userData.at.token !== '') {
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
      console.log('0a 请求成功，请求是：' + res.config.url)
      return res
    }

    console.log('0b 请求响应结果码不是预期，请求是：' + res.config.url)
    ElMessage.error(res.data.desc || '服务异常')
    return Promise.reject(res.data)
  },
  async (err) => {
    if (err.response?.status === 403) {
      // 403表示访问禁止，由于AccessToken过期导致，所以凡是403请求均刷新token后重发
      console.log('0c 请求 ' + err.config.url + ' 出现了403，准备刷新token并重发这个请求')
      const retryRes = await refreshTokenAndRetry(err.config)
      return Promise.resolve(retryRes)
    } else if (err.response?.status === 401) {
      // 401错误返回登录页
      console.log('0d 请求 ' + err.config.url + ' 出现了401，直接报错处理')
      router.push('/login')
      ElMessage.error('您还未登录，请先登录')
    } else {
      ElMessage.error(err.response?.message || '服务异常')
    }

    return Promise.reject(err)
  }
)

let isRefreshing = false
let requestsQueue = []

const refreshTokenAndRetry = (config) => {
  console.log('01 准备发送refreshtoken请求，触发者是：' + config.url)

  const userData = userStore()
  const traceId = uuidv4()
  const timestamp = Math.floor(new Date().getTime() / 1000)
  const sigh = generateSign(userData.rt.secret, `${traceId}${timestamp}`)

  return new Promise((resolve, reject) => {
    if (isRefreshing) {
      console.log('02 进入等待队列，触发者是：' + config.url)
      requestsQueue.push({ resolve, reject, config })
    } else {
      console.log('03 开始refreshtoken，触发者是：' + config.url)
      isRefreshing = true
      axios
        .post(
          '/api/user/refreshToken',
          {
            clientType: CLIENT_TYPE,
            clientName: CLIENT_NAME,
            clientVersion: CLIENT_VERSION
          },
          {
            headers: {
              traceId,
              timestamp,
              sign: sigh,
              refreshToken: userData.rt.token
            }
          }
        )
        .then(async (refreshRes) => {
          if (refreshRes.data.code === 0) {
            userData.setAt(refreshRes.data.data.accessToken)
            console.log('04 得到refreshtoken正常结果，触发者是：' + config.url)
            const res = await instance(config)
            resolve(res)
            console.log('05 处理instance(config)，触发者是：' + config.url)

            while (requestsQueue.length > 0) {
              const { resolve, config } = requestsQueue.shift()
              const res = await instance(config)
              resolve(res)
              console.log('06 处理队列任务，触发者是：' + config.url)
            }
          } else {
            ElMessage.error(refreshRes.data.desc || '服务异常')
            reject(refreshRes.data)
          }
        })
        .catch((refreshErr) => {
          ElMessage.error('服务异常')
          reject(refreshErr)
        })
        .finally(() => {
          isRefreshing = false
        })
    }
  })
}

export default instance
export { baseURL }
