<script setup>
import { ref, computed } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'

const props = defineProps(['modelValue', 'options', 'defaultSelected'])
const emit = defineEmits(['update:modelValue', 'confirm'])

const selected = ref(props.defaultSelected || [])
const searchKey = ref('')

const optionsBySearch = computed(() => {
  if (!searchKey.value) {
    return props.options
  } else {
    const data = {}
    Object.keys(props.options).forEach((key) => {
      const item = props.options[key]
      if (
        item.account === searchKey.value ||
        item.nickName.toLowerCase().includes(searchKey.value.toLowerCase())
      ) {
        data[key] = item
      }
    })
    return data
  }
})

const onConfirm = () => {
  emit('confirm', selected.value)
  emit('update:modelValue', false)
  onClearSelected()
}

const onClose = () => {
  emit('update:modelValue', false)
  onClearSelected()
}

const onClearSelected = () => {
  selected.value = []
}

const onRemoveSelectedItem = (index) => {
  selected.value.splice(index, 1)
}
</script>

<template>
  <el-dialog
    class="select-dialog"
    :model-value="props.modelValue"
    :modal="false"
    :top="'30vh'"
    :width="'610px'"
    :z-index="1"
    style="border-radius: 10px"
    @close="onClose"
  >
    <template #header>
      <slot name="title"></slot>
    </template>
    <div class="main bdr-t bdr-b bdr-l bdr-r">
      <div class="left bdr-r">
        <el-input
          v-model.trim="searchKey"
          placeholder="搜索：昵称/账号"
          :prefix-icon="Search"
          :clearable="true"
        />
        <div class="my-scrollbar" style="height: 300px; overflow-y: scroll">
          <el-checkbox-group v-model="selected">
            <el-checkbox v-for="item in Object.keys(optionsBySearch)" :key="item" :value="item">
              {{ `${optionsBySearch[item]?.nickName} ${optionsBySearch[item]?.account}` }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="right">
        <div class="head bdr-b">
          <div style="font-size: 13px; color: gray">
            {{ `已选择：${selected.length} 人` }}
          </div>
          <el-button type="info" size="small" @click="onClearSelected" round>清空</el-button>
        </div>
        <div class="my-scrollbar" style="height: 300px; overflow-y: scroll">
          <div class="selected-item" v-for="(item, index) in selected" :key="item.key">
            <div>{{ `${optionsBySearch[item].nickName} ${optionsBySearch[item].account}` }}</div>
            <el-button :icon="Close" size="small" circle @click="onRemoveSelectedItem(index)" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="onClose" plain>取消</el-button>
        <el-button type="primary" @click="onConfirm" plain>确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.main {
  margin: 10px 0 10px 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;

  .left {
    width: 50%;
    padding: 10px;
    .head {
      display: flex;
      align-items: center;
    }

    .el-checkbox-group {
      display: flex;
      flex-direction: column;

      .el-checkbox {
        width: 90%;
        margin: 0;
        padding: 0 10px 0 10px;
        border-radius: 4px;
        border: 1px solid transparent;

        &:hover {
          border: 1px solid rgb(199.5, 201, 204);
        }
      }
    }
  }

  .right {
    padding: 10px;
    flex: 1;
    .head {
      height: 30px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .selected-item {
      height: 30px;
      width: 90%;
      padding: 0 10px 0 10px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid transparent;
      --close-button-color: transparent;

      &:hover {
        background: #dedfe0;
        --close-button-color: auto;
      }

      .el-button {
        border: none;
        color: var(--close-button-color);
        background-color: var(--close-button-background-color);

        &:hover {
          --close-button-background-color: #f0f0f0;
        }
      }
    }
  }
}

.el-input {
  width: 100%;
  height: 30px;
  margin-bottom: 10px;

  :deep(.el-input__wrapper) {
    border-radius: 25px;
  }
}
</style>
