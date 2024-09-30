<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { onMounted, ref, watch } from 'vue'
import { messageStore } from '@/stores'

const props = defineProps(['sessionId', 'draft'])
const emit = defineEmits(['sendMessage'])
const messageData = messageStore()

const editorRef = ref()

const getQuill = () => {
  return editorRef.value?.getQuill()
}

const handleEnter = () => {
  const content = getQuill().getText().trim()
  if (!content) {
    ElMessage.warning('请勿发送空内容')
    getQuill().setText('')
  } else if (content.length > 3000) {
    ElMessage.warning('发送内容请不要超过3000个字')
  } else {
    emit('sendMessage', content)
    getQuill().setText('')
  }
}

onMounted(() => {
  // 给组件增加滚动条样式
  document.querySelector('.ql-editor').classList.add('my-scrollbar')
  getQuill().setText(props.draft)
})

// 监控session发生了切换
watch(
  () => props.sessionId,
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
