<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor } from '@wangeditor/editor-for-vue'

const mode = 'simple'
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

const editorConfig = { placeholder: 'Enter发送 / Shift + Enter换行' }

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
      class="editor"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
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
    border-radius: 8px;
  }
}
</style>
