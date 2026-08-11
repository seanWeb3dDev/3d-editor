<!-- 进度及遮罩 -->
<template>
  <div class="loading" v-if="props.loading">
    <div class="text">{{ props.text }}</div>
    <div class="process" v-if="props.hasRate">
      <el-progress :percentage="props.process" v-if="props.loadProcess >= 0" />
    </div>
  </div>
</template>

<script setup name="">
const props = defineProps({
  loading: { type: Boolean, default: false },
  text: { type: String, default: "资源加载中" },
  process: { type: Number, default: 20 },
  hasRate: { type: Boolean, default: true },
});
</script>

<style lang="less" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .text {
    font-family: "YouSheBiaoTiHei";
    font-size: 32px;
    color: #e8e8e8;
    margin-bottom: 20px;
  }

  .process {
    width: 600px;
    height: 30px;

    :deep(.el-progress) {
      * {
        height: 12px !important;
      }
      .el-progress-bar {
        width: 500px;
        height: 12px;
        border-radius: 6px;
        border: 1px solid #595b5d;
        margin-right: 20px;
      }
      .el-progress-bar__outer {
        background-color: #383a3d;
        overflow: initial;

        .el-progress-bar__inner {
          height: 12px;
          background: linear-gradient(to left, #158bff 0%, #42f3ff 100%);
          border-radius: 6px;
          box-shadow: 0 0 6px 6px rgba(66, 243, 255, 0.8);
          animation-duration: 1s !important;
        }
      }

      .el-progress__text {
        width: 80px;
        font-family: "YouSheBiaoTiHei";
        font-size: 32px !important;
        color: #56beff;
        line-height: 12px;
      }
    }
  }
}
</style>
