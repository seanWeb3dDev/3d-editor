<template>
  <div class="font-style">
    <div class="font-family-box">
      <el-select
        class="custom-select"
        v-model="font.value"
        clearable
        @change="(val) => emit('onChange', { key: font.key, val })"
        :disabled="font.disabled"
      >
        <el-option
          v-for="item in font.list"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="font-row2">
      <div class="select-box">
        <el-input
          class="custom-input"
          v-model="size.value"
          @change="(val) => checkVal({ key: size.key, val })"
          :disabled="size.disabled"
        />
        <div class="tip">字号</div>
      </div>
      <div class="select-box">
        <el-input
          class="custom-input"
          v-model="letter.value"
          @change="(val) => checkVal({ key: letter.key, val })"
          :disabled="letter.disabled"
        />
        <div class="tip">字距</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";

const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const font = reactive({ value: "", list: [], key: "", disabled: false });
const size = reactive({ value: "", key: "", disabled: false });
const letter = reactive({ value: "", key: "", disabled: false });

watch(
  () => props.data,
  (val) => {
    const fontObj = val.children.find((m) => {
      const arr = m.key.split("_");
      return arr[arr.length - 1] == "font";
    });
    if (fontObj) {
      font.value = fontObj.value;
      font.list = fontObj.options;
      font.key = fontObj.key;
      font.disabled = fontObj.disabled;
    }
    const sizeObj = val.children.find((m) => {
      const arr = m.key.split("_");
      return arr[arr.length - 1] == "fontSize";
    });
    if (sizeObj) {
      size.value = sizeObj.value;
      size.key = sizeObj.key;
      size.disabled = sizeObj.disabled;
    }
    const letterObj = val.children.find((m) => {
      const arr = m.key.split("_");
      return arr[arr.length - 1] == "letterSpacing";
    });
    if (letterObj) {
      letter.value = letterObj.value;
      letter.key = letterObj.key;
      letter.disabled = letterObj.disabled;
    }
  },
  { immediate: true }
);

const checkVal = (obj) => {
  // 校验数字
  const reg = /^[0-9]+.?[0-9]*$/; // 判断是否为数字
  if (!reg.test(obj.val)) {
    ElMessage.info("请输入数字");
    return;
  }
  emit("onChange", obj);
};
</script>
<style lang="less" scoped>
.font-style {
  flex: 1;
  overflow: hidden;
  .font-family-box {
    margin-bottom: 12px;
  }
  .font-row2 {
    display: flex;
    justify-content: space-between;
    .select-box {
      width: 116px;
      .tip {
        margin-top: 8px;
        text-align: center;

        font-family: AlibabaPuHuiTiR;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}
</style>
