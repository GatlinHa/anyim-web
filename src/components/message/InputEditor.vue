<script setup>
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const content = ref('')
const options = {
  debug: false,
  modules: {
    toolbar: false
  },
  placeholder: 'Enter发送/Shift+Enter换行',
  theme: 'snow'
}
</script>

<template>
  <QuillEditor
    v-model:content="content"
    :options="options"
    style="height: 100%; border: none"
  ></QuillEditor>
</template>

<style lang="scss">
.ql-editor {
  padding: 8px;
  font-size: 14px;
}
</style>
