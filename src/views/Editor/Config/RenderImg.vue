<!-- 渲染图及配置 -->
<template>
  <!-- 渲染器 -->
  <div class="iframe-div">
    <iframe
      v-if="dialogVisible"
      ref="RenderIframeRef"
      :src="iframeSrc"
      :style="iframeStyle"
      frameborder="0"
    ></iframe>
    <div></div>
  </div>

  <!-- 配置 -->
  <div class="config-content">
    <!-- 视角设置 -->
    <div class="field">
      <span>视角设置</span>
      <div>
        <el-button type="primary" size="small" @click="addView" :disabled="selfConfig.views.length >= 3">
          ＋ 添加视角
        </el-button>
      </div>
    </div>
    <div v-for="(item, index) in selfConfig.views" class="field">
      <span>视角{{ index + 1 }}</span>
      <div class="view-controls">
        <el-radio-group :model-value="item.used ? index : -1" @change="onViewRadioChange(index)">
          <el-radio :value="index" :disabled="item.data == null"></el-radio>
        </el-radio-group>
        <el-input
          class="view-coord-input"
          :class="{ 'view-coord-unset': !item.data }"
          :model-value="item.data ? formatPosition(item.data.global_camera_position) : '请设置视角'"
          readonly
          size="small"
        />
        <span class="actions">
          <el-button link @click="setView(index)" title="设置视角"><i class="icon-img edit"></i></el-button>
          <el-button link @click="deleteView(index)" v-if="selfConfig.views.length > 1" title="删除"><i class="icon-img delete"></i></el-button>
        </span>
      </div>
    </div>
    <!-- 尺寸设置 -->
    <div class="field">
      <span>尺寸设置</span>
      <div>
        <el-button type="primary" size="small" @click="addSize" :disabled="selfConfig.sizes.length >= 3">
          ＋ 添加尺寸
        </el-button>
      </div>
    </div>
    <div v-for="(item, index) in selfConfig.sizes" class="field">
      <span>尺寸{{ index + 1 }}</span>
      <div class="size-controls">
        <el-radio-group :model-value="item.used ? index : -1" @change="onSizeRadioChange(index)">
          <el-radio :value="index" :disabled="item.width == null || item.width === ''"></el-radio>
        </el-radio-group>
        <el-select class="custom-select" v-model="item.size" size="small">
          <el-option :value="0" label="1x1" />
          <el-option :value="1" label="4x3" />
          <el-option :value="2" label="16x9" />
        </el-select>
        <span class="size-label">宽度:</span>
        <el-input class="custom-input" v-model="item.width" size="small" @input="(v) => onWidthInput(v, index)" />
        <span class="size-unit">px</span>
        <span class="actions">
          <el-button link @click="deleteSize(index)" v-if="selfConfig.sizes.length > 1" title="删除"><i class="icon-img delete"></i></el-button>
        </span>
      </div>
    </div>
    <div class="field">
      <span>去除背景</span>
      <div>
        <el-checkbox v-model="selfConfig.rmBg" />
      </div>
    </div>
    <div class="field">
      <span>正交相机</span>
      <div>
        <el-checkbox v-model="selfConfig.orthoCamera" />
      </div>
    </div>
    <div class="field">
      <span>保存设置</span>
      <div class="switch-row">
        <el-switch v-model="selfConfig.saveScene" />
        <span class="switch-desc">每次渲染时重新保存场景</span>
      </div>
    </div>
  </div>

  <!-- 渲染图 -->
  <el-dialog
    v-model="dialogVisible"
    title="渲染图"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="beforeClose"
  >
    <div
      class="img-div"
      :class="{ 'no-img': renderImgSrc == '' }"
      :style="imgStyle"
      v-loading="loading"
      element-loading-text="场景渲染中..."
    >
      <img v-show="renderImgSrc !== ''" class="render-img" :src="renderImgSrc" alt="" />
    </div>
    <div style="width: 100%; text-align: center">
      <el-button type="primary" :disabled="renderImgSrc == ''" @click="downOrGoOn">
        {{ rendering ? "下载当前图片" : "继续渲染" }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup name="">
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { deepCopy } from "@/utils";
import bus from "@/utils/bus";

const props = defineProps({ config: { type: Object, default: {} } });

const emit = defineEmits(["callback", "close"]);

const { state, dispatch } = useStore();

let renderMode = 0;

const selfConfig = reactive({
  views: [{ data: null, used: false }],
  sizes: [{ size: 0, width: null, used: false }],
  rmBg: true,
  orthoCamera: true,
  saveScene: false,
});

const loadRenderConfig = () => {
  const v = props.config;
  if (v.views === undefined || v.views.length <= 0) {
    selfConfig.views = [{ data: null, used: false }];
  } else {
    selfConfig.views = v.views;
  }
  if (v.sizes === undefined || v.sizes.length <= 0) {
    selfConfig.sizes = [{ size: 0, width: null, used: false }];
  } else {
    selfConfig.sizes = v.sizes;
  }
  if (v.rmBg === undefined) {
    selfConfig.rmBg = true;
  } else {
    selfConfig.rmBg = v.rmBg;
  }
  if (v.orthoCamera === undefined) {
    selfConfig.orthoCamera = true;
  } else {
    selfConfig.orthoCamera = v.orthoCamera;
  }
  if (v.saveScene === undefined) {
    selfConfig.saveScene = false;
  } else {
    selfConfig.saveScene = v.saveScene;
  }
};

watch(selfConfig, () => updateConfig(), { deep: true });

/** 更新渲染配置 */
const updateConfig = () => {
  bus.emit("update_editor_config", { key: "renderImgConfig", val: { ...selfConfig } });
};

const setView = (i) => {
  const obj = {
    func: ["_FUNCS", "getViewAngle"],
    callback: (val) => {
      if (val) {
        selfConfig.views[i].data = val;
        // 如果当前视角已选中，同步加载到画布
        if (selfConfig.views[i].used) {
          loadView(val);
        }
      }
    },
  };
  bus.emit("use_map_function", obj);
};

const loadView = (view) => {
  const obj = {
    func: ["_FUNCS", "setViewAngle"],
    param: deepCopy(view),
  };
  bus.emit("use_map_function", obj);
};

const addView = () => selfConfig.views.push({ data: null, used: false });

const deleteView = (index) => {
  const wasUsed = selfConfig.views[index].used;
  selfConfig.views.splice(index, 1);
  // 如果删除的是选中态，选中第一个有数据的视角
  if (wasUsed) {
    const firstWithData = selfConfig.views.findIndex((m) => m.data != null);
    if (firstWithData >= 0) {
      selfConfig.views[firstWithData].used = true;
    }
  }
};

const onViewRadioChange = (index) => {
  selfConfig.views.forEach((m, i) => (m.used = i === index));
  // 用户手动点击单选框时，加载视角到画布
  const view = selfConfig.views[index];
  if (view.data) {
    loadView(view.data);
  }
};

const formatPosition = (pos) => {
  if (!pos || !Array.isArray(pos)) return '';
  return pos.map((v) => Math.round(v)).join(', ');
};

const addSize = () => selfConfig.sizes.push({ size: 0, width: null, used: false });

const deleteSize = (index) => {
  const wasUsed = selfConfig.sizes[index].used;
  selfConfig.sizes.splice(index, 1);
  // 如果删除的是选中态，选中第一个有宽度的尺寸
  if (wasUsed) {
    const firstWithWidth = selfConfig.sizes.findIndex((m) => m.width != null && m.width !== '');
    if (firstWithWidth >= 0) {
      selfConfig.sizes[firstWithWidth].used = true;
    }
  }
};

const onSizeRadioChange = (index) => {
  selfConfig.sizes.forEach((m, i) => (m.used = i === index));
};

/** 宽度输入只允许正整数 */
const onWidthInput = (val, index) => {
  const cleaned = val.replace(/[^\d]/g, '');
  selfConfig.sizes[index].width = cleaned;
};

const dialogVisible = ref(false);
const dialogWidth = ref("40rem");

const loading = ref(false);
const renderImgSrc = ref("");
/** 图片大小 */
const imgStyle = reactive({ width: "0px", height: "0px" });
const RenderIframeRef = ref();
const iframeSrc = ref("");
/** iframe大小 */
const iframeStyle = reactive({ width: "0px", height: "0px" });

/** 开始渲染 */
const startRender = () => {
  if (!selfConfig.views.some((m) => m.used) || !selfConfig.sizes.some((m) => m.used)) {
    ElMessage.info("请选择渲染视角和尺寸");
    return;
  }
  const usedSize = selfConfig.sizes.find((m) => m.used);
  if (!usedSize || !usedSize.width || Number(usedSize.width) <= 0) {
    ElMessage.info("请设置有效的渲染尺寸宽度");
    return;
  }
  let w = Number(usedSize.width),
    h = 0;
  switch (usedSize.size) {
    case 0:
      h = w;
      break;
    case 1:
      h = (w / 4) * 3;
      break;
    case 2:
      h = (w / 16) * 9;
      break;
  }
  iframeStyle.width = `${w}px`;
  iframeStyle.height = `${h}px`;
  const scale = Number(document.documentElement.style.fontSize.replace("px", ""));
  if (w >= 800 || w <= 200) {
    if (w >= 800) {
      w = 800;
    } else if (w <= 200) {
      w = 200;
    }
    switch (usedSize.size) {
      case 0:
        h = w;
        break;
      case 1:
        h = (w / 4) * 3;
        break;
      case 2:
        h = (w / 16) * 9;
        break;
    }
  }
  dialogWidth.value = `${w / scale + 6}rem`;
  imgStyle.width = `${w / scale}rem`;
  imgStyle.height = `${h / scale}rem`;

  // 始终保存配置，根据开关决定是否同时保存场景
  if (selfConfig.saveScene) {
    bus.emit("save-map", 3);  // 保存配置+模型后渲染
  } else {
    bus.emit("save-map", 4);  // 仅保存配置后渲染
  }
};

/** 加载渲染器 */
const laodMapRender = async () => {
  loading.value = true;
  dialogVisible.value = true;

  await nextTick();
  if (RenderIframeRef.value) {
    RenderIframeRef.value.onload = async () => {
      if (state.baseInfo?.id) {
        const { config } = await dispatch("getProjecConfig", {
          id: state.baseInfo.id,
          hasWeb: false,
        });
        if (config) {
          sendIframeMeg({ cmd: "main_config", param: config });
        } else {
          ElMessage.info("未找到项目配置信息");
        }
      }
    };
    iframeSrc.value = window.config.three_runner + "?renderImg=1";

    rendering.value = true;
  }
};

/** 关闭前 */
const beforeClose = (done) => {
  renderImgSrc.value = "";
  iframeSrc.value = "";
  done();
};

const rendering = ref(false);

/** 发送消息到渲染器 */
const sendIframeMeg = (data) => {
  if (RenderIframeRef.value && RenderIframeRef.value.contentWindow) {
    RenderIframeRef.value.contentWindow.postMessage(JSON.parse(JSON.stringify(data)), "*");
  }
};

/** 下载当前图片 */
const downloadImg = () => {
  const link = document.createElement("a");
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  link.href = renderImgSrc.value;
  link.download = "渲染图.png";
  link.dispatchEvent(new MouseEvent("click"));
};

/** 下载或者继续渲染 */
const downOrGoOn = () => {
  if (renderMode == 0) {
    downloadImg();
  } else {
    if (rendering.value) {
      sendIframeMeg({ cmd: "_renderSwitch", param: false });
      downloadImg();
    } else {
      sendIframeMeg({ cmd: "_renderSwitch", param: true });
    }
    rendering.value = !rendering.value;
  }
};

const handelMsg = (e) => {
  if (!event.data) return;
  const { cmd, param } = event.data;
  if (!cmd) return;
  if (cmd == "screenShot") {
    loading.value = false;
    /** 更新图片 */
    renderImgSrc.value = URL.createObjectURL(param);
  }
};

defineExpose({ startRender });

onMounted(async () => {
  bus.on("save-render", laodMapRender);
  bus.on("change-render-mode", (v) => (renderMode = v ? 1 : 0));

  window.onmessage = handelMsg;

  await nextTick();
  loadRenderConfig();
});

onBeforeUnmount(() => {
  bus.off("save-render");

  window.onmessage = null;
});
</script>

<style lang="less" scoped>
.config-content {
  .switch-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .switch-desc {
      font-size: 14px;
      color: #ffffff;
      white-space: nowrap;
    }
  }

  .view-controls,
  .size-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .el-radio-group {
      display: flex;
      align-items: center;
    }

    .view-coord {
      font-size: 12px;
      color: #909399;
      font-family: monospace;

      &--unset {
        color: #c0c4cc;
      }
    }

    .size-label {
      font-size: 12px;
      color: #909399;
      white-space: nowrap;
    }

    .size-unit {
      font-size: 12px;
      color: #909399;
    }

    .view-coord-input {
      width: 11rem;

      :deep(.el-input__wrapper) {
        background-color: #2b2b2b;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
        height: 1.5rem;
        padding: 0 8px;
      }

      :deep(.el-input__inner) {
        color: #fff;
        cursor: default;
        height: 1.5rem;
      }

      &.view-coord-unset {
        :deep(.el-input__inner) {
          color: #606266;
        }
      }
    }

    .custom-input {
      width: 3.8rem;
    }

    .custom-select {
      width: 5.5rem;
    }

    .actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0;

      .el-button {
        padding: 4px;

        & + .el-button {
          margin-left: 0;
        }
      }
    }
  }
}

.dialog-foot {
  width: 100%;
  text-align: center;
  padding: 20px 0;
}

.img-div {
  width: 100%;
  height: auto;
  margin: 0 auto;
  margin-bottom: 20px;
  position: relative;

  &.no-img {
    background-image: url(^/no-img.png);
    background-size: 140px 134px;
    background-position: center center;
    background-repeat: no-repeat;
  }

  .render-img {
    width: 100%;
    height: 100%;
  }

  :deep(.el-loading-mask) {
    background-color: rgba(255, 255, 255, 0.3);

    .el-loading-text {
      margin-top: 40px;
    }
  }
}

.iframe-div {
  width: 100%;
  height: 1px;
  overflow: hidden;
  position: relative;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  div {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #282828;
    z-index: 9;
  }
}
</style>
