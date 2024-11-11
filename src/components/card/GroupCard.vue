<script setup>
import { ref, onUpdated } from 'vue'
import { ElLoading } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import GroupItem from '@/components/item/GroupItem.vue'
import { ArrowRight } from '@element-plus/icons-vue'
import AvatarIcon from '@/components/common/AvatarIcon.vue'
import AddButton from '@/components/common/AddButton.vue'
import UserCard from '@/components/card/UserCard.vue'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { userStore, messageStore } from '@/stores'

const props = defineProps(['isShow', 'groupInfo', 'groupMembers'])
const emit = defineEmits(['close'])

const userData = userStore()
const messageData = messageStore()
const showDraw = ref(props.isShow)

onUpdated(() => {
  showDraw.value = ref(props.isShow)
})

const showMembers = () => {
  console.log('showMembers')
}

const isShowUserCard = ref(false)
const userInfo = ref()
const onShowUserCard = async (account) => {
  const sessionId = combineId(account, userData.user.account)
  const loadingInstance = ElLoading.service(el_loading_options)
  const res = await userQueryService({ account: account })
  if (sessionId in messageData.sessionList) {
    messageData.updateSession({
      sessionId: sessionId,
      objectInfo: {
        ...messageData.sessionList[sessionId].objectInfo,
        nickName: res.data.data.nickName,
        signature: res.data.data.signature,
        avatarThumb: res.data.data.avatarThumb,
        gender: res.data.data.gender,
        phoneNum: res.data.data.phoneNum,
        email: res.data.data.email
      }
    })
  }
  userInfo.value = res.data.data
  loadingInstance.close()
  isShowUserCard.value = true
}

const onAddmember = () => {
  console.log('onAddmember')
}
</script>

<template>
  <el-drawer
    class="group-card"
    :modelValue="props.isShow"
    :direction="'rtl'"
    :size="380"
    :z-index="1"
    modal-class="group-card-modal"
    :show-close="false"
    @close="emit('close')"
  >
    <template #header>
      <span style="text-align: center; font-size: 16px">群信息</span>
    </template>
    <div class="group-card-body">
      <GroupItem
        class="group-card-avatar"
        :groupInfo="props.groupInfo"
        :disableClickAvatar="true"
      ></GroupItem>
      <div class="group-card-members">
        <div class="group-card-members-title">
          <span style="font-size: 14px">群组成员</span>
          <div
            style="
              font-size: 12px;
              color: gray;
              display: flex;
              align-items: center;
              cursor: pointer;
            "
            @click="showMembers"
          >
            查看{{ props.groupMembers?.length }}名群组成员
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="group-card-members-grid">
          <div
            class="group-card-members-grid-item"
            v-for="item in props.groupMembers.slice(0, 9)"
            :key="item.memberAccount"
          >
            <AvatarIcon
              :showName="item.memberNickName"
              :showId="item.memberAccount"
              :showAvatarThumb="item.memberAvatarThumb"
              @click="onShowUserCard(item.memberAccount)"
            ></AvatarIcon>
            <div class="text text-ellipsis" :title="item.memberNickName">
              {{ item.memberNickName }}
            </div>
          </div>
          <div class="group-card-members-grid-item">
            <AddButton :size="40" @click="onAddmember"></AddButton>
            <div class="text">添加成员</div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
  <UserCard
    :isShow="isShowUserCard"
    :userInfo="userInfo"
    @close="isShowUserCard = false"
  ></UserCard>
</template>

<style lang="scss">
.group-card-modal {
  background-color: transparent;

  .el-drawer__header {
    margin: 0;
    font-weight: bold;
  }
}

.group-card-body {
  .group-card-avatar {
    padding: 10px 12px 10px 12px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
  }

  .group-card-members {
    height: 160px;
    padding: 10px;
    margin-top: 20px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;

    .group-card-members-title {
      width: 100%;
      height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .group-card-members-grid {
      margin-top: 10px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .group-card-members-grid-item {
        width: 60px;
        margin: 2px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .text {
          width: 100%;
          margin-top: 5px;
          overflow: hidden;
          font-size: 12px;
          color: gray;
          text-align: center;
        }
      }
    }
  }
}
</style>
