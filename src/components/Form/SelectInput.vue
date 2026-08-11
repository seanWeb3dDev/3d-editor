<template>
  <div class="select-input-box">
    <div class="select-box">
      <el-select
        v-model="dataDefine.selectValue"
        class="custom-select"
        @change="changeSelect"
        filterable
        clearable
        :disabled="props.data.disabled"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="input-box">
      <el-input-number
        v-if="dataDefine.selectValue == 0"
        :disabled="props.data.disabled"
        class="custom-input-number"
        @change="(val) => changeInputNumber(val)"
        v-model="dataDefine.inputValue"
        :controls="false"
      ></el-input-number>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const options = [
  { label: "数值", value: 0 },
  { label: "无限大", value: Infinity },
];

const dataDefine = reactive({
  selectValue: 0,
  inputValue: 0,
});

watch(
  () => props.data,
  (val) => {
    if (val.value == Infinity) {
      dataDefine.selectValue = Infinity;
    } else {
      dataDefine.selectValue = 0;
      dataDefine.inputValue = val.value;
    }
  },
  { deep: true, immediate: true }
);

const changeSelect = (v) => {
  if (dataDefine.selectValue == Infinity) {
    dataDefine.inputValue = Infinity;
  } else {
    dataDefine.inputValue = 0;
  }
  emit("onChange", { key: props.data.key, val: dataDefine.inputValue });
};

const changeInputNumber = (val) => {
  emit("onChange", { key: props.data.key, val });
};
</script>
<style lang="less" scoped>
.select-input-box {
  display: flex;
  align-items: center;
  .select-box {
    width: 116px;
  }
  .input-box {
    flex: 1;
    margin-left: 16px;
    .el-input-number {
      width: 100%;
    }
  }
}
</style>
