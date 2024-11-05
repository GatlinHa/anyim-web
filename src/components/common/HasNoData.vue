<script setup>
import noData from '@/assets/svg/noData.svg'

const props = defineProps(['size'])
</script>

<template>
  <div class="has-no-data-wrapper">
    <noData
      class="has-no-data"
      :style="{ width: props.size || 60 + 'px', height: props.size || 60 + 'px' }"
    ></noData>
    <span>无数据</span>
  </div>
</template>

<style lang="scss" scoped>
.has-no-data-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: gray;

  .has-no-data {
    margin: 0;
    fill: gray;
  }
}
</style>
