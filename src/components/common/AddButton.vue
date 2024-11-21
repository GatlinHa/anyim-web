<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
const props = defineProps(['size'])

// 实际大小要减去border的宽度
const actualSize = computed(() => {
  return `${props.size - 1}px`
})
</script>

<template>
  <div class="circle">
    <el-icon :size="18"><Plus /></el-icon>
  </div>
</template>

<style lang="scss" scoped>
.circle {
  width: v-bind('actualSize'); //CSS中使用script的变量
  height: v-bind('actualSize'); //CSS中使用script的变量
  min-width: v-bind('actualSize');
  min-height: v-bind('actualSize');
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
