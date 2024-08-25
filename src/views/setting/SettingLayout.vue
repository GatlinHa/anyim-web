<script setup>
import { User, Key } from '@element-plus/icons-vue'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="bdr-b">我的设置</el-header>
      <el-container class="el-container__body">
        <el-aside class="bdr-r body" width="200px">
          <el-menu
            active-text-color="#a0cfff"
            background-color="#f5f5f5"
            :default-active="$route.path"
            text-color="black"
            style="border: 0"
            router
          >
            <el-menu-item index="/setting/personal">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-menu-item>

            <el-menu-item index="/setting/security">
              <el-icon><Key /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.el-header {
  width: 100%;
  height: 60px;
  line-height: 60px;
  padding-left: 15px;
  font-size: 18px;
}

.el-container__body {
  height: 100vh;

  .el-aside {
    width: 150px;
    height: 100%;
    padding: 8px;
    padding-top: 3px;
  }
}
</style>
