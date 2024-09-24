<script setup>
import { ref } from 'vue'

defineProps(['tips'])
const tooltipVisible = ref(false)
const showTooltip = () => {
  tooltipVisible.value = true
}
const hideTooltip = () => {
  tooltipVisible.value = false
}
</script>

<template>
  <div class="tool-icon-wrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <el-icon class="tool-icon" :size="20">
      <slot name="iconSlot"></slot>
    </el-icon>
    <span v-if="tooltipVisible" class="tooltip">{{ tips }}</span>
  </div>
</template>

<style lang="scss" scoped>
.tool-icon-wrapper {
  width: 30px;
  height: 30px;
  margin: 5px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #c6e2ff;
  }

  .tooltip {
    position: absolute;
    top: 36px;
    font-size: 12px;
    z-index: 1;
    white-space: nowrap;
  }
}
</style>
