<script setup>
import { userStore } from '@/stores'

const user = userStore()
</script>

<template>
  <div>我是APP</div>

  <hr />

  <router-view></router-view>

  <hr />
  <p>{{ user.token }}</p>
  <el-button type="primary" @click="user.setToken('111')">登录</el-button>
  <el-button type="danger" @click="user.setToken('')">退出</el-button>
</template>

<style scoped></style>
