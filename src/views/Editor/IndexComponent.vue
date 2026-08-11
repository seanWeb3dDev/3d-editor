<!-- 编辑器插件 -->
<template>
  <!-- 素材 -->
  <div
    class="material"
    :class="{ show: state.selectedTopNav.includes('material') }"
    :style="{ height: `${props.heightMaterial}rem` }"
  >
    <div class="size-div" @mousedown="emit('mouseDown')"></div>
    <material-vue
      @close="removeNav('material')"
      @callback="(obj) => emit('callback', obj, 'material')"
    />
  </div>

  <!--头部工具栏-->
  <tool-bar @callback="(obj) => emit('callback', obj, 'tool')" />
</template>

<script setup name="">
import { useStore } from "vuex";
import MaterialVue from "./Material.vue";
import ToolBar from "./ToolBar.vue";

const { state, commit } = useStore();

const props = defineProps({
  heightMaterial: { type: Number, default: 0 },
});

const emit = defineEmits(["callback", "mouseDown"]);

const removeNav = (key) => commit("removeNav", key);

const setValue = (obj, key) => {
  // 离线版：配置通过 Index.vue 的 el-dialog 处理
};

const getPointConfig = () => ({});

defineExpose({ setValue, getPointConfig });
</script>

<style lang="less" scoped>
.material {
  position: fixed;
  left: 0;
  width: 100%;
  height: 280px;
  background-color: #1a1a1a;
  box-shadow: inset 0px 2px 6px 0px rgba(0, 0, 0, 0.8);
  z-index: 99;
  padding-top: 2px;
  transform: translate(0%, 0%);

  &.show {
    transform: translate(0%, -100%);
  }

  .size-div {
    width: 100%;
    height: 2px;
    background-color: transparent;
    position: absolute;
    top: 0;
    left: 0;
    cursor: ns-resize;
  }
}
</style>