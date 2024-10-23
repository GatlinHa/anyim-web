<script setup>
import { ref } from 'vue'
import lastIcon from '@/assets/svg/last.svg'
import markIcon from '@/assets/svg/mark.svg'
import partitionIcon from '@/assets/svg/partition.svg'

const indexActive = ref('last')

const onSelect = (key) => {
  indexActive.value = key
}
</script>

<template>
  <el-header class="bdr-b">联系人</el-header>
  <el-container class="contacts-user">
    <el-aside class="bdr-r">
      <el-menu default-active="last" @select="onSelect">
        <el-menu-item index="last">
          <lastIcon></lastIcon>
          <span>最近</span>
        </el-menu-item>
        <el-menu-item index="mark">
          <markIcon></markIcon>
          <span>备注</span>
        </el-menu-item>
        <el-menu-item index="partition">
          <partitionIcon></partitionIcon>
          <span>分组</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <div v-if="indexActive === 'last'">last</div>
      <div v-if="indexActive === 'mark'">mark</div>
      <div v-if="indexActive === 'partition'">partition</div>
    </el-main>
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

.el-container {
  height: 100vh;

  .el-aside {
    width: 200px;
    height: 100%;
    padding: 8px;
  }
}

.el-menu {
  --el-menu-bg-color: #f5f5f5;
  border: 0;
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 2px;

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
