import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 不持久化存储
export const searchStore = defineStore('anyim-search', () => {
  const keywords = ref('')

  const setKeywords = (words) => {
    keywords.value = words
  }

  const contactResult = ref({})
  const groupResult = ref({})
  const organizationResult = ref({})
  const hisotryResult = ref({})
  const todoResult = ref({})

  const addContactResult = (result) => {
    contactResult.value[keywords.value] = result
  }

  const getContactResult = computed(() => {
    return contactResult.value[keywords.value] || []
  })

  const addGroupResult = (result) => {
    groupResult.value[keywords.value] = result
  }

  const getGroupResult = computed(() => {
    return groupResult.value[keywords.value] || []
  })

  const addOrganizationResult = (result) => {
    organizationResult.value[keywords.value] = result
  }

  const getOrganizationResult = computed(() => {
    return organizationResult.value[keywords.value] || []
  })

  const addHisotryResult = (result) => {
    hisotryResult.value[keywords.value] = result
  }

  const getHisotryResult = computed(() => {
    return hisotryResult.value[keywords.value] || []
  })

  const addTodoResult = (result) => {
    todoResult.value[keywords.value] = result
  }

  const getTodoResult = computed(() => {
    return todoResult.value[keywords.value] || []
  })

  const clear = () => {
    keywords.value = ''
    contactResult.value = {}
    groupResult.value = {}
    organizationResult.value = {}
    hisotryResult.value = {}
    todoResult.value = {}
  }

  return {
    keywords,
    setKeywords,

    contactResult,
    groupResult,
    organizationResult,
    hisotryResult,
    todoResult,

    addContactResult,
    getContactResult,
    addGroupResult,
    getGroupResult,
    addOrganizationResult,
    getOrganizationResult,
    addHisotryResult,
    getHisotryResult,
    addTodoResult,
    getTodoResult,

    clear
  }
})
