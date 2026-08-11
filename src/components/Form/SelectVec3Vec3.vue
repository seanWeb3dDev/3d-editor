<template>
  <div class="select-input-box">
    <div class="select-box">
      <el-select v-model="selectValue_" class="custom-select" filterable clearable>
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="content-box">
      <el-input class="custom-input" v-model="inputValue_" />
      <el-input class="custom-input" v-model="inputValue_" />
      <el-input class="custom-input" v-model="inputValue_" />
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(["update:value", "changeValue"]);
const props = defineProps({
  value: {
    //值
    type: Object,
    default() {
      return {
        type: null, //select 值
        value: 0, //输入框值
      };
    },
  },
  selectOptions: {
    //下拉项
    type: Array,
    default() {
      return [];
    },
  },
});

const value_ = computed({
  get: () => {
    return props.value;
  },
  set: (value) => {
    emit("update:value", value);
    emit("changeValue", value);
  },
});
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
