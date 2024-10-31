<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, MoreFilled } from '@element-plus/icons-vue'
import AddButton from '@/components/common/AddButton.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import HashNoData from '@/components/common/HasNoData.vue'
import { userCreatePartitionService, userQueryPartitionService } from '@/api/user'
import { PARTITION_TYPE } from '@/const/userConst'
import { ElMessage } from 'element-plus'

const partitions = ref([])
const totalCount = ref(0)
const partitionSearchKey = ref('')
const userSearchKey = ref('')
const isShowEditDialog = ref(false)

onMounted(async () => {
  const res = await userQueryPartitionService()
  partitions.value = res.data.data
})

const partitionShowList = computed(() => {
  if (!partitionSearchKey.value) {
    return partitions.value
  } else {
    const arr = []
    partitions.value.forEach((item) => {
      if (item.partitionName.toLowerCase().includes(partitionSearchKey.value.toLowerCase())) {
        arr.push(item)
      }
    })
    return arr
  }
})

const onAddPartitionConfirm = (inputValue) => {
  userCreatePartitionService({
    partitionName: inputValue,
    partitionType: PARTITION_TYPE.USER
  }).then((res) => {
    if (res.data.code === 0) {
      partitions.value = res.data.data
      ElMessage.success('新建分组成功')
    }
  })
  isShowEditDialog.value = false
}

const showOperationMenu = (partitionId) => {
  console.log(partitionId)
}
</script>

<template>
  <el-container class="sub-partition-wrapper">
    <el-aside class="partition bdr-r">
      <el-container style="height: 100%">
        <el-header class="bdr-b">
          <el-input
            v-model="partitionSearchKey"
            placeholder="搜索: 分组名称"
            :prefix-icon="Search"
            :clearable="true"
          />
          <AddButton :size="20" @click="isShowEditDialog = true"></AddButton>
        </el-header>
        <el-main class="my-scrollbar">
          <el-menu
            v-if="partitionShowList.length > 0"
            :default-active="partitionShowList[0].partitionId.toString()"
          >
            <el-menu-item
              v-for="item in partitionShowList"
              :key="item.partitionId"
              :index="item.partitionId.toString()"
            >
              <span class="text-ellipsis">{{ item.partitionName }}</span>
              <el-icon @click="showOperationMenu(item.partitionId)"><MoreFilled /></el-icon>
            </el-menu-item>
          </el-menu>
          <HashNoData v-else :size="50"></HashNoData>
        </el-main>
      </el-container>
    </el-aside>
    <el-main class="detail">
      <el-header class="bdr-b">
        <div style="font-size: 14px">全部({{ totalCount }})</div>
        <div class="search-and-add">
          <el-input
            v-model="userSearchKey"
            placeholder="搜索：昵称/账号"
            :prefix-icon="Search"
            :clearable="true"
          />
          <AddButton :size="20"></AddButton>
        </div>
      </el-header>
      <el-main></el-main>
    </el-main>
  </el-container>
  <EditDialog
    :isShow="isShowEditDialog"
    :title="'添加分组'"
    :placeholder="'请输入分组名称'"
    @close="isShowEditDialog = false"
    @confirm="onAddPartitionConfirm"
  ></EditDialog>
</template>

<style lang="scss" scoped>
.sub-partition-wrapper {
  height: 100%;
  display: flex;
  justify-content: start;

  .partition {
    width: 190px;

    .el-header {
      height: 48px;
      padding: 0 8px 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .el-input {
        width: 140px;
        height: 30px;

        :deep(.el-input__wrapper) {
          border-radius: 25px;
        }
      }
    }

    .el-main {
      padding: 5px;
      overflow-y: scroll;

      .el-menu {
        border: 0;
        --el-menu-bg-color: #f5f5f5;
      }

      .el-menu-item {
        height: 40px;
        padding: 0 0 0 10px;
        border-radius: 4px;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        cursor: auto;

        &:hover {
          background-color: #dedfe0;
        }

        .el-icon {
          cursor: pointer;
        }
      }

      .is-active {
        background-color: #dedfe0;
      }
    }
  }

  .detail {
    padding: 0;

    .el-header {
      height: 48px;
      padding: 0 16px 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-and-add {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .el-input {
          width: 150px;
          height: 30px;
          margin-right: 10px;

          :deep(.el-input__wrapper) {
            border-radius: 25px;
          }
        }
      }
    }

    .el-main {
    }
  }
}
</style>
