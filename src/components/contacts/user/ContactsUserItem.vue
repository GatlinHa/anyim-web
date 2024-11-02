<script setup>
import { ref, nextTick } from 'vue'
import { ChatRound, Phone, VideoCamera, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import AvatarIcon from '@/components/common/AvatarIcon.vue'
import { sessionShowTime } from '@/js/utils/common'
import router from '@/router'
import { messageStore } from '@/stores'

const props = defineProps(['type', 'session', 'partitions'])
const emit = defineEmits(['showUserCard'])

const messageData = messageStore()

const markEditing = ref(false)
const newMark = ref('')
const markEditRef = ref()

const newPartitionId = ref(props.session.partitionId)

const onShowCard = () => {
  emit('showUserCard', {
    sessionId: props.session.sessionId,
    account: props.session.objectInfo.account
  })
}

const onClickEditMark = () => {
  newMark.value = props.session.mark || ''
  markEditing.value = true
  nextTick(() => {
    markEditRef.value.focus()
  })
}

const saveMark = () => {
  if (newMark.value.trim() !== props.session.mark) {
    const sessionId = props.session.sessionId
    messageData.updateSession({
      sessionId: sessionId,
      mark: newMark.value.trim()
    })
  }
  markEditing.value = false
}

const deleteMark = () => {
  if (!props.session.mark) {
    return
  } else {
    newMark.value = ''
    saveMark()
  }
}

const cancelMark = () => {
  markEditing.value = false
}

const onChangePartition = () => {
  if (newPartitionId.value !== props.session.partitionId) {
    const sessionId = props.session.sessionId
    messageData.updateSession({
      sessionId: sessionId,
      partitionId: newPartitionId.value
    })
  }
}

const onClearPartition = () => {
  const sessionId = props.session.sessionId
  messageData.updateSession({
    sessionId: sessionId,
    partitionId: 0 //和后端约定0表示不分组
  })
}

const goToSessionTab = () => {
  router.push({
    path: '/message',
    query: {
      sessionId: props.session.sessionId
    }
  })
}
</script>

<template>
  <div class="contacts-user-item">
    <div class="content-wrapper">
      <div class="avatar-name-account">
        <AvatarIcon
          class="avatar"
          :showName="props.session.objectInfo.nickName"
          :showId="props.session.objectInfo.account"
          :showAvatarThumb="props.session.objectInfo.avatarThumb"
          :userStatus="props.session.objectInfo.status"
          @click="onShowCard"
        ></AvatarIcon>
        <div class="name-account">
          <div class="nick-name text-ellipsis">{{ props.session.objectInfo.nickName }}</div>
          <div class="account text-ellipsis">{{ props.session.objectInfo.account }}</div>
        </div>
      </div>
      <div class="organization text-ellipsis" :title="props.session.objectInfo.organization">
        {{ props.session.objectInfo.organization || '没有部门' }}
      </div>
      <div class="diff-display">
        <div v-if="props.type === 'last'" class="last">
          <div class="tips-block">{{ sessionShowTime(props.session.lastMsgTime) }}</div>
          <div class="last-content text-ellipsis" :title="props.session.lastMsgContent">
            {{ props.session.lastMsgContent }}
          </div>
        </div>
        <div v-if="props.type === 'mark'" class="mark">
          <div class="tips-block">备注</div>
          <div v-if="!markEditing" class="mark-content-wrapper">
            <div
              class="mark-content text-ellipsis"
              :title="props.session.mark"
              @click="onClickEditMark"
            >
              {{ props.session.mark }}
            </div>
            <div>
              <el-button
                type="primary"
                :icon="Edit"
                size="small"
                circle
                @click="onClickEditMark"
              ></el-button>
              <el-button
                type="danger"
                :icon="Delete"
                size="small"
                circle
                @click="deleteMark"
              ></el-button>
            </div>
          </div>
          <div v-else class="mark-edit-wrapper">
            <el-input
              ref="markEditRef"
              class="mark-edit"
              v-model="newMark"
              maxlength="10"
              show-word-limit
              size="small"
              clearable
              @keyup.enter="saveMark"
            ></el-input>
            <div style="display: flex; flex-direction: row">
              <el-button
                type="success"
                :icon="Check"
                size="small"
                circle
                @click="saveMark"
              ></el-button>
              <el-button
                type="info"
                :icon="Close"
                size="small"
                circle
                @click="cancelMark"
              ></el-button>
            </div>
          </div>
        </div>
        <div v-if="props.type === 'partition'" class="partition">
          <div class="tips-block">分组</div>
          <div class="partition-content-wrapper">
            <el-select
              v-model="newPartitionId"
              placeholder="请选择分组"
              size="small"
              style="margin-left: 5px"
              @change="onChangePartition"
            >
              <el-option
                v-for="item in props.partitions"
                :key="item.partitionId"
                :label="item.partitionName"
                :value="item.partitionId"
              />
            </el-select>
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
              circle
              @click="onClearPartition"
              style="margin-left: 5px"
            ></el-button>
          </div>
        </div>
      </div>
      <div class="action">
        <el-button size="large" :icon="ChatRound" circle @click="goToSessionTab" />
        <el-button size="large" :icon="Phone" circle />
        <el-button size="large" :icon="VideoCamera" circle />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contacts-user-item {
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

  .avatar-name-account {
    display: flex;
    .avatar {
      margin-left: 10px;
    }

    .name-account {
      width: 100px;
      margin-left: 10px;

      .nick-name {
        padding: 0;
      }

      .account {
        padding: 0;
        color: gray;
      }
    }
  }

  .organization {
    width: 100px;
    margin-left: 20px;
  }

  .diff-display {
    height: 100%;
    margin-left: 20px;

    .tips-block {
      justify-content: start;
      border-radius: 4px;
      padding-left: 5px;
      padding-right: 5px;
      background: rgb(221.7, 222.6, 224.4);
      flex-shrink: 0;
    }

    .last {
      width: 200px;
      height: 100%;
      display: flex;
      align-items: center;

      .last-content {
        margin-left: 5px;
      }
    }

    .mark {
      height: 100%;
      display: flex;
      align-items: center;

      .mark-content-wrapper {
        width: 240px;
        display: flex;
        justify-content: space-between;

        .mark-content {
          margin-left: 5px;
          display: flex;
          align-items: center;
          color: #409eff;
          cursor: pointer;
        }
      }
      .mark-edit-wrapper {
        width: 240px;
        display: flex;
        justify-content: space-between;
        .mark-edit {
          width: 160px;
          margin: 0 2px 0 10px;
        }
      }
    }

    .partition {
      height: 100%;
      display: flex;
      align-items: center;

      .partition-content-wrapper {
        width: 150px;
        padding: 0 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .action {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
