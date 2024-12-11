<script setup>
import { ref, computed, onMounted } from 'vue'
import { MsgType } from '@/proto/msg'
import { ArrowRight } from '@element-plus/icons-vue'
import { userStore, settingStore, messageStore, groupStore } from '@/stores'
import DragLine from '@/components/common/DragLine.vue'

const props = defineProps(['sessionId'])
const emit = defineEmits(['showGroupCard'])

const userData = userStore()
const settingData = settingStore()
const messageData = messageStore()
const groupData = groupStore()

const msgGroupRightSideWidth = ref(0)
const announcementInSideHeight = ref(0)

const myAccount = computed(() => {
  return userData.user.account
})

onMounted(() => {
  msgGroupRightSideWidth.value = settingData.msgGroupRightSideDrag[myAccount.value] || 200
  announcementInSideHeight.value = settingData.announcementInSideDrag[myAccount.value] || 100
})

const sessionType = computed(() => {
  return messageData.sessionList[props.sessionId].sessionType
})

const groupId = computed(() => {
  return messageData.sessionList[props.sessionId].remoteId
})

const announcement = computed(() => {
  return groupData.groupInfoList[groupId.value].announcement || '暂无公告'
})

const onMsgGroupRightSideWidthDragUpdate = ({ width }) => {
  msgGroupRightSideWidth.value = width
  settingData.setMsgGroupRightSideDrag({
    ...settingData.msgGroupRightSideDrag,
    [myAccount.value]: width
  })
}

const onAnnouncementInSideHeightDragUpdate = ({ height }) => {
  announcementInSideHeight.value = height
  settingData.setAnnouncementInSideDrag({
    ...settingData.announcementInSideDrag,
    [myAccount.value]: height
  })
}

const onClickAnnouncement = () => {
  emit('showGroupCard', { groupId: groupId.value })
}
</script>

<template>
  <div
    v-if="sessionType === MsgType.GROUP_CHAT"
    class="msg-group-right-side bdr-l"
    :style="{ width: msgGroupRightSideWidth + 'px' }"
  >
    <DragLine
      direction="left"
      :min="200"
      :max="400"
      :origin-size="msgGroupRightSideWidth"
      @drag-update="onMsgGroupRightSideWidthDragUpdate"
    ></DragLine>
    <div
      class="announcement-in-side-wrapper bdr-b"
      :style="{ height: announcementInSideHeight + 'px' }"
    >
      <div style="height: 100%; display: flex; flex-direction: column">
        <div style="padding: 8px; display: flex; justify-content: space-between">
          <span>群公告</span>
          <el-icon style="cursor: pointer" @click="onClickAnnouncement"><ArrowRight /></el-icon>
        </div>
        <div class="announcement my-scrollbar">{{ announcement }}</div>
      </div>
      <DragLine
        direction="bottom"
        :min="100"
        :max="400"
        :origin-size="announcementInSideHeight"
        @drag-update="onAnnouncementInSideHeightDragUpdate"
      ></DragLine>
    </div>
    <div>群成员</div>
  </div>
</template>

<style lang="scss" scoped>
.msg-group-right-side {
  width: 200px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  position: relative;

  .announcement-in-side-wrapper {
    position: relative;

    .announcement {
      height: 0;
      padding: 0 4px 0 8px;
      display: flex;
      flex: 1;
      color: gray;
      overflow-y: scroll;
      white-space: normal;
      user-select: text;
      white-space: pre-wrap; //给文本中的\n换行
    }
  }
}
</style>
