<!--描边-->
<template>
  <div class="stroke-box">
    <div class="item">
      <span class="label">描边宽度</span>
      <div class="value">
        <el-input-number class="custom-input-number" :controls="false" v-model="width_" />
      </div>
    </div>
    <div class="item">
      <span class="label">描边颜色</span>
      <div class="value">
        <ColorSelect v-model:color="color_" @active-change="changeActiveColor"></ColorSelect>
      </div>
    </div>

    <div class="item">
      <span class="label">描边模糊</span>
      <div class="value">
        <el-input-number class="custom-input-number" :controls="false" v-model="blur_" />
      </div>
    </div>
  </div>
</template>
<script setup>
import ColorSelect from "./Color.vue";
const emit = defineEmits([
  "update:width",
  "changeWidth",
  "update:color",
  "changeColor",
  "update:blur",
  "changeBlur",
  "changeActiveColor"
]);

const props = defineProps({
  width: {
    //描边宽度
    type: [Number],
    default() {
      return "";
    },
  },

  color: {
    //颜色
    type: String,
    default: "",
  },
  blur: {
    //模糊
    type: [String, Number],
    default: "",
  },
});

const width_ = computed({
  get: () => {
    return props.width;
  },
  set: (value) => {
    emit("update:width", value);
    emit("changeWidth", value);
  },
});

const color_ = computed({
  get: () => {
    return props.color;
  },
  set: (value) => {
    emit("update:color", value);
    emit("changeColor", value);
  },
});

const blur_ = computed({
  get: () => {
    return props.blur;
  },
  set: (value) => {
    emit("update:blur", value);
    emit("changeBlur", value);
  },
});

//更改颜色
const changeActiveColor = (value) => {
  emit("changeActiveColor", value);
};
</script>
<style lang="less" scoped>
.stroke-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px 16px 7px;
  width: 100%;
  overflow: hidden;
  .label {
    width: 56px;
    display: block;
    margin-right: 12px;
    font-family: AlibabaPuHuiTiR;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
  .el-input-number {
    width: 100%;
  }
  .item {
    display: flex;
    align-items: center;
    .value {
      flex: 1;
    //   overflow: hidden;
    }
    & + .item {
      margin-top: 12px;
    }
  }
}
</style>
