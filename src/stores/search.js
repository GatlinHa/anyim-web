import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 不持久化存储
export const searchStore = defineStore('anyim-search', () => {
  const keywords = ref('')

  const setKeywords = (words) => {
    keywords.value = words
  }

  const contactResult = ref({})

  const addContactResult = (result) => {
    contactResult.value[keywords.value] = result
  }

  const getContactResult = computed(() => {
    return contactResult.value[keywords.value] || []
  })

  return {
    keywords,
    setKeywords,
    contactResult,
    addContactResult,
    getContactResult
  }
})
