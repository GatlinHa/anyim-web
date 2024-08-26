<script setup>
import { ref, onMounted } from 'vue'
import { userStore } from '@/stores'
import router from '@/router'
import { userModifySelfService } from '@/api/user'
import defaultImg from '@/assets/select_avatar.jpg'
import { cloneDeep, isEqual } from 'lodash'

const userData = userStore()
// 准备表单数据
const formModel = ref({})
const isLoading = ref(false)

onMounted(() => {
  formModel.value = cloneDeep(userData.user)
})

const onSave = () => {
  if (isEqual(formModel.value, userData.user)) {
    ElMessage.warning('您还没有修改任何信息哦！')
    return
  }

  isLoading.value = true
  const res = userModifySelfService(formModel.value)
  res.then(() => {
    ElMessage.success('信息保存成功')
    userData.getUserForce()
  })
  res.finally(() => {
    isLoading.value = false
  })
}
</script>

<template>
  <el-container>
    <el-header class="bdr-b">个人信息</el-header>
    <el-container class="el-container__body">
      <el-aside width="240px">
        <img
          :src="userData.user.avatar || defaultImg"
          alt="图片加载错误"
          style="text-align: center"
        />
        <el-button type="info" round style="margin-top: 20px; cursor: pointer">
          点击修改头像
        </el-button>
      </el-aside>
      <el-main>
        <el-form :model="formModel" ref="formRef">
          <el-form-item label="登录账号：" prop="account">
            {{ userData.user.account }}
          </el-form-item>
          <el-form-item label="手机号码：" prop="phoneNum">
            {{ formModel.phoneNum || '未绑定' }}
            <el-button
              type="primary"
              text
              @click="router.push('/setting/security')"
              style="margin-left: 15px"
            >
              {{ formModel.phoneNum ? '修改' : '去绑定' }}
            </el-button>
          </el-form-item>
          <el-form-item label="电子邮箱：" prop="email">
            {{ formModel.email || '未绑定' }}
            <el-button
              type="primary"
              text
              @click="router.push('/setting/security')"
              style="margin-left: 15px"
            >
              {{ formModel.email ? '修改' : '去绑定' }}
            </el-button>
          </el-form-item>
          <el-form-item label="我的昵称：" prop="nickname">
            <el-input
              v-model.trim="formModel.nickName"
              maxlength="10"
              show-word-limit
              style="width: 300px"
            ></el-input>
          </el-form-item>
          <el-form-item label="我的性别：" prop="sex">
            <el-radio-group v-model="formModel.sex">
              <el-radio :value="0">男</el-radio>
              <el-radio :value="1">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="我的生日：" prop="birthday">
            <el-date-picker v-model="formModel.birthday" type="date" placeholder="请选择日期" />
          </el-form-item>
          <el-form-item label="个性签名：" prop="level">
            <el-input
              v-model.trim="formModel.signature"
              maxlength="50"
              show-word-limit
              style="width: 300px"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              @click="onSave"
              type="primary"
              :loading="isLoading"
              style="margin-left: 84px"
            >
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.el-header {
  width: 100%;
  height: 60px;
  line-height: 60px;
  padding-left: 15px;
  font-size: 18px;
}

.el-aside {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
}
</style>
