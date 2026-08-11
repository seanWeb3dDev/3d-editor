<template>
  <div class="coordinate-box">
    <div class="input-number-box" v-for="item in _data.len">
      <el-input-number
        class="custom-input-number"
        v-model="_data.value[item - 1]"
        :controls="false"
        :disabled="props.data.disabled"
        @change="(val) => changeInput(val, item - 1)"
      ></el-input-number>
    </div>
  </div>
</template>

<script setup name="">
const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const _data = computed({
  get: () => {
    const field = props.data;
    switch (field.inputType) {
      case "vec2":
      case "vec2_radian":
        field.len = 2;
        break;
      case "vec3_radian":
      case "vec3":
        field.len = 3;
        break;
      case "vec4":
        field.len = 4;
        break;
    }
    return field;
  },
  set: () => {},
});

const changeInput = (val, index) => {
  _data.value.value[index] = val;
  emit("onChange", {
    key: props.data.key,
    inputType: props.data.inputType,
    val: _data.value.value,
  });
};
</script>

<style lang="less" scoped>
.coordinate-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .input-number-box {
    position: relative;
    width: 73px;

    & + .input-number-box:nth-child(2n),
    & + .input-number-box:nth-child(3n) {
      margin-left: 15px;
    }
    .unit {
      position: absolute;
      padding-right: 5px;
      right: 0;
      top: 50%;
      transform: translate(0, -50%);
      font-family: AlibabaPuHuiTiR;
      font-size: 10px;
      color: rgb(255, 255, 255, 0.8);
    }
  }
  .el-input-number {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
