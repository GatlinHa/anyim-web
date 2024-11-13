<script setup>
import { ref } from 'vue'
import { userStore } from '@/stores'
import { Plus, Upload } from '@element-plus/icons-vue'
import { userUploadAvatarService } from '@/api/user'
import { ElMessage } from 'element-plus'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'update:newAvatar'])
const userData = userStore()

const uploadRef = ref()
const cropper = ref()
const img = ref('')
const previewImg = ref('')
const isLoading = ref(false)
const fileName = ref('')

// 打开的时候触发
const onOpen = () => {
  fileName.value = userData.user.avatar?.split('/').pop()
  img.value = userData.user.avatar
  previewImg.value = img.value
}

// 关闭的时候触发
const onClose = () => {
  isLoading.value = false
}

// 选择了文件触发
const onSelected = (file) => {
  fileName.value = file.name
  img.value = URL.createObjectURL(file.raw)
  previewImg.value = img.value
}

const onUpload = async () => {
  cropper.value.getCropBlob(async (blob) => {
    const lastDotIndex = fileName.value.lastIndexOf('.')
    const prefix = fileName.value.substring(0, lastDotIndex)
    const suffix = fileName.value.substring(lastDotIndex)
    let file = new File(
      [blob],
      `${prefix}_${cropper.value.cropW}x${cropper.value.cropH}${suffix}`,
      {
        type: blob.type,
        lastModified: Date.now()
      }
    )

    isLoading.value = true
    try {
      const res = await userUploadAvatarService({ file: file })
      emit('update:newAvatar', res.data.data)
      emit('update:modelValue', false)
      ElMessage.success('头像上传成功')
    } catch (error) {
      /* empty */
    } finally {
      isLoading.value = false
    }
  })
}

const stopCrop = () => {
  cropper.value.getCropData((data) => {
    previewImg.value = data
  })
}
</script>

<template>
  <el-dialog
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', false)"
    @open="onOpen"
    @close="onClose"
    title="更换头像"
    width="700"
  >
    <div class="edit-avatar">
      <div class="left-area">
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onSelected"
        >
          <div class="canvas" @click.stop style="width: 400px; height: 400px">
            <vueCropper
              ref="cropper"
              class="avatar"
              :img="img"
              :full="true"
              :autoCrop="true"
              :autoCropWidth="250"
              :autoCropHeight="250"
              :canScale="true"
              :centerBox="true"
              @mouseup="stopCrop"
            ></vueCropper>
          </div>
        </el-upload>
      </div>

      <div class="right-area">
        <div class="preview-area">
          <span style="font-size: 16px">预览</span>

          <el-avatar class="preview-100" :src="previewImg" />
          <span>100×100</span>
          <el-avatar class="preview-40" :src="previewImg" />
          <span>40×40</span>
        </div>
        <div class="button-area">
          <el-button
            type="primary"
            :icon="Plus"
            size="large"
            @click="uploadRef.$el.querySelector('input').click()"
          >
            选择图片
          </el-button>
          <el-button
            type="success"
            :icon="Upload"
            size="large"
            @click="onUpload"
            :loading="isLoading"
          >
            上传头像
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.edit-avatar {
  display: flex;
  .right-area {
    // width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 20px;

    .preview-area {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      .el-avatar {
        margin-top: 30px;
      }
    }

    .button-area {
      width: 100%;
      display: flex;
      justify-content: space-around;
      margin-bottom: 5px;
    }
  }

  .preview-100 {
    width: 100px;
    height: 100px;
  }

  .preview-40 {
    width: 40px;
    height: 40px;
  }
}
</style>
