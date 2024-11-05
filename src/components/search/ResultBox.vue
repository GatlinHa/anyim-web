<script setup>
import HashNoData from '../common/HasNoData.vue'
import ContactItem from '@/components/item/ContactItem.vue'
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
    <div v-if="searchTab === 'contact' && Object.keys(searchData.getContactResult).length">
      <ContactItem
        v-for="account in Object.keys(searchData.getContactResult)"
        :key="account"
        :contactInfo="searchData.getContactResult[account]"
        @showContactCard="onShowContactCard"
        @openSession="onOpenSession"
      ></ContactItem>
    </div>
    <div
      v-else-if="props.searchTab === 'group' && Object.keys(searchData.getGroupResult).length"
    ></div>
    <div
      v-else-if="
        props.searchTab === 'organization' && Object.keys(searchData.getOrganizationResult).length
      "
    ></div>
    <div
      v-else-if="props.searchTab === 'hisotry' && Object.keys(searchData.getHisotryResult).length"
    ></div>
    <div
      v-else-if="props.searchTab === 'todo' && Object.keys(searchData.getTodoResult).length"
    ></div>
    <HashNoData v-else></HashNoData>
  </div>
</template>

<style lang="scss" scoped>
.result-box {
  height: 100%;
  margin: 10px;
  overflow-x: hidden;
  overflow-y: auto;
}

.contact-item:hover {
  background-color: #c6e2ff;
}

// 全局样式是hover才能看到滑块，这里需要一直显示滑块
.my-scrollbar {
  &::-webkit-scrollbar-thumb {
    background-color: #409eff;
  }
}
</style>
