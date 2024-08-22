<script setup>
defineProps(['funcName', 'index'])
</script>

<template>
  <el-menu-item :index="index">
    <el-icon :size="30">
      <slot name="iconSlot"></slot>
    </el-icon>
    <span>{{ funcName }}</span>
  </el-menu-item>
</template>

<style lang="scss" scoped>
.el-menu-item {
  width: 60px;
  height: 60px;
  margin-top: 20px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.el-menu-item.is-active {
  background-color: #a0cfff;
}

.el-icon {
  width: 30px;
  height: 30px;
}

span {
  line-height: 16px;
  text-align: center;
}
</style>
