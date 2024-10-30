<script setup>
import { Plus } from '@element-plus/icons-vue'
const props = defineProps(['size'])
</script>

<template>
  <div class="circle" :style="{ width: props.size + 'px', height: props.size + 'px' }">
    <el-icon :size="18"><Plus /></el-icon>
  </div>
</template>

<style lang="scss" scoped>
.circle {
  border: solid 1px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  --hoverColor: gray;
  color: var(--hoverColor);

  &:hover {
    --hoverColor: #409eff;
    color: var(--hoverColor);
  }

  .el-icon {
    color: var(--hoverColor);
  }
}
</style>
