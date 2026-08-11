<!-- 编辑器首页 -->
<template>
  <header class="edit-header">
    <div class="sys-box">
      <div class="sys-icon"></div>
      {{ projectName }}
    </div>
    <div class="header-actions">
      <el-button size="small" type="primary" @click="saveScene">保存场景</el-button>
      <el-button size="small" type="warning" @click="resetScene">重置场景</el-button>
      <el-button size="small" @click="showConfig = true">配置</el-button>
      <el-button size="small" @click="mcpDialogVisible = true">
        <span class="mcp-dot" :class="mcpStatus"></span>
        MCP
      </el-button>
    </div>
  </header>

  <!-- 配置弹窗 -->
  <el-dialog v-model="showConfig" title="全局配置" width="480px" :append-to-body="true" destroy-on-close>
    <config-vue v-if="showConfig" />
  </el-dialog>

  <!-- MCP 连接弹窗 -->
  <el-dialog v-model="mcpDialogVisible" title="MCP Server" width="420px" :append-to-body="true">
    <el-form label-width="110px">
      <el-form-item label="Server 地址">
        <el-input v-model="mcpForm.url" placeholder="ws://localhost:3000" :disabled="mcpSwitch" />
      </el-form-item>
      <el-form-item label="连接 ID">
        <el-input v-model="mcpForm.id" placeholder="输入一个连接标识" :disabled="mcpSwitch" />
      </el-form-item>
      <el-form-item label="连接开关">
        <el-switch v-model="mcpSwitch" @change="onMcpSwitch" />
      </el-form-item>
    </el-form>
  </el-dialog>

  <div class="content-div">
    <div class="resource-div" :style="{ width: `${widthL}rem` }">
      <left-vue
        ref="LeftRef"
        :addObjectList="AddObjectList"
        @callback="(obj) => useEditor(obj, 'left')"
      />
      <div class="size-div" :style="{ cursor: enablePanelResize ? 'ew-resize' : 'default' }" @mousedown="mousedownLeft"></div>
    </div>
    <div class="three-div">
      <div style="width: 100%; height: 100%" ref="ThreeRef">
        <!-- three.js容器，点击事件无效 -->
      </div>
      <div class="render-info" style="z-index: 9">
        <div>三角面数:{{ renderInfo.triangles }}</div>
        <div>该帧渲染用时:{{ renderInfo.frame }}</div>
        <div>每帧绘制调用次数:{{ renderInfo.calls }}</div>
      </div>

      <!--操作工具栏-->
      <action-bar-vue @callback="useEditor" />
    </div>
    <div class="property_div" :style="{ width: `${widthR}rem` }">
      <right-vue ref="RightRef" @callback="(obj) => useEditor(obj, 'right')" />
      <div class="size-div" :style="{ cursor: enablePanelResize ? 'ew-resize' : 'default' }" @mousedown="mousedownRight"></div>
    </div>
  </div>
  <!-- 加载 -->
  <LoadingVue :loading="loading" :text="loadText" :process="loadProcess" :has-rate="hasRate" />

  <!-- 工具 -->
  <index-component
    v-if="editorReady"
    ref="ToolRef"
    :height-material="heightM"
    @callback="useEditor"
    @mouseDown="mouseDownMaterial"
  />
</template>

<script setup name="">
import { useStore } from "vuex";
import { deepCopy } from "@/utils/index";
import Editor from "./Editor/Index";
import LoadingVue from "@/components/Loading/Index.vue";
import IndexComponent from "./IndexComponent.vue";
import ActionBarVue from "./ActionBar.vue";
import LeftVue from "./Left/Index.vue";
import RightVue from "./Right/Index.vue";
import ConfigVue from "./Config/Index.vue";
import bus from "@/utils/bus";
import { clearSceneFromIDB } from "@/utils/idb";
import { MCPClient } from "@/editor/core/mcp/index.js";
import { ElMessage, ElMessageBox } from "element-plus";

const store = useStore();
const { state, commit } = store;

let EditorClass;

const editorId = ref(-1);
const projectName = computed(() => state.baseInfo.name);

const ThreeRef = ref();
const LeftRef = ref();
const RightRef = ref();
const ToolRef = ref();

/** 编辑器就绪标志：EditorClass 初始化完成后才挂载 IndexComponent（含 ToolBar），
 *  避免 ToolBar 的 onMounted 在 EditorClass 未就绪时请求 getEditorSetting 被守卫吞掉 */
const editorReady = ref(false);
const showConfig = ref(false);

/* ==================== MCP 连接 ==================== */
/** 连接状态：disconnected | connecting | connected | error */
const mcpStatus = ref("disconnected");
const mcpSwitch = ref(false);
const mcpDialogVisible = ref(false);
const mcpForm = reactive({ url: "ws://localhost:3000", id: "" });
let mcpClient = null;
let mcpHadError = false;

/** 弹框内 switch：开 → 连接，关 → 断开 */
const onMcpSwitch = (val) => {
  if (val) {
    connectMcp();
  } else {
    disconnectMcp();
  }
};

/** 连接 MCP Server */
const connectMcp = () => {
  if (!mcpForm.url || !mcpForm.id) {
    ElMessage.warning("请填写 Server 地址和连接 ID");
    mcpSwitch.value = false;
    return;
  }
  if (!EditorClass) {
    mcpSwitch.value = false;
    return;
  }

  mcpHadError = false;
  mcpStatus.value = "connecting";

  mcpClient = new MCPClient(EditorClass.editor, {
    projectId: mcpForm.id,
    url: mcpForm.url,
    onConnected: () => {
      mcpStatus.value = "connected";
      ElMessage.success(`MCP 已连接：${mcpForm.id}`);
    },
    onError: () => {
      mcpHadError = true;
      mcpStatus.value = "error";
      mcpSwitch.value = false;  // 连接失败，switch 回 off
    },
    onDisconnected: () => {
      // 连接失败（onerror 后紧跟 onclose）保持红色，正常断开回灰色
      if (!mcpHadError) mcpStatus.value = "disconnected";
      mcpHadError = false;
    },
  });
  mcpClient.connect();
};

/** 断开 MCP 连接 */
const disconnectMcp = () => {
  mcpClient?.disconnect();
  mcpClient = null;
  mcpStatus.value = "disconnected";
  mcpSwitch.value = false;
};

/** 保存场景 */
const saveScene = () => {
  if (!EditorClass) return;
  EditorClass.save(0);
};

/** 重置场景 */
const resetScene = () => {
  ElMessageBox.confirm("确定要重置场景吗？所有未保存的修改将丢失。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    if (!EditorClass) return;
    EditorClass.editor.editorEM.removeAllObject.dispatch();
    EditorClass.editor.editorEM.sceneGraphChanged.dispatch();
    await clearSceneFromIDB();
    ElMessage.success("场景已重置");
  }).catch(() => {});
};

const dataCallback = (config, clear) => {
  if (clear == true) {
    commit("clearPointList");
    commit("clearConfigList");
  }
  if (config && Object.keys(config).length > 0) {
    config.configList.forEach((item) => commit("pushConfigList", item));
    config.pointData.forEach((item) => commit("pushPointList", item));
    let pointConfig = {};
    Object.keys(config).forEach((key) => {
      pointConfig[key] = config[key];
    });
    ToolRef.value?.setValue(pointConfig, "data");
  }
};

const useEditor = ({ func, param, callback }, module) => {
  if (!EditorClass) return;
  console.self(func, param);
  let res;
  if (param != undefined) {
    if (typeof param === "object") {
      if (param instanceof Array) {
        res = EditorClass.func(func, param);
      } else {
        res = EditorClass.func(func, deepCopy(param));
      }
    } else {
      res = EditorClass.func(func, param);
    }
  } else {
    res = EditorClass.func(func);
  }
  callback && callback(res);

  switch (module) {
    case "left":
      if (func.includes("setValue") && param.uuid == state.uuid) {
        RightRef.value?.setOValue(param.key, param.value);
      }
      break;
    case "right":
      if (func.includes("setValue") && param) {
        if (param.key == "attribute_name") {
          LeftRef.value.updateName(param.value);
        } else if (param.key == "attribute_visible") {
          LeftRef.value.setVisible(param.value);
        }
      }
      break;
    case "tool":
      break;
    case "global":
      break;
  }
};

const AddObjectList = reactive({});

const hasRate = ref(false);
const loading = ref(false);
const loadText = ref("");
const loadProcess = ref(0);
const renderInfo = reactive({ frame: 0, triangles: 0, calls: 0 });

const editorCallbackFun = {
  /** 加载树 */
  loadInfo: (data, parent, index) => {
    if (parent == undefined) {
      data.forEach((item) => {
        LeftRef.value?.setValue([], item.uuid, item.sign, index);
      });
    } else {
      LeftRef.value?.setValue(data, parent, -1, index);
    }
  },
  /** 获取添加功能菜单 */
  getAddConfig: (data) => {
    Object.keys(data).forEach((key) => {
      AddObjectList[key] = data[key];
    });
  },
  /** 选中 */
  selectObj: async (obj, uuid) => {
    RightRef.value?.setValue(obj, state.uuid != uuid);
    commit("setUuid", uuid);
  },
  /** 删除 */
  deleteInfo: (uuid) => {
    LeftRef.value?.remove(uuid);
  },
  dataCallback,
  schedule: (show, content, schedule, updateSchedule, noSchedule = false) => {
    hasRate.value = true;
    if (show) {
      if (noSchedule) {
        loadProcess.value = -1;
      } else {
        loadProcess.value = 0;
      }
      if (updateSchedule) {
        loadProcess.value = schedule;
      } else {
        loading.value = true;
        loadText.value = content;
        loadProcess.value = schedule || 0;
      }
    } else {
      loading.value = false;
    }
  },
  updateView: ({ target, param }) => {
    console.self(target, param);
    switch (target) {
      case "transformControls":
        commit("setViewControl", param);
        break;
      case "toolToggle":
        bus.emit("mcp-tool-toggle", param);
        break;
    }
  },
  updateRenderInfo: ({ frame, triangles, calls }) => {
    renderInfo.frame = frame;
    renderInfo.triangles = triangles;
    renderInfo.calls = calls;
  },
};

const projectInfo = async () => {
  // 离线模式：使用本地默认配置
  if (state.baseInfo) {
    EditorClass = new Editor(editorId.value, ThreeRef.value, state.baseInfo);
    EditorClass.editor._store = store;
    EditorClass.initFun(editorCallbackFun);
    // EditorClass 就绪后再挂载 IndexComponent，保证 ToolBar 能正常拉取工具列表
    editorReady.value = true;
  }
};

const widthL = ref(16.25);
const widthR = ref(23.5);
const heightM = ref(17.5);
let mousedown = "";
// 是否允许拖拽调整左右栏宽度（false = 禁用该功能）
const enablePanelResize = false;
const mousedownLeft = () => enablePanelResize && (mousedown = "left");
const mousedownRight = () => enablePanelResize && (mousedown = "right");
const mouseDownMaterial = () => (mousedown = "material");
const mousemove = (e) => {
  if (mousedown != "") {
    const sizeStr = document.documentElement.style.fontSize;
    const size = Number(sizeStr.substring(0, sizeStr.length - 2));
    let w = e.x,
      h = e.y;
    if (mousedown == "right") {
      w = document.body.clientWidth - e.x;
      if (w <= 23.5 * size || w >= 600) return;
    } else if (mousedown == "left") {
      if (w <= 16.25 * size || w >= 500) return;
    } else {
      h = document.body.clientHeight - e.y;
      if (h <= 17.5 * size || h >= 520) return;
    }
    w = w / size;
    switch (mousedown) {
      case "left":
        widthL.value = w;
        break;
      case "right":
        widthR.value = w;
        break;
      case "material":
        heightM.value = h / size;
        break;
    }
  }
};
const mouseup = () => {
  EditorClass?.func(["_FUNCS", "containerResize"]);
  mousedown = "";
};

const registerBus = (bo) => {
  if (bo) {
    bus.on("update-visible", updateVisible);
  } else {
    bus.off("update-visible");
  }
};

/** 更新节点 visible 属性（左侧树和右侧面板） */
const updateVisible = ({ uuid, visible }) => {
  LeftRef.value?.setVisible(visible, uuid);
  if (uuid == state.uuid) {
    RightRef.value?.setOValue("attribute_visible", visible);
  }
};

onMounted(async () => {
  registerBus(true);
  bus.on("save-map", (type) => EditorClass && EditorClass.save(type));
  await nextTick();
  projectInfo();
  document.body.addEventListener("mousemove", mousemove);
  document.body.addEventListener("mouseup", mouseup);
});

onBeforeUnmount(async () => {
  registerBus(false);
  bus.off("save-map");
  disconnectMcp();
  document.body.removeEventListener("mousemove", mousemove);
  document.body.removeEventListener("mouseup", mouseup);
});
</script>

<style lang="less" scoped>
@import url("@/style/editor.less");

.header-actions {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mcp-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: #909399;

  &.connected {
    background: #67c23a;
  }
  &.error {
    background: #f56c6c;
  }
  &.connecting {
    background: #e6a23c;
  }
}
</style>