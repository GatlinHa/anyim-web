<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['isShow', 'title', 'titleExt', 'placeholder', 'defaultInput'])
const emit = defineEmits(['close', 'confirm'])

const isShowDialog = ref(false)
const inputValue = ref('')

const onCancel = () => {
  isShowDialog.value = false
  emit('close')
}

const onComfirm = () => {
  emit('confirm', inputValue.value)
}

watch([() => props.isShow, () => props.defaultInput], ([newIsShow, newDefaultInput]) => {
  ;(isShowDialog.value = newIsShow), (inputValue.value = newDefaultInput)
})
</script>

<template>
  <el-dialog
    class="simple-dialog"
    v-model="isShowDialog"
    :modal="false"
    :top="'40vh'"
    :width="'360px'"
    :z-index="1"
    style="border-radius: 10px"
  >
    <template #header>
      <div style="display: flex; flex-direction: row; justify-content: start; align-items: center">
        <div style="font-size: 16px; font-weight: bold; white-space: nowrap">{{ props.title }}</div>
        <div
          v-if="props.titleExt"
          class="text-ellipsis"
          style="padding: 2px 8px 2px 8px; font-size: 14px; border-radius: 4px; background: #ebedf0"
        >
          {{ props.titleExt }}
        </div>
      </div>
    </template>
    <el-input
      v-model="inputValue"
      :placeholder="props.placeholder"
      maxlength="10"
      show-word-limit
      style="padding: 10px 0 10px 0"
      clearable
      @keyup.enter="onComfirm"
    ></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="onCancel" plain>取消</el-button>
        <el-button type="primary" @click="onComfirm" plain>保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
