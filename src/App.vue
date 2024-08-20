<script setup>
import { userStore, groupStore } from '@/stores'

const user = userStore()
const group = groupStore()
</script>

<template>
  <div>我是APP</div>
  <p>{{ user.token }}</p>
  <el-button type="primary" @click="user.setToken('111')">登录</el-button>
  <el-button type="danger" @click="user.setToken('')">退出</el-button>
  <p>{{ group.groupxx }}</p>
  <el-button type="primary" @click="group.setGroupxx('aaa')"
    >设置group</el-button
  >
  <el-button type="danger" @click="group.setGroupxx('')">清除group</el-button>
</template>

<style scoped></style>
