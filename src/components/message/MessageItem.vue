<script setup>
import { computed } from 'vue'
import { msgType } from '@/const/msgConst'
import { userStore } from '@/stores'
import { messageShowTime } from '@/utils/common'

const props = defineProps(['type', 'objectInfo', 'content'])

const userData = userStore()

const isSelf = computed(() => {
  return userData.user.account === props.objectInfo.account
})

const showTime = computed(() => {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
  return messageShowTime(oneDayAgo)
})
</script>

<template>
  <div v-if="props.type === msgType.NO_MORE_MSG" class="no-more-message">
    <span>当前无更多消息</span>
  </div>
  <div v-if="props.type === msgType.USER_MSG" class="user-message">
    <span class="datetime">{{ showTime }}</span>
    <div>
      <el-container v-if="isSelf">
        <el-main>Main</el-main>
        <el-aside width="30px">Aside</el-aside>
      </el-container>
      <el-container v-else>
        <el-aside width="30px">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.no-more-message {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: gray;
}

.user-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .datetime {
    // height: 30px;
    border-radius: 2px;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 14px;
    background-color: #c8c9cc;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.el-container {
  width: 100%;
  display: flex;
}
</style>
