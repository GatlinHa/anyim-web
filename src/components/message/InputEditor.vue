<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { onMounted, ref, watch, onUpdated } from 'vue'
import { userStore, messageStore } from '@/stores'

const props = defineProps(['draft'])
const emit = defineEmits(['exportContent'])
const messageData = messageStore()
const userData = userStore()

const editorRef = ref()

const getQuill = () => {
  return editorRef.value?.getQuill()
}

const handleEnter = () => {
  const content = getQuill().getText().trim()
  if (!content) {
    ElMessage.warning('请勿发送空内容')
    getQuill().setText('')
  } else {
    emit('exportContent', content)
    getQuill().setText('')
  }
}

onMounted(() => {
  // 给组件增加滚动条样式
  document.querySelector('.ql-editor').classList.add('my-scrollbar')
})

onUpdated(() => {
  getQuill().setText(props.draft)
})

// 监控session发生了切换
watch(
  () => userData.lastSessionId,
  (newValue, oldValue) => {
    let content = getQuill().getText().trim()
    // 草稿若没发生变动，则不触发存储
    if (oldValue && content !== messageData.sessionList[oldValue].draft) {
      messageData.updateSession({
        sessionId: oldValue,
        draft: content
      })
    }
    getQuill().setText(messageData.sessionList[newValue].draft || '')
  },
  { deep: true }
)

const options = {
  debug: false,
  modules: {
    toolbar: false,
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: handleEnter
        }
      }
    }
  },
  placeholder: 'Enter发送 / Shift+Enter换行',
  theme: 'snow'
}
</script>

<template>
  <div class="input-editor">
    <QuillEditor
      class="editor"
      ref="editorRef"
      :options="options"
      content-type="text"
    ></QuillEditor>
  </div>
</template>

<style lang="scss">
.input-editor {
  height: 100%;

  .editor {
    height: 100%;
    border: none;

    .ql-editor {
      padding: 16px;
      padding-left: 16px;
      font-size: 14px;
      background-color: #fff;
    }
  }
}
</style>
