<script setup>
import ContactItem from './ResultItem/ContactItem.vue'
import { searchStore } from '@/stores'

const props = defineProps(['searchTab'])
const emit = defineEmits(['showContactCard', 'openSession'])

const searchData = searchStore()

const onShowContactCard = (contactInfo) => {
  emit('showContactCard', contactInfo)
}

const onOpenSession = (obj) => {
  emit('openSession', obj)
}
</script>

<template>
  <div class="result-box my-scrollbar">
    <div v-if="searchTab === 'contact'">
      <ContactItem
        v-for="account in Object.keys(searchData.getContactResult)"
        :key="account"
        :contactInfo="searchData.getContactResult[account]"
        @showContactCard="onShowContactCard"
        @openSession="onOpenSession"
      ></ContactItem>
    </div>
    <div v-else-if="props.searchTab === 'group'"></div>
    <div v-else-if="props.searchTab === 'organization'"></div>
    <div v-else-if="props.searchTab === 'hisotry'"></div>
    <div v-else-if="props.searchTab === 'todo'"></div>
  </div>
</template>

<style lang="scss" scoped>
.result-box {
  margin: 10px;
  overflow-x: hidden;
  overflow-y: auto;
}

// 全局样式是hover才能看到滑块，这里需要一直显示滑块
.my-scrollbar {
  &::-webkit-scrollbar-thumb {
    background-color: #409eff;
  }
}
</style>
