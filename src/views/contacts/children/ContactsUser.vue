<script setup>
import { ref } from 'vue'
import lastIcon from '@/assets/svg/last.svg'
import markIcon from '@/assets/svg/mark.svg'
import partitionIcon from '@/assets/svg/partition.svg'
import { msgChatSessionListService } from '@/api/message'
import { messageStore } from '@/stores'

const messageData = messageStore()
const indexActive = ref('last')
const lastData = ref({})

const onSelect = (key) => {
  console.log('onSelect触发了')

  indexActive.value = key
  switch (key) {
    case 'last':
      initLastData()
      break
    case 'mark':
      break
    case 'partition':
      break
  }
}

const initLastData = async () => {
  if (!messageData.sessionList) {
    const res = await msgChatSessionListService()
    messageData.setSessionList(res.data.data) //入缓存
  }

  Object.keys(messageData.sessionList).forEach((key) => {
    const lastMsgTime = messageData.sessionList[key].lastMsgTime
    if (Date.now().getTime() - lastMsgTime.getTime() < 24 * 60 * 60 * 1000) {
      lastData.value[key] = messageData.sessionList[key]
    }
  })
}
</script>

<template>
  <el-container class="constact-user">
    <el-header class="bdr-b el-header__contact-user">联系人</el-header>
    <el-container>
      <el-aside class="bdr-r el-aside__contact-user">
        <el-menu default-active="last" @select="onSelect">
          <el-menu-item index="last">
            <lastIcon></lastIcon>
            <span>最近1天</span>
          </el-menu-item>
          <el-menu-item index="mark">
            <markIcon></markIcon>
            <span>备注</span>
          </el-menu-item>
          <el-menu-item index="partition">
            <partitionIcon></partitionIcon>
            <span>分组</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container v-if="indexActive === 'last'" class="el-container__last">
        <el-header class="bdr-b el-header__last" style="height: 48px">last</el-header>
        <el-main class="el-main__last my-scrollbar"> </el-main>
      </el-container>
      <el-container v-if="indexActive === 'mark'" class="el-container__mark">
        <el-header class="bdr-b el-header__mark" style="height: 48px">mark</el-header>
        <el-main class="el-main__mark my-scrollbar"></el-main>
      </el-container>
      <el-container v-if="indexActive === 'partition'" class="el-container__partition">
        <el-header class="bdr-b el-header__partition" style="height: 48px">partition</el-header>
        <el-main class="el-main__partition my-scrollbar"></el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.constact-user {
  height: 100%;
}

.el-header__contact-user {
  width: 100%;
  height: 48px;
  line-height: 60px;
  padding-left: 15px;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.el-aside__contact-user {
  width: 200px;
  height: 100%;
  padding: 8px;
}

.el-menu {
  --el-menu-bg-color: #f5f5f5;
  border: 0;
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 5px;

  &:hover {
    background-color: #dedfe0;
  }
}

.is-active {
  --fillColor: #409eff;
  background-color: #dedfe0;
  //文字颜色默认是#409eff，可以用color修改
}

.svg-icon {
  width: 20px;
  height: 20px;
  fill: var(--fillColor);
  margin-right: 8px;
  transition: fill var(--el-transition-duration); //过度时长沿用el-menu-item的
}
</style>
