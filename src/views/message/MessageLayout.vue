<script setup>
import { ref } from 'vue'
import DragLine from '@/components/common/DragLine.vue'
import { settingStore } from '@/stores'

const settingData = settingStore()
const asideWidth = ref(settingData.sessionListDrag || 250)
const widthMin = 150
const widthMax = 500

const onDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag(width)
}
</script>

<template>
  <el-container class="msg-container-hole">
    <el-aside class="msg-aside bdr-r" :style="{ width: asideWidth + 'px' }">
      <div>
        <div>搜索</div>
        <div>会话列表</div>
      </div>

      <DragLine
        direction="right"
        :min="widthMin"
        :max="widthMax"
        :origin-size="asideWidth"
        @drag-update="onDragUpdate"
      ></DragLine>
    </el-aside>

    <el-main>
      <div>聊天主体</div>
    </el-main>
  </el-container>
</template>

<style lang="scss">
.msg-container-hole {
  height: 100%;
  user-select: none;

  .msg-aside {
    height: 100%;
    position: relative;
  }
}
</style>
