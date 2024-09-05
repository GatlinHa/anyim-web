<!-- eslint-disable prettier/prettier -->
<script setup>
import { ref, onMounted } from 'vue'
import { 
  Phone, 
  VideoCamera, 
  Position, 
  CirclePlus,
  Setting, 
  LocationInformation, 
  Clock, 
  Picture,
  FolderAdd,
  CreditCard,
  PictureRounded
} from '@element-plus/icons-vue'
import DragLine from '@/components/common/DragLine.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import AddBotton from '@/components/common/AddBotton.vue'
import SessionBox from '@/components/message/SessionBox.vue'
import InputTool from '@/components/message/InputTool.vue'
import InputEditor from '@/components/message/InputEditor.vue'
import { settingStore, messageStore } from '@/stores'
import backgroupImage from '@/assets/messagebx_bg.webp'

const settingData = settingStore()
const messageData = messageStore()

const asideWidth = ref(settingData.sessionListDrag || 200)
const asideWidthMin = 200
const asideWidthMax = 500

const inputBoxHeight = ref(settingData.inputBoxDrag || 200)
const inputBoxHeightMin = 150
const inputBoxHeightMax = 400

const curSessionId = ref('')
const curChatObject = ref({})



onMounted(() => {
  curSessionId.value = messageData.lastSessionId
  curChatObject.value = messageData.lastChatObj
})

const onAsideDragUpdate = ({ width }) => {
  asideWidth.value = width
  settingData.setSessionListDrag(width)
}

const onInputBoxDragUpdate = ({ height }) => {
  inputBoxHeight.value = height
  settingData.setInputBoxDrag(height)
}

const handleExportData = (data) => {
  curSessionId.value = data.sessionId
  curChatObject.value = data.chatObj
  messageData.setLastSessionId(data.sessionId)
  messageData.setLastChatObj(data.chatObj)
}

const testItems = [
  {
    session_id: '00000001',
    user: 
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
    }
  },
  {
    session_id: '00000002',
    user: 
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
    }
  },
  {
    session_id: '00000003',
    user: 
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
    }
  },
  {
    session_id: '00000004',
    user: 
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
    }
  }]
</script>

<template>
  <el-container class="msg-container-hole">
    <el-aside class="msg-aside bdr-r" :style="{ width: asideWidth + 'px' }">
      <div class="msg-aside-main">
        <div class="header">
          <SearchBox></SearchBox>
          <AddBotton></AddBotton>
        </div>
        <div class="session-list">
          <SessionBox
            v-for="item in testItems"
            :key="item.session_id"
            :user="item.user"
            :sessionId="item.session_id"
            @exportData="handleExportData"
          ></SessionBox>
        </div>
      </div>

      <DragLine
        direction="right"
        :min="asideWidthMin"
        :max="asideWidthMax"
        :origin-size="asideWidth"
        @drag-update="onAsideDragUpdate"
      ></DragLine>
    </el-aside>

    <el-main class="msg-box">
      <el-image
        class="backgroup-image"
        v-if="!curSessionId"
        :src="backgroupImage"
        fit="cover"
      ></el-image>

      <el-container class="container">
        <el-header class="header bdr-b">
          <span class="show-nickname">{{ curChatObject.nickName }}</span>
          <div class="action-set">
            <el-button class="action-button" :icon="Phone" circle />
            <el-button class="action-button" :icon="VideoCamera" circle />
            <el-button class="action-button" :icon="Position" circle />
            <el-button class="action-button" :icon="CirclePlus" circle />
            <el-button class="action-button" :icon="Setting" circle />
          </div>
        </el-header>
        <el-main class="body">
          <div class="show-box"></div>
          <div class="input-box bdr-t" :style="{ height: inputBoxHeight + 'px' }">
            <el-container class="input-box-container">
              <el-header class="input-box-header">
                <DragLine
                  direction="top"
                  :min="inputBoxHeightMin"
                  :max="inputBoxHeightMax"
                  :origin-size="inputBoxHeight"
                  @drag-update="onInputBoxDragUpdate"
                ></DragLine>
                <div class="tool-set">
                  <div class="left-tools">
                    <InputTool tips="表情">
                      <template #iconSlot>
                        <PictureRounded />
                      </template>
                    </InputTool>
                    <InputTool tips="图片">
                      <template #iconSlot>
                        <Picture />
                      </template>
                    </InputTool>
                    <InputTool tips="文件">
                      <template #iconSlot>
                        <FolderAdd />
                      </template>
                    </InputTool>
                    <InputTool tips="代码">
                      <template #iconSlot>
                        <CreditCard />
                      </template>
                    </InputTool>
                    <InputTool tips="位置">
                      <template #iconSlot>
                        <LocationInformation />
                      </template>
                    </InputTool>
                  </div>
                  <div class="right-tools">
                    <InputTool tips="历史记录">
                      <template #iconSlot>
                        <Clock />
                      </template>
                    </InputTool>
                  </div>
                </div>
              </el-header>
              <el-main class="input-box-main">
                <InputEditor></InputEditor>
              </el-main>
              <el-footer class="input-box-footer">
                <el-button type="primary">发送</el-button>
              </el-footer>
            </el-container>
          </div>
        </el-main>
      </el-container>
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
        margin-top: 10px;
        margin-bottom: 10px;
      }
    }
  }

  .msg-box {
    padding: 0;

    .backgroup-image {
      width: 100%;
      height: 100%;
    }

    .container {
      width: 100%;
      height: 100%;

      .header {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .show-nickname {
          font-size: 16px;
          font-weight: bold;
        }

        .action-set {
          margin-right: 20px;

          .action-button {
            border: 0;
          }
        }
      }

      .body {
        width: 100%;
        height: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;

        .show-box {
          width: 100%;
          flex: 1;
        }

        .input-box {
          width: 100%;
          display: flex;
          position: relative;

          .input-box-header {
            width: 100%;
            height: 45px;
            padding: 0;

            .tool-set {
              display: flex;
              justify-content: space-between;

              .left-tools {
                display: flex;
              }

              .right-tools {
                margin-right: 10px;
              }

              .tool-icon {
                margin: 10px;

                &:hover {
                  background-color: red;
                }
              }
            }
          }

          .input-box-main {
            width: 100%;
            padding: 0;
            // flex: 1;
          }

          .input-box-footer {
            width: 100%;
            height: 32px;
            padding: 0px;
            display: flex;
            justify-content: flex-end;

            .el-button {
              margin-right: 0px;
            }
          }
        }
      }
    }
  }
}
</style>
