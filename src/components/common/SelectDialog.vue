<script setup>
import { ref, computed } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'
import ContactItem from '@/components/item/ContactItem.vue'
import HashNoData from '@/components/common/HasNoData.vue'

const props = defineProps(['modelValue', 'options', 'defaultSelected'])
const emit = defineEmits(['update:modelValue', 'showUserCard', 'confirm'])

const selected = ref(props.defaultSelected || [])
const searchKey = ref('')

const optionKeys = computed(() => {
  if (!searchKey.value) {
    return Object.keys(props.options)
  } else {
    const data = []
    Object.keys(props.options).forEach((key) => {
      const item = props.options[key]
      if (
        item.account === searchKey.value ||
        item.nickName.toLowerCase().includes(searchKey.value.toLowerCase())
      ) {
        data.push(key)
      }
    })
    return data
  }
})

const onShowUserCard = (account) => {
  emit('showUserCard', account)
}

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
        <div v-if="optionKeys.length > 0" class="my-scrollbar" style="overflow-y: scroll">
          <el-checkbox-group v-model="selected">
            <el-checkbox v-for="item in optionKeys" :key="item" :value="item">
              <ContactItem
                :contactInfo="props.options[item]"
                :size="'small'"
                @showContactCard="onShowUserCard(props.options[item].account)"
                style="width: 200px"
              ></ContactItem>
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <HashNoData v-else></HashNoData>
      </div>
      <div class="right">
        <div class="head bdr-b">
          <div style="font-size: 13px; color: gray">
            {{ `已选择：${selected.length} 人` }}
          </div>
          <el-button type="info" size="small" @click="onClearSelected" plain>清空</el-button>
        </div>
        <div v-if="selected.length > 0" class="my-scrollbar" style="overflow-y: scroll">
          <div class="selected-item" v-for="(item, index) in selected" :key="item.key">
            <ContactItem
              :contactInfo="props.options[item]"
              :size="'small'"
              @showContactCard="onShowCard(props.options[item])"
              style="width: 200px"
            ></ContactItem>
            <el-button :icon="Close" size="small" circle @click="onRemoveSelectedItem(index)" />
          </div>
        </div>
        <HashNoData v-else></HashNoData>
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
  height: 360px;
  margin: 10px 0 10px 0;
  display: flex;
  flex-direction: row;

  .left {
    width: 49%;
    padding: 10px;
    overflow: hidden;

    .head {
      display: flex;
      align-items: center;
    }

    .el-checkbox-group {
      display: flex;
      flex-direction: column;

      .el-checkbox {
        height: 45px;
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
    overflow: hidden;

    .head {
      height: 30px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .selected-item {
      height: 45px;
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
