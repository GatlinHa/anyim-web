<script setup>
import { ref, computed } from 'vue'
import { userStore } from '@/stores'
import { maskPhoneNum } from '@/js/utils/common'
import EditEmail from '@/views/setting/components/EditEmail.vue'
import EditPassword from '@/views/setting/components/EditPassword.vue'
import EditPhone from '@/views/setting/components/EditPhone.vue'

const userData = userStore()
const isShowEditPassword = ref(false)
const isShowEditPhone = ref(false)
const isShowEditEmail = ref(false)

const phoneDesc = computed(() => {
  if (!userData.user.phoneNum) {
    return '未绑定手机'
  } else {
    return '已绑定手机：' + maskPhoneNum(userData.user.phoneNum)
  }
})

const emailDesc = computed(() => {
  if (!userData.user.email) {
    return '未绑定邮箱'
  } else {
    return '已绑定邮箱：' + userData.user.email
  }
})
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="bdr-b">安全设置</el-header>
      <el-main class="list">
        <div class="item bdr-b">
          <div class="content">
            <div class="name">账户密码</div>
            <div class="desc">当前密码强度 ：低</div>
          </div>
          <div class="modify">
            <el-button type="primary" text @click="isShowEditPassword = true"> 修改 </el-button>
          </div>
        </div>

        <div class="item bdr-b">
          <div class="content">
            <div class="name">绑定手机</div>
            <div class="desc">{{ phoneDesc }}</div>
          </div>
          <div class="modify">
            <el-button type="primary" text @click="isShowEditPhone = true">
              {{ userData.user.phoneNum ? '修改' : '绑定' }}
            </el-button>
          </div>
        </div>

        <div class="item bdr-b">
          <div class="content">
            <div class="name">绑定邮箱</div>
            <div class="desc">{{ emailDesc }}</div>
          </div>
          <div class="modify">
            <el-button type="primary" text @click="isShowEditEmail = true">
              {{ userData.user.email ? '修改' : '绑定' }}
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>

  <EditPassword v-model="isShowEditPassword"></EditPassword>
  <EditPhone v-model="isShowEditPhone"></EditPhone>
  <EditEmail v-model="isShowEditEmail"></EditEmail>
</template>

<style lang="scss" scoped>
.el-header {
  width: 100%;
  height: 60px;
  line-height: 60px;
  padding-left: 15px;
  font-size: 18px;
}

.el-main {
  .list {
    padding: 15px;
    padding-top: 0;

    .item {
      margin: 5px 0;
      padding: 5px 0;
      display: flex;
      align-items: center;

      &:first-child {
        margin-top: 0;
      }

      .content {
        flex: auto;
        .name {
          height: 40px;
          font-size: 15px;
          line-height: 40px;
          font-weight: 500;
        }

        .desc {
          color: gray;
          height: 30px;
          line-height: 30px;
          font-size: 13px;
        }
      }

      .modify {
        width: 120px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }
}
</style>
