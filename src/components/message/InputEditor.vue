<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor } from '@wangeditor/editor-for-vue'

const mode = 'simple'
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const editorStyleRef = ref()

// 内容 HTML
const valueHtml = ref('')
const content = [
  {
    type: 'paragraph',
    children: [{ text: '', fontSize: '14px' }],
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
</script>

<template>
  <div class="editor-wrapper">
    <Editor
      ref="editorStyleRef"
      class="editor"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :defaultContent="content"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<style lang="scss">
.editor-wrapper {
  height: 100%;

  .editor {
    height: 100%;
    overflow-y: hidden;
    font-size: 14px;
  }
}
</style>
