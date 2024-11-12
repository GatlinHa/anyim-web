<script setup>
import { ref, onUpdated, computed } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { el_loading_options } from '@/const/commonConst'
import GroupItem from '@/components/item/GroupItem.vue'
import { ArrowRight } from '@element-plus/icons-vue'
import AvatarIcon from '@/components/common/AvatarIcon.vue'
import AddButton from '@/components/common/AddButton.vue'
import DeleteButton from '@/components/common/DeleteButton.vue'
import UserCard from '@/components/card/UserCard.vue'
import { combineId } from '@/js/utils/common'
import { userQueryService } from '@/api/user'
import { groupStore, userStore, messageStore } from '@/stores'
import SelectDialog from '../common/SelectDialog.vue'
import { groupAddMembersService, groupDelMembersService } from '@/api/group'

const props = defineProps(['isShow', 'groupInfo', 'groupMembers'])
const emit = defineEmits(['close'])

const groupData = groupStore()
const userData = userStore()
const messageData = messageStore()
const showDraw = ref(props.isShow)
const isShowSelectDialog = ref(false)
const method = ref('') //有加人，减人两中method

onUpdated(() => {
  showDraw.value = ref(props.isShow)
})

const showMembers = () => {
  console.log('showMembers')
}

const isShowUserCard = ref(false)
const userInfo = ref()
const onShowUserCard = (account) => {
  const sessionId = combineId(account, userData.user.account)
  const loadingInstance = ElLoading.service(el_loading_options)
  userQueryService({ account: account })
    .then((res) => {
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
    })
    .finally(() => {
      loadingInstance.close()
      isShowUserCard.value = true
    })
}

const selectDialogOptions = computed(() => {
  if (method.value === 'add') {
    const data = {}
    Object.values(messageData.sessionList).forEach((item) => {
      data[item.objectInfo.account] = item.objectInfo
    })
    return data
  } else {
    const data = {}
    props.groupMembers?.forEach((item) => {
      data[item.account] = item
    })
    return data
  }
})

const selectDialogDisabledOptions = computed(() => {
  if (method.value === 'add') {
    return props.groupMembers.map((item) => item.account)
  } else {
    // 删除时要排除自己
    return [userData.user.account]
    //TODO 群主不能删
    //TODO 管理员不能删管理员
  }
})

const searchModel = computed(() => {
  return method.value === 'add' ? 'server' : 'default'
})

const onAddmember = () => {
  isShowSelectDialog.value = true
  method.value = 'add'
}

const delAddmember = () => {
  isShowSelectDialog.value = true
  method.value = 'del'
}

const selectDialogTitle = computed(() => {
  return method.value === 'add' ? '添加成员' : '移除成员'
})

const onConfirmSelect = (selected) => {
  // 这里要先关闭，不然移除的时候会报错
  isShowSelectDialog.value = false

  if (method.value === 'add') {
    let members = []
    selected.forEach((item) => {
      const info = {
        account: item.account,
        nickName: item.nickName,
        avatarThumb: item.avatarThumb,
        role: 0
      }
      members.push(info)
    })
    const loadingInstance = ElLoading.service(el_loading_options)
    groupAddMembersService({
      groupId: props.groupInfo.groupId,
      members: members
    })
      .then((res) => {
        if (res.data.data) {
          groupData.setGroupMembers({
            groupId: props.groupInfo.groupId,
            members: res.data.data.members
          })
          ElMessage.success('添加成功')
        } else {
          ElMessage.error('添加失败')
        }
      })
      .finally(() => {
        loadingInstance.close()
      })
  } else {
    let accounts = []
    selected.forEach((item) => {
      accounts.push(item.account)
    })
    const loadingInstance = ElLoading.service(el_loading_options)
    groupDelMembersService({
      groupId: props.groupInfo.groupId,
      accounts: accounts
    })
      .then((res) => {
        if (res.data.data) {
          groupData.setGroupMembers({
            groupId: props.groupInfo.groupId,
            members: res.data.data.members
          })
          ElMessage.success('移除成功')
        } else {
          ElMessage.error('移除失败')
        }
      })
      .finally(() => {
        loadingInstance.close()
      })
  }
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
            v-for="item in props.groupMembers.slice(0, 8)"
            :key="item.account"
          >
            <AvatarIcon
              :showName="item.nickName"
              :showId="item.account"
              :showAvatarThumb="item.avatarThumb"
              @click="onShowUserCard(item.account)"
            ></AvatarIcon>
            <div class="text text-ellipsis" :title="item.nickName">
              {{ item.nickName }}
            </div>
          </div>
          <div class="group-card-members-grid-item">
            <AddButton :size="40" @click="onAddmember"></AddButton>
            <div class="text">添加成员</div>
          </div>
          <div class="group-card-members-grid-item">
            <DeleteButton :size="40" @click="delAddmember"></DeleteButton>
            <div class="text">移除成员</div>
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
  <SelectDialog
    v-model="isShowSelectDialog"
    :options="selectDialogOptions"
    :disabledOptions="selectDialogDisabledOptions"
    :searchModel="searchModel"
    @showUserCard="onShowUserCard"
    @confirm="onConfirmSelect"
  >
    <template #title>
      <div style="font-size: 16px; font-weight: bold; white-space: nowrap">
        {{ selectDialogTitle }}
      </div>
    </template>
  </SelectDialog>
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
