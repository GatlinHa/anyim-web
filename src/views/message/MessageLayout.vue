<!-- eslint-disable prettier/prettier -->
<script setup>
import { ref } from 'vue'
import DragLine from '@/components/common/DragLine.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import AddBotton from '@/components/common/AddBotton.vue'
import SessionBox from '@/components/message/SessionBox.vue'
import { settingStore } from '@/stores'

const settingData = settingStore()
const asideWidth = ref(settingData.sessionListDrag || 200)
const widthMin = 200
const widthMax = 500

const onDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag(width)
}

const testUsers = [
  {
    account: 'a123456',
    avatar: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/fc0eff1f-ac2e-4a09-abd0-f834615137e7/微信图片_20240327170045.jpg',
    avatarThumb: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/e1c5b5d3-17d5-4603-9a3e-6985142455e3/微信图片_20240327170045-thumb.jpg',
    birthday: '2000-01-01',
    email: '312777916@qq.com',
    level: 1,
    nickName: '我是Bob呀！',
    phoneNum: '13511111111',
    sex: 1,
    signature: '真的要坚持，才会有希望啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
    organize: '消费者BG/2012实验室/海斯开发部/运营部/西安项目组/第五小组',
    base: '西安'
  },
  {
    account: 'Asdasdasd',
    avatar: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/fc0eff1f-ac2e-4a09-abd0-f834615137e7/微信图片_20240327170045.jpg',
    avatarThumb: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/e1c5b5d3-17d5-4603-9a3e-6985142455e3/微信图片_20240327170045-thumb.jpg',
    birthday: '2000-01-01',
    email: '312777916@qq.com',
    level: 1,
    nickName: '我是A',
    phoneNum: '13511111111',
    sex: 1,
    signature: ''
  },
  {
    account: 'Bsdasdasd',
    avatar: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/fc0eff1f-ac2e-4a09-abd0-f834615137e7/微信图片_20240327170045.jpg',
    avatarThumb: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/e1c5b5d3-17d5-4603-9a3e-6985142455e3/微信图片_20240327170045-thumb.jpg',
    birthday: '2000-01-01',
    email: '312777916@qq.com',
    level: 1,
    nickName: '我是B',
    phoneNum: '13511111111',
    sex: 1,
    signature: 'AAAAAAAAAAAA'
  },
  {
    account: 'Csdasdasd',
    avatar: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/fc0eff1f-ac2e-4a09-abd0-f834615137e7/微信图片_20240327170045.jpg',
    avatarThumb: 'http://127.0.0.1:9001/anyim/IMAGE/20240831/e1c5b5d3-17d5-4603-9a3e-6985142455e3/微信图片_20240327170045-thumb.jpg',
    birthday: '2000-01-01',
    email: '312777916@qq.com',
    level: 1,
    nickName: '我是C',
    phoneNum: '13511111111',
    sex: 1,
    signature: 'AAAAAAAAAAAA'
  },
]
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
          <SessionBox v-for="user in testUsers" :key="user.account" :user="user"></SessionBox>
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
