<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
const searchValue = ref('')
</script>

<template>
  <el-input placeholder="搜索：人/会话" v-model="searchValue" :prefix-icon="Search" />
</template>

<style lang="scss" scoped>
.el-input {
  margin-left: 10px;
  margin-right: 10px;
}

:deep(.el-input__wrapper) {
  border-radius: 25px;
}
</style>
