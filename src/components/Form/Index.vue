<!-- 表单集合 -->
<template>
  <!-- 单个输入框 -->
  <el-input
    class="custom-input"
    v-if="['input', 'number', 'radian'].includes(_data.inputType)"
    v-model="_data.value"
    @change="(val) => onChange({ key: _data.key, val, inputType: _data.inputType })"
    :disabled="_data.writable === false"
  />
  <!-- 下拉框 -->
  <el-select
    class="custom-select"
    v-else-if="_data.inputType == 'select'"
    v-model="_data.value"
    @change="(val) => onChange({ key: _data.key, val })"
    :disabled="_data.writable === false"
  >
    <el-option v-for="item in _data.options" :value="item.value" :label="item.label" />
  </el-select>
  <!-- 滑块 -->
  <el-slider
    v-else-if="_data.inputType == 'slider'"
    v-model="_data.value"
    :min="_data.range[0]"
    :max="_data.range[1]"
    :step="0.0001"
    @input="(val) => onChange({ key: _data.key, val })"
  />
  <!-- 开关 -->
  <el-switch
    v-else-if="_data.inputType == 'switch'"
    v-model="_data.value"
    @input="(val) => onChange({ key: _data.key, val })"
  />
  <!-- 单选框 -->
  <el-radio-group
    v-else-if="_data.inputType == 'radio'"
    v-model="_data.value"
    @change="(val) => onChange({ key: _data.key, val })"
  >
    <el-radio v-for="item in _data.list" :value="item.value">{{ item.label }}</el-radio>
  </el-radio-group>
  <!-- 组合框 -->
  <div
    class="color-multiple-list"
    v-else-if="_data.inputType == 'relate'"
    v-for="it in _data.children"
  >
    <span>{{ it.label }}</span>
    <div class="value-content" :style="it.inputType == 'slider_input' ? 'overflow: hidden;' : ''">
      <index-vue :data="it" @on-change="onChildChange" />
    </div>
  </div>
  <template v-else-if="typeToComponent[_data.inputType]">
    <component :is="getComponent(_data.inputType)" :data="_data" @on-change="onChange" />
  </template>
  <div v-else>{{ _data.inputType }}当前组件不存在</div>
</template>

<script setup name="">
import IndexVue from "./Index.vue";
import ImageVue from "./Image.vue";
import { ElMessage } from "element-plus";
import { angleToRadian } from "@/utils/common";

const props = defineProps({
  data: { type: Object, default: {} },
  val: { type: String, default: "" },
});

const emit = defineEmits(["onChange", "update:val"]);

const _data = computed({ get: () => props.data, set: () => {} });

const onChange = (obj) => {
  if (obj.inputType == "number") {
    // 校验数字
    const reg = /^-?[0-9]+.?[0-9]*$/; // 判断是否为数字
    if (!reg.test(obj.val)) {
      ElMessage.info("请输入数字");
      return;
    }
  }
  if (["vec3_radian", "vec2_radian", "radian"].includes(obj.inputType)) {
    switch (obj.inputType) {
      case "vec3_radian":
      case "vec2_radian":
        obj.val = obj.val.map((item) => angleToRadian(item));
        break;
      case "radian":
        obj.val = angleToRadian(obj.val);
        break;
    }
  }
  emit("onChange", obj);
  emit("update:val", obj.val);
};

const onChildChange = (obj) => {
  emit("onChange", obj);
};

const components = reactive([]);

const typeToComponent = {
  vec2: "Coordinate",
  vec3: "Coordinate",
  vec4: "Coordinate",
  vec2_radian: "Coordinate",
  vec3_radian: "Coordinate",
  select_input: "SelectInput",
  slider_input: "SliderInput",
  color: "Color",
  file: "File",
  imageBitmap: "Image",
  fontGroup: "FontStyle",
  richInput: "RichInput",
  inputAdd: "InputAdd",
  particle: "Drawer",
  chartlet: "Drawer",
};

const getComponent = (type) => {
  const res = components.find((m) => m.name == typeToComponent[type]);
  return res.value;
};

onBeforeMount(() => {
  const requireComponents = import.meta.glob("./*.vue");
  Object.keys(requireComponents).forEach((key) => {
    const componentName = key.replace(/(\.\/|\.vue)/g, "");
    components.push({
      name: componentName,
      value: markRaw(defineAsyncComponent(requireComponents[key])),
    });
  });
});
</script>

<style lang="less" scoped>
.color-multiple-box {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px 16px;

  .color-multiple-list {
    display: flex;
    align-items: center;

    & + .color-multiple-list {
      margin-top: 12px;
    }

    span {
      width: 50px;
      margin-right: 12px;
      font-family: AlibabaPuHuiTiR;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }

    .value-content {
      flex: 1;
      overflow: auto;
    }

    :deep(.coordinate-box .input-number-box) {
      width: 68px;
    }
  }
}
</style>
