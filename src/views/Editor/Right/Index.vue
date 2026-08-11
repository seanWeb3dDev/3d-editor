<!-- 右侧操作 -->
<template>
  <el-tabs v-model="nowType" type="card" class="custom-tabs attr-tabs">
    <el-tab-pane class="attr-tab-panel" label="属性" :name="0" v-if="showTab.attribute">
      <div
        :style="{ maxHeight: `${showTab.material || showTab.animations ? '300px' : '100%'}` }"
        style="overflow: auto"
      >
        <form-vue ref="AttributeRef" @callback="formCallback" />
      </div>
      <template v-if="showTab.material || showTab.animations">
        <div class="title">
          <span class="material-icon"></span>
          <i
            class="property"
            v-if="showTab.material"
            :class="{ now: childType == 0 }"
            @click.stop="childType = 0"
          >
            材质
          </i>
          <i
            class="property"
            v-if="showTab.animations"
            :class="{ now: childType == 1 }"
            @click.stop="childType = 1"
          >
            动画
          </i>
        </div>
        <div style="flex: 1; overflow: auto">
          <el-Scrollbar>
            <form-vue v-show="childType == 0" ref="MaterialRef" @callback="formCallback" />
            <form-vue
              ref="AnimationsRef"
              v-show="childType == 1"
              @callback="formCallback"
              @animationsCallback="animationsCallback"
            />
          </el-Scrollbar>
        </div>
      </template>
    </el-tab-pane>
    <el-tab-pane label="状态" :name="2" v-if="showTab.state">
      <state-vue :show="state.uuid != ''" @callback="callback" />
    </el-tab-pane>
    <el-tab-pane label="材质" :name="3" v-if="!showTab.attribute && showTab.material">
      <form-vue ref="MaterialARef" :show="state.uuid != ''" @callback="formCallback" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup name="">
import { useStore } from "vuex";
import FormVue from "./Form.vue";
import StateVue from "./State.vue";
import { ElScrollbar } from "element-plus";
import { debounceImmediateAsync } from "@/utils/common";

const { state, commit } = useStore();

const emit = defineEmits(["callback"]);

const nowType = ref(0);
const childType = ref(0);

const animationsList = reactive([]);
provide("animationsList", animationsList);

/** 配置返回 */
const formCallback = (obj) => {
  callback({ func: ["_FUNCS", "setValue"], param: { key: obj.key, value: obj.value } });
};

/** 动画配置返回 */
const animationsCallback = (_uuid) => {
  callback({ func: ["_FUNCS", "animationPlay"], param: _uuid });
};

const callback = (obj) => {
  emit("callback", obj);
};

const AttributeRef = ref();
const MaterialRef = ref();
const AnimationsRef = ref();
const MaterialARef = ref();

const showTab = reactive({
  attribute: false,
  state: false,
  material: false,
  animations: false,
});

const loadPage = debounceImmediateAsync(
  async (attribute, material, animations, _state, change) => {
    showTab.attribute = attribute != undefined;
    showTab.state = _state != undefined;
    showTab.material = material != undefined;
    showTab.animations = animations != undefined;

    if (change) {
      nowType.value = showTab.attribute ? 0 : showTab.state ? 2 : showTab.material ? 3 : -1;
      childType.value = nowType.value != 0 ? -1 : showTab.material ? 0 : showTab.animations ? 1 : 0;
    }
    commit("clearStateList");
    showTab.state && _state.forEach((item) => commit("pushStateList", item));
    await nextTick();

    AttributeRef.value?.setValue([...(attribute || [])], change);
    AnimationsRef.value?.setValue([...(animations || [])], change);
    animationsList.length = 0;
    if (animations !== undefined) {
      animationsList.push(...animations);
    }

    if (showTab.attribute) {
      MaterialRef.value?.setValue([...(material || [])], change);
    } else {
      MaterialARef.value?.setValue([...(material || [])], change);
    }
  },
  1
);

const setValue = async (
  { attribute, material, animations, state: _state },
  change,
  _uuid
) => {
  loadPage(attribute, material, animations, _state, change);
};

const setOValue = (key, value) => {
  AttributeRef.value?.setOValue(key, value);
};

defineExpose({ setValue, setOValue });
</script>

<style lang="less" scoped>
@title-height: 30px;

div {
  color: white;
}

.content {
  & > div {
    height: 100%;
  }
}

.property {
  margin-right: 5px;
  cursor: pointer;
  font-family: AlibabaPuHuiTiM;
  font-size: 16px;
  color: #ffffff;
  font-style: normal;
  .now {
    background-color: blue;
  }
}

.attr-tab-panel {
  .title {
    margin-top: 23px;
    display: flex;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    margin-left: 16px;
    margin-right: 16px;
    padding: 12px 0 16px;
  }
  .material-icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    background-image: url("^/editor/material-icon.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    margin-right: 12px;
  }
}
</style>