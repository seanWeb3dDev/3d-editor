<!-- 贴图、粒子选择 -->
<template>
  <div class="drawer-div" v-if="type >= 0">
    <template v-if="type == 1">
      <el-button type="primary" @click="selectParticleFile" :disabled="disabled">
        选择{{ typeList[type] }}
      </el-button>
      <input
        ref="particleFileRef"
        type="file"
        accept=".glb"
        style="display: none"
        @change="onParticleFileChange"
      />
    </template>
    <template v-else-if="type == 0">
      <div
        class="img-upload-div"
        :class="{ 'has-img': hasImg !== '0', disabled }"
        :style="hasImg !== '0' && hasImg !== '1' ? { backgroundColor: hasImg } : undefined"
        @click.stop="openDrawer"
      >
        <canvas v-if="hasImg === '1'" ref="CanvasRef"></canvas>
        <el-icon v-if="!disabled && !props.data.notClear" @click.stop="clearData">
          <Close />
        </el-icon>
      </div>
    </template>

    <el-drawer v-model="drawer">
      <template #header>
        <div class="drawer-header"><i class="drawer-icon"></i>选择{{ typeList[type] }}</div>
      </template>
      <template #default>
        <div class="upload-div" v-if="type == 0" style="color: #000">
          <el-radio-group v-model="dataType" v-if="props.data.hasColor">
            <el-radio :value="0" label="颜色" />
            <el-radio :value="1" label="图片" />
          </el-radio-group>
          <div class="input-div">
            <el-color-picker
              v-if="props.data.hasColor && dataType != 1"
              v-model="colorVal"
              @active-change="changeColor"
            />
            <el-upload
              v-else
              class="drawer-img-upload"
              action="#"
              :http-request="(options) => httpRequest(options)"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :accept="accept"
              :disabled="disabled"
            >
              <template #trigger>选择本地文件</template>
            </el-upload>
          </div>
        </div>

        <el-scrollbar class="material-scrollbar" :class="{ small: type == 0 }">
          <div class="material-content">
            <div
              v-for="(item, index) in list"
              :class="{ select: selectIndex == index }"
              @click.stop="changeSelect(item, index)"
            >
              <div>
                <img :src="FILE_URL + item.thumbnailUrl" />
              </div>
              <div>
                <template v-if="getStrLen(item.name) <= 20">
                  {{ item.name }}
                </template>
                <el-tooltip v-else :content="item.name">{{ item.name }}</el-tooltip>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="">
import { useStore } from "vuex";
import { getStrLen } from "@/utils";

const { state } = useStore();

const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const FILE_URL = window.config.fileUrl;

const disabled = ref(true);

const typeList = ["贴图", "粒子"];
const type = ref(-1);
const selectIndex = ref(-1);

const drawer = ref(false);
const dataType = ref(0);
const accept = ref(".jpg,.png");

const colorVal = ref("#fff");

const list = computed(() => {
  switch (type.value) {
    case 0:
      return [...state.chartletList];
    case 1:
      return [...state.particleList];
    default:
      return [];
  }
});

const CanvasRef = ref();
const hasImg = ref("0");

const drawCanvas = async (v, s) => {
  if (s == 0) {
    hasImg.value = "1";
    await nextTick();
    const mw = CanvasRef.value.clientWidth,
      mh = CanvasRef.value.clientHeight;
    let width = v.width,
      height = v.height;
    if (width > mw) {
      height = (mw / width) * height;
      width = mw;
    }
    if (height > mh) {
      width = (mh / height) * width;
      height = mh;
    }
    CanvasRef.value.width = width;
    CanvasRef.value.height = height;
    const ctx = CanvasRef.value.getContext("2d");
    ctx.drawImage(v, 0, 0, width, height);
  } else {
    hasImg.value = v.value;
  }
};

const imgToImgBm = (url) => {
  return new Promise((reslove, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const imgB = await createImageBitmap(img);
        reslove(imgB);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reslove(null);
    };
    img.src = url;
  });
};

watch(
  () => props.data,
  async (val) => {
    // 模型贴图为ImageBitmap，背景图为url
    switch (val.inputType) {
      case "chartlet": // 贴图
        type.value = 0;
        if (val.value) {
          await nextTick();

          let img = null;
          if (val.value instanceof ImageBitmap) {
            img = val.value;
          } else {
            try {
              new URL(val.value);
              img = await imgToImgBm(val.value);
            } catch (error) {
              dataType.value = 0;
              drawCanvas(val, 1);
            }
          }
          if (img) {
            dataType.value = 1;
            drawCanvas(img, 0);
          }
        }
        break;
      case "particle": // 粒子
        type.value = 1;
        break;
    }
    disabled.value = !val?.writable;
  },
  { deep: true, immediate: true }
);

const openDrawer = () => {
  if (disabled.value) return;
  drawer.value = true;
  selectIndex.value = -1;
};

const beforeUpload = ({ type, size }) => {
  if (!["image/jpeg", "image/png"].includes(type)) {
    ElMessage.error("只能上传图片");
    return false;
  } else if (size / 1024 / 1024 > 200) {
    ElMessage.error("文件最大支持200MB!");
    return false;
  }
  return true;
};

const httpRequest = ({ file }) => {
  return new Promise(async (reslove) => {
    const img = new Image();
    img.onload = () => {
      drawCanvas(img, 0);
    };
    const url = URL.createObjectURL(file);
    img.src = url;
    emit("onChange", { key: props.data.key, val: url });
    reslove(true);
  });
};

const changeColor = (v) => {
  colorVal.value = v;
  if (props.data.isGlobal) {
    drawCanvas({ value: v }, 1);
  }
  emit("onChange", { key: props.data.key, val: String(colorVal.value) });
};

const changeSelect = (item, index) => {
  if (props.data.isGlobal) {
    const img = new Image();
    img.onload = () => {
      drawCanvas(img, 0);
    };
    img.src = FILE_URL + item.modelUrl;
  }
  selectIndex.value = index;
  emit("onChange", { key: props.data.key, val: FILE_URL + item.modelUrl });
};

const clearData = () => {
  hasImg.value = "0";
  emit("onChange", { key: props.data.key, val: null });
  if (type.value == 0) {
    const mw = CanvasRef.value.clientWidth,
      mh = CanvasRef.value.clientHeight;
    CanvasRef.value?.getContext("2d").clearRect(0, 0, mw, mh);
  }
};

// === 粒子实例：本地文件选择器 ===
const particleFileRef = ref();
const selectParticleFile = () => {
  if (disabled.value) return;
  particleFileRef.value?.click();
};
const onParticleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.name.endsWith(".glb")) {
    ElMessage.error("仅支持 .glb 文件");
    e.target.value = "";
    return;
  }
  // 转为 Blob URL 字符串再传递（避免 File 对象在 deepCopy 中被破坏）
  emit("onChange", { key: props.data.key, val: URL.createObjectURL(file) });
  e.target.value = "";
};
</script>

<style lang="less" scoped>
.drawer-div {
  width: 100%;

  .img-upload-div {
    position: relative;
    background-image: url(/src/assets/images/button/upload.png);
    background-repeat: no-repeat;
    background-size: 40px 32px;
    background-position: center center;
    border-radius: 2px;
    border: 1px solid #646464;
    cursor: pointer;

    &.has-img {
      background-image: none;
    }

    &.disabled {
      cursor: no-drop;
    }

    canvas {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }

    .el-icon {
      position: absolute;
      top: 0;
      right: 0;
      width: 24px;
      height: 24px;
      padding: 2px 2px 0 0;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 0 0 0 24px;
      justify-content: flex-end;
      align-items: flex-start;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
    }
  }

  :deep(.el-overlay) {
    background-color: rgba(0, 0, 0, 0.3);
  }

  :deep(.el-drawer) {
    width: 380px !important;
    background-color: #282828;
    box-shadow:
      2px 0px 6px 0px rgba(0, 0, 0, 0.6),
      inset 0px 0px 4px 0px rgba(0, 0, 0, 0.8);
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.23);

    .el-icon.el-drawer__close {
      color: rgba(255, 255, 255, 0.75);
    }

    .drawer-header {
      font-family: AlibabaPuHuiTiM;
      font-size: 16px;
      color: #ffffff;
      display: flex;
      align-items: center;

      .drawer-icon {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-image: url(^/editor/drawer.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center center;
        margin-right: 12px;
      }
    }

    .el-drawer__body {
      padding: 13px;
    }

    .upload-div {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 20px;

      .el-radio-group {
        margin-right: 10px;
        font-family: AlibabaPuHuiTiM;
        font-size: 14px;
        color: #ffffff;

        .el-radio {
          margin-right: 5px;
          margin-left: 10px;

          .el-radio__label {
            padding-left: 5px;
          }
        }
      }

      .input-div {
        width: 100px;

        .drawer-img-upload {
          .el-upload {
            font-family: AlibabaPuHuiTiM;
            font-size: 14px;
            color: #0f8dff;
            display: flex;
            align-items: center;

            &::after {
              content: "";
              display: inline-block;
              width: 16px;
              height: 16px;
              background-image: url(^/editor/arrow.png);
              background-size: 100% 100%;
              background-repeat: no-repeat;
              background-position: center center;
            }
          }
        }

        .el-color-picker {
          width: 100%;

          .el-color-picker__trigger {
            width: 100%;
          }
        }
      }
    }

    .material-scrollbar {
      width: 100%;
      height: 100%;
      padding: 0 11px;

      &.small {
        height: calc(100% - 60px);
      }

      .material-content {
        width: calc(100% - 5px);
        display: flex;
        flex-wrap: wrap;
        gap: 36px;
        row-gap: 32px;

        & > div {
          cursor: pointer;

          & > div {
            &:nth-child(1) {
              width: 80px;
              height: 80px;
              border-radius: 3px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              margin-bottom: 12px;
              padding: 10px;

              img {
                max-width: 100%;
                max-height: 100%;
              }

              &:hover {
                background-color: rgba(255, 255, 255, 0.1);
              }

              &.select {
                background-color: rgba(15, 141, 255, 0.15);
                border-color: #0f8dff;
              }
            }

            &:nth-child(2) {
              width: 100%;
              text-align: center;
              font-family: AlibabaPuHuiTiR;
              font-size: 14px;
              color: #ffffff;

              :deep(.el-tooltip__trigger) {
                max-width: 100%;
                display: inline-block;
                .overflow-label();
              }
            }
          }
        }
      }
    }
  }
}
</style>
