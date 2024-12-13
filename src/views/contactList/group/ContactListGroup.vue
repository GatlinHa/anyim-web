<script setup>
import allIcon from '@/assets/svg/all.svg'
import markIcon from '@/assets/svg/mark.svg'
import partitionIcon from '@/assets/svg/partition.svg'
import creatorIcon from '@/assets/svg/creator.svg'
import adminIcon from '@/assets/svg/administrator.svg'
import joinIcon from '@/assets/svg/join.svg'
import publicIcon from '@/assets/svg/public.svg'
</script>

<template>
  <el-container class="contactList-group">
    <el-container>
      <el-aside class="bdr-r el-aside__contact-group">
        <el-menu :default-active="$route.path" text-color="black" router>
          <el-menu-item index="/contactList/group/all">
            <allIcon></allIcon>
            <span>所有</span>
          </el-menu-item>
          <el-menu-item index="/contactList/group/created">
            <creatorIcon></creatorIcon>
            <span>我创建的</span>
          </el-menu-item>
          <el-menu-item index="/contactList/group/managed">
            <adminIcon></adminIcon>
            <span>我管理的</span>
          </el-menu-item>
          <el-menu-item index="/contactList/group/joined">
            <joinIcon></joinIcon>
            <span>我加入的</span>
          </el-menu-item>
          <el-menu-item index="/contactList/group/mark">
            <markIcon></markIcon>
            <span>备注</span>
          </el-menu-item>
          <el-menu-item index="/contactList/group/partition">
            <partitionIcon></partitionIcon>
            <span>分组</span>
          </el-menu-item>
          <el-menu-item index="/contactList/group/public">
            <publicIcon></publicIcon>
            <span>公开群</span>
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
.contactList-group {
  height: 100%;
}

.el-aside__contact-group {
  width: 150px;
  height: 100%;
  padding: 8px;
}

.el-menu {
  --el-menu-bg-color: #f5f5f5;
  border: 0;
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 5px;

  &:hover {
    background-color: #dedfe0;
  }
}

.is-active {
  --fillColor: #409eff;
  background-color: #dedfe0;
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
