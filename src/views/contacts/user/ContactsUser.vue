<script setup>
import lastIcon from '@/assets/svg/last.svg'
import markIcon from '@/assets/svg/mark.svg'
import partitionIcon from '@/assets/svg/partition.svg'
</script>

<template>
  <el-container class="constact-user">
    <el-container>
      <el-aside class="bdr-r el-aside__contact-user">
        <el-menu :default-active="$route.path" text-color="black" router>
          <el-menu-item index="/contacts/user/last">
            <lastIcon></lastIcon>
            <span>最近</span>
          </el-menu-item>
          <el-menu-item index="/contacts/user/mark">
            <markIcon></markIcon>
            <span>备注</span>
          </el-menu-item>
          <el-menu-item index="/contacts/user/partition">
            <partitionIcon></partitionIcon>
            <span>分组</span>
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
.constact-user {
  height: 100%;
}

.el-aside__contact-user {
  width: 120px;
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
