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
  --el-menu-bg-color: #f5f5f5; // 这个是控制整个菜单的背景色，不是某个菜单选项
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 2px;

  &:hover {
    background-color: #dedfe0;
  }
}

.is-active {
  --fillColor: #409eff; // 与el-menu-item的active-text-color默认颜色保持一致
  background-color: #dedfe0; // 这个是控制被选中菜单的背景色
  //文字颜色默认是#409eff，可以用color修改
}

.svg-icon {
  width: 20px;
  height: 20px;
  fill: var(--fillColor);
  margin-right: 8px;
  transition: fill var(--el-transition-duration); //过度时长沿用el-menu-item的
}
</style>
