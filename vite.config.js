import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 配置代理
  server: {
    proxy: {
      '/api': {
        // 获取请求中带 /api 的请求
        target: 'http://localhost', // 后台服务器的源
        changeOrigin: true, // 修改源
        rewrite: (path) => path.replace(/^\/api/, '') //  /api 替换为空字符串
      }
    }
  }
})
