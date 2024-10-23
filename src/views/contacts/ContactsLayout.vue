<script setup>
import contactsIcon from '@/assets/svg/contacts.svg'
import groupIcon from '@/assets/svg/group.svg'
import organizationIcon from '@/assets/svg/organization.svg'
</script>

<template>
  <el-container>
    <el-header class="bdr-b">通讯录</el-header>
    <el-container class="el-container__body">
      <el-aside class="bdr-r body" width="200px">
        <el-menu :default-active="$route.path" text-color="black" style="border: 0" router>
          <el-menu-item index="/contacts/user">
            <contactsIcon></contactsIcon>
            <span>联系人</span>
          </el-menu-item>

          <el-menu-item index="/contacts/group">
            <groupIcon></groupIcon>
            <span>群组</span>
          </el-menu-item>

          <el-menu-item index="/contacts/organization">
            <organizationIcon></organizationIcon>
            <span>组织</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="padding: 0">
        <router-view></router-view>
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

.el-container__body {
  height: 100vh;

  .el-aside {
    width: 130px;
    height: 100%;
    padding: 8px;
  }
}

.el-menu {
  --el-menu-bg-color: #f5f5f5;
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 2px;
}

.is-active {
  --fillColor: #409eff; // 与el-menu-item的active-text-color默认颜色保持一致
}

.svg-icon {
  width: 20px;
  height: 20px;
  fill: var(--fillColor);
  margin-right: 8px;
}

.el-menu-item.is-active {
  background-color: #dedfe0;
  color: #409eff;
  border-radius: 8px;
}
</style>
