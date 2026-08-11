<template>
  <div class="slider-box">
    <div class="slider-body">
      <el-slider
        :min="props.data.range[0]"
        :max="props.data.range[1]"
        :step="0.0001"
        :disabled="props.data.disabled"
        v-model="_data.value"
        @change="(val) => onChange(val)"
      />
    </div>

    <div class="input-body">
      <el-input-number
        class="custom-input-number"
        :disabled="_data.disabled"
        v-model="_data.value"
        :controls="false"
        @change="(val) => onChange(val)"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const _data = computed({
  get: () => props.data,
  set: () => {},
});

const onChange = (val) => {
  const num = Number(val);
  if (num < props.data.range[0]) {
    emit("onChange", { key: props.data.key, val: props.data.range[0] });
  } else if (num > props.data.range[1]) {
    emit("onChange", { key: props.data.key, val: props.data.range[1] });
  } else {
    emit("onChange", { key: props.data.key, val });
  }
};
</script>

<style lang="less" scoped>
.slider-box {
  display: flex;
  align-items: center;

  .slider-body {
    flex: 1;
    margin-right: 8px;
  }

  .input-body {
    width: 77px;

    .el-input-number {
      width: 100%;
    }
  }
}
</style>
