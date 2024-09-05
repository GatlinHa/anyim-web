import { defineStore } from 'pinia'
import { ref } from 'vue'

// 界面设置相关需要缓存的设置
export const settingStore = defineStore(
  'anyim-setting',
  () => {
    const sessionListDrag = ref(0)
    const inputBoxDrag = ref(0)

    const setSessionListDrag = (width) => {
      sessionListDrag.value = width
    }

    const setInputBoxDrag = (height) => {
      inputBoxDrag.value = height
    }

    return {
      sessionListDrag,
      inputBoxDrag,
      setSessionListDrag,
      setInputBoxDrag
    }
  },
  {
    persist: true
  }
)
