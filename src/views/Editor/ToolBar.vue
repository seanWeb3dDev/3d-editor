<template>
  <div class="toolBar">
    <div class="ul">
      <el-dropdown class="li-dropdown" trigger="click" popper-class="tool-bar-popover">
        <el-button class="li only-icon big" @click.stop="() => {}">
          <el-tooltip effect="dark" content="工具栏" placement="top">
            <i class="icon-img app"></i>
          </el-tooltip>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in tool">
              <span class="label">{{ item.label }}</span>
              <el-switch v-model="item.value" @change="toolFun(item)"></el-switch>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button
        class="li only-icon big"
        :class="{ active: state.viewControl == 'rotate' }"
        @click.stop="patternChange('rotate')"
      >
        <el-tooltip effect="dark" content="旋转（快捷键：Alt+R）" placement="top">
          <i class="icon-img rotate"></i>
        </el-tooltip>
      </el-button>
      <el-button
        class="li only-icon big"
        :class="{ active: state.viewControl == 'scale' }"
        @click.stop="patternChange('scale')"
      >
        <el-tooltip effect="dark" content="缩放（快捷键：Alt+S）" placement="top">
          <i class="icon-img scale"></i>
        </el-tooltip>
      </el-button>
      <el-button
        class="li only-icon big"
        :class="{ active: state.viewControl == 'translate' }"
        @click.stop="patternChange('translate')"
      >
        <el-tooltip effect="dark" content="位移（快捷键：Alt+T）" placement="top">
          <i class="icon-img move"></i>
        </el-tooltip>
      </el-button>
    </div>
  </div>
</template>

<script setup name="ToolBar">
import { useStore } from "vuex";
import bus from "@/utils/bus";

const { state, commit } = useStore();

const emit = defineEmits(["callback"]);

const tool = reactive([]);

const toolFun = ({ fn, value }) => {
  emit("callback", { func: ["_FUNCS", fn], param: value });
};

const patternChange = (type) => {
  if (type != state.viewControl) {
    commit("setViewControl", type);
    emit("callback", { func: ["_FUNCS", "setTransformControls"], param: state.viewControl });
  }
};

onMounted(() => {
  emit("callback", {
    func: ["_FUNCS", "getEditorSetting"],
    callback: (e) => {
      tool.length = 0;
      e.tool.forEach((item) => tool.push({ ...item }));
    },
  });

  bus.on("mcp-tool-toggle", ({ fn, value }) => {
    const item = tool.find(t => t.fn === fn);
    if (item) item.value = value;
  });
});

onBeforeUnmount(() => {
  bus.off("mcp-tool-toggle");
});
</script>

<style lang="less" scoped>
.toolBar {
  height: auto !important;
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translate(-50%, 0);
  background: #282828;
  box-shadow:
    2px 0px 6px 0px rgba(0, 0, 0, 0.6),
    inset 0px 0px 4px 0px rgba(0, 0, 0, 0.8);
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.23);
  padding: 4px 20px;
  .ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    align-items: center;
    @spaceDistance: 12px;
    .li-dropdown {
      & + .li-dropdown,
      & + .li {
        margin-left: @spaceDistance;
      }
    }
    .li {
      //工具栏按钮

      &.el-button {
        & + .el-button {
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
