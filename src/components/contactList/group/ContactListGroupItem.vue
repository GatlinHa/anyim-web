<script setup>
// import { ref } from 'vue'
import { ChatRound, Phone, VideoCamera } from '@element-plus/icons-vue'
import GroupItem from '@/components/item/GroupItem.vue'
// import { sessionShowTime } from '@/js/utils/common'
// import router from '@/router'
// import { messageStore } from '@/stores'

const props = defineProps(['groupInfo'])
// const emit = defineEmits(['showGroupCard'])

const onShowGroupCard = () => {
  console.log('onShowGroupCard')
}

const goToSessionTab = () => {
  console.log('goToSessionTab')
  // router.push({
  //   path: '/message',
  //   query: {
  //     sessionId: props.session.sessionId
  //   }
  // })
}
</script>

<template>
  <div class="contactList-group-item">
    <div class="content-wrapper">
      <GroupItem
        :groupInfo="props.groupInfo"
        @showGroupCard="onShowGroupCard"
        style="width: 300px; margin-right: 20px"
      ></GroupItem>
      <slot name="showData"></slot>
      <div class="action">
        <el-button size="large" :icon="ChatRound" circle @click="goToSessionTab" />
        <el-button size="large" :icon="Phone" circle />
        <el-button size="large" :icon="VideoCamera" circle />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contactList-group-item {
  height: 40px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e9e9eb;
  display: flex;
  justify-content: space-between;

  &:hover {
    border: 1px solid #409eff;
  }
}

.content-wrapper {
  width: 100%;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: text;

  .action {
    margin-left: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
