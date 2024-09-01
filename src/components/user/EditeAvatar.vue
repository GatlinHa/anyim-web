<script setup>
import { ref } from 'vue'
import { userStore } from '@/stores'
import { Plus, Upload } from '@element-plus/icons-vue'
import selectAvatar from '@/assets/select_avatar.jpg'
import { userUploadAvatarService, userModifySelfService } from '@/api/user'

defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const userData = userStore()

const uploadRef = ref()
const imgUrl = ref(userData.user.avatar)
const isLoading = ref(false)
let selectedFile

const onSelected = (file) => {
  console.log('onSelected')
  imgUrl.value = URL.createObjectURL(file.raw)
  selectedFile = file.raw
}

const onSuccess = () => {
  console.log('onSuccess')
}

const beforeUpload = () => {
  console.log('beforeUpload')
}

const onUpload = async () => {
  console.log('onUpload')
  if (!selectedFile) {
    ElMessage.warning('您还未选择新头像！')
    return
  }

  isLoading.value = true
  try {
    const res = await userUploadAvatarService({ file: selectedFile })
    const { originUrl, thumbUrl } = res.data.data
    await userModifySelfService({ avatar: originUrl, avatarThumb: thumbUrl })
    userData.getUser()
    ElMessage.success('头像上传成功')
    emit('update:modelValue', false)
    selectedFile = null
  } catch (error) {
    /* empty */
  } finally {
    isLoading.value = false
  }
}

// 打开的时候触发
const onOpen = () => {
  imgUrl.value = userData.user.avatar
}

// 关闭的时候触发
const onClose = () => {
  isLoading.value = false
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
          :on-success="onSuccess"
          :before-upload="beforeUpload"
        >
          <img :src="imgUrl || selectAvatar" class="avatar" />
        </el-upload>
      </div>

      <div class="right-area">
        <div class="preview-area">
          <span style="font-size: 16px">预览</span>

          <el-avatar class="preview-100" :src="imgUrl || selectAvatar" />
          <span>100×100</span>
          <el-avatar class="preview-40" :src="imgUrl || selectAvatar" />
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

img {
  width: 400px;
  height: 400px;
  object-fit: cover;
  text-align: center;
  border-radius: 10px;
}
</style>
