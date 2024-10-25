<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['isShow', 'account', 'oldMark'])
const emit = defineEmits(['updateMark'])

const visibleDialog = ref(props.isShow)
const newMark = ref(props.oldMark)

const onConfirm = () => {
  emit('updateMark', {
    account: props.account,
    mark: newMark.value
  })
  visibleDialog.value = false
}

const onCancel = () => {
  visibleDialog.value = false
}

watch(
  () => props.isShow,
  (newVal) => {
    if (newVal) {
      visibleDialog.value = true
      newMark.value = props.oldMark
    }

    if (!visibleDialog.value) {
      onCancel()
    }
  }
)
</script>

<template>
  <el-dialog
    class="update-mark"
    v-model="visibleDialog"
    :modal="false"
    title="修改备注"
    :top="'40vh'"
    :width="'300px'"
    :z-index="1"
    style="border-radius: 10px"
  >
    <el-input
      v-model="newMark"
      placeholder="请输入备注"
      maxlength="10"
      show-word-limit
      clearable
    ></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="onCancel" plain>取消</el-button>
        <el-button type="primary" @click="onConfirm" plain>保存</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- </div> -->
</template>

<style lang="scss" scoped></style>
