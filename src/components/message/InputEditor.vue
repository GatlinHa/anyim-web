<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor } from '@wangeditor/editor-for-vue'
import { messageStore } from '@/stores'

const mode = 'simple'
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const editorStyleRef = ref()
const props = defineProps(['sessionInfo'])
const emit = defineEmits(['exportContent'])
const messageData = messageStore()

// 内容 HTML
const valueHtml = ref('')
const content = [
  {
    type: 'paragraph',
    children: [{ text: props.sessionInfo.draft || '', fontSize: '14px' }],
    lineHeight: 0.5
  }
]
const editorConfig = { placeholder: '' }

onMounted(() => {
  // 给组件增加滚动条样式
  editorStyleRef.value.$el.querySelector('.w-e-scroll').classList.add('my-scrollbar')
})
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const handleEnter = () => {
  const editor = editorRef.value
  const trimContent = editor.getText().trim()
  if (!trimContent) {
    ElMessage.warning('请勿发送空内容')
    valueHtml.value = ''
  } else {
    emit('exportContent', trimContent)
    valueHtml.value = ''
  }
}

// 监控session发生了切换
watch(
  () => props.sessionInfo,
  (newValue, oldValue) => {
    valueHtml.value = newValue.draft || ''
    // 草稿若没发生变动，则不触发存储
    if (editorRef.value.getText().trim() !== oldValue.draft) {
      messageData.updateSession({
        ...oldValue,
        draft: editorRef.value.getText().trim()
      })
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="input-editor">
    <Editor
      ref="editorStyleRef"
      class="editor"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :defaultContent="content"
      :mode="mode"
      @onCreated="handleCreated"
      @keyup.enter="handleEnter"
    />
  </div>
</template>

<style lang="scss">
.input-editor {
  height: 100%;

  .editor {
    height: 100%;
    overflow-y: hidden;
    font-size: 14px;
  }
}
</style>
