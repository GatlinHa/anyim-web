import axios from 'axios'
import { userStore } from '@/stores'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = '/api' //配合vite.config.js中的代理配置解决跨域问题

const instance = axios.create({
  baseURL,
  timeout: 3000
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const user = userStore()
    if (user.token) {
      config.headers.token = user.token
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

    ElMessage.error(res.data.msg || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    // 401错误返回登录页
    if (err.response?.status === 401) {
      router.push('/login')
    }

    //TODO token过期处理，刷新tokne再发一次请求

    ElMessage.error(err.response.message || '服务异常')
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
