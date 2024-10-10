import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores/index'
import '@/assets/main.scss'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
