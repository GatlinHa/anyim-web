<script setup>
import { ref } from 'vue'
import DragLine from '@/components/common/DragLine.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import AddBotton from '@/components/common/AddBotton.vue'
import SessionBox from '@/components/message/SessionBox.vue'
import { userStore, settingStore } from '@/stores'

const userData = userStore()
const settingData = settingStore()
const asideWidth = ref(settingData.sessionListDrag || 200)
const widthMin = 200
const widthMax = 500

const onDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag(width)
}
</script>

<template>
  <el-container class="msg-container-hole">
    <el-aside class="msg-aside bdr-r" :style="{ width: asideWidth + 'px' }">
      <div class="msg-aside-main">
        <div class="header bdr-b">
          <SearchBox></SearchBox>
          <AddBotton></AddBotton>
        </div>
        <div class="session-list">
          <SessionBox :user="userData.user"></SessionBox>
          <SessionBox
            :user="{ account: '22asdsss', avatarThumb: '', nickName: '李寻欢欢欢欢欢欢欢欢欢' }"
          ></SessionBox>
        </div>
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

<style lang="scss" scoped>
.msg-container-hole {
  height: 100%;
  user-select: none;

  .msg-aside {
    height: 100%;
    position: relative;

    .msg-aside-main {
      .header {
        display: flex;
        margin-top: 5px;
        padding-bottom: 5px;
      }
    }
  }
}
</style>
