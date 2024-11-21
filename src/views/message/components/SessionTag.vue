<script setup>
import { computed } from 'vue'
const items = {
  groupchat: { color: '#409EFF', label: '群' },
  team: { color: '#67C23A', label: '团' },
  organize: { color: '#E6A23C', label: '组' },
  assistant: { color: '#E734F5', label: '助' }
}

const props = defineProps(['tagType'])
const selectedItem = computed(() => {
  return items[props.tagType]
})
</script>

<template>
  <el-tag v-if="selectedItem" :color="selectedItem.color" effect="dark" size="small">
    {{ selectedItem.label }}
  </el-tag>
</template>

<style lang="scss" scoped>
.el-tag {
  width: 16px;
  height: 16px;
  border: 0;
  margin-right: 2px;
}
</style>
