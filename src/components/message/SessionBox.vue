<script setup>
import AvatarIcon from './AvatarIcon.vue'
import SessionTag from './SessionTag.vue'

const props = defineProps(['user'])
</script>

<template>
  <div class="session-box">
    <AvatarIcon :user="props.user"></AvatarIcon>
    <div class="content-box">
      <div class="header">
        <div class="title">
          <span class="nickname">{{ props.user.nickName }}</span>
          <SessionTag tagType="group"></SessionTag>
          <SessionTag tagType="team"></SessionTag>
          <SessionTag tagType="organize"></SessionTag>
          <SessionTag tagType="assistant"></SessionTag>
          <SessionTag tagType="pinToTop"></SessionTag>
        </div>
        <div class="datetime">
          <span>15:10</span>
        </div>
      </div>
      <div class="body">
        <div class="content">
          <span>你吃饭了吗啊啊啊啊啊啊啊啊啊？</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.session-box {
  height: 50px;
  margin: 5px;
  padding: 4px;
  padding-right: 0;
  display: flex;
  align-items: center;
  user-select: none;
  // cursor: pointer;

  &:hover {
    background-color: #c6e2ff;
    border-radius: 6px;
  }

  .content-box {
    width: 100%;
    height: 100%;
    margin-left: 10px;
    display: flex;
    flex: 1 1;
    flex-direction: column;
    overflow: hidden;

    .header {
      width: 100%;
      height: 24px;
      display: flex;
      align-items: center;

      .title {
        line-height: 20px;
        display: flex;
        flex: 1 1;
        align-items: center;
        overflow: hidden;

        .nickname {
          font-size: 14px;
          margin-right: 5px;
          white-space: nowrap; /*不换行*/
          overflow: hidden; /*超出的文本隐藏*/
          text-overflow: ellipsis; /* 溢出用省略号*/
        }
      }

      .datetime {
        display: block;
        margin-left: 10px;
        width: 40px;
        font-size: 12px;
        color: gray;
      }
    }

    .body {
      width: 100%;
      height: 20px;
      display: flex;

      .content {
        font-size: 12px;
        color: gray;
        white-space: nowrap; /*不换行*/
        overflow: hidden; /*超出的文本隐藏*/
        text-overflow: ellipsis; /* 溢出用省略号*/
      }
    }
  }
}
</style>
