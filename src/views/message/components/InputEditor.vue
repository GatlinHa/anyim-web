<script setup>
import { QuillEditor, Delta, Quill } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { messageStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { emojis } from '@/js/utils/emojis'

const props = defineProps(['sessionId', 'draft'])
const emit = defineEmits(['sendMessage'])
const messageData = messageStore()

const editorRef = ref()

const getQuill = () => {
  return editorRef.value?.getQuill()
}

onMounted(() => {
  // 给组件增加滚动条样式
  document.querySelector('.ql-editor').classList.add('my-scrollbar')
  getQuill().setText(props.draft)
  getQuill().setSelection(getQuill().getLength(), 0, 'user')
  getQuill().on('composition-start', () => {
    // 当用户使用拼音输入法开始输入汉字时，这个事件就会被触发
    getQuill().root.dataset.placeholder = ''
  })
  getQuill().on('composition-end', () => {
    // 当用户使用拼音输入法输入完成后，把值恢复成原来的值
    getQuill().root.dataset.placeholder = getQuill().options.placeholder
  })
})

onUnmounted(() => {
  if (editorRef.value) {
    document.querySelector('.ql-editor').classList.remove('my-scrollbar')
    getQuill().setText('')
    getQuill().off('composition-start')
    getQuill().off('composition-end')
    getQuill().destroy()
  }
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
    getQuill().setSelection(getQuill().getLength(), 0, 'user')
  },
  { deep: true }
)

const handleEnter = () => {
  const delta = getQuill().getContents()
  let content = ''
  delta.ops.forEach((op) => {
    const insert = op.insert
    // 文本
    if (insert && typeof insert === 'string') {
      content = content + insert
    } else if (insert && insert.image) {
      const alt = op.attributes?.alt
      // 表情
      if (alt && alt.startsWith('[') && alt.endsWith(']')) {
        content = content + alt
      }
    }
  })

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

/**
 * 处理粘贴格式问题
 */
const Clipboard = Quill.import('modules/clipboard')
class PlainClipboard extends Clipboard {
  onPaste(range, { text }) {
    const delta = new Delta().retain(range.index).delete(range.length).insert(text)
    this.quill.updateContents(delta, Quill.sources.USER)
    this.quill.setSelection(delta.length() - range.length, Quill.sources.SILENT)
    this.quill.scrollSelectionIntoView()
  }
}
Quill.register(
  {
    'modules/clipboard': PlainClipboard
  },
  true
)

const options = {
  debug: false,
  modules: {
    toolbar: false,
    keyboard: {
      bindings: {
        enter: {
          key: 'Enter',
          handler: handleEnter
        }
      }
    }
  },
  placeholder: 'Enter发送 / Shift+Enter换行',
  theme: 'snow'
}

const getQuillSelectionIndex = () => {
  const quill = getQuill()
  if (!quill) return 0

  return (quill.getSelection() || {}).index || 0
}

const addEmoji = (key) => {
  const quill = getQuill()
  let index = getQuillSelectionIndex()
  if (index == 1 && quill.getLength() == 1 && quill.getText(0, 1) == '\n') {
    quill.deleteText(0, 1)
    index = 0
  }

  quill.clipboard.dangerouslyPasteHTML(index, emojis[key])
  quill.setSelection(index + 1, 0, 'user')
}

defineExpose({
  addEmoji
})
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

img {
  margin-left: 2px;
  margin-right: 2px;
}
</style>
