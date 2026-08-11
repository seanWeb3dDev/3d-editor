<!--颜色选择器-->
<template>
  <div class="color-box">
    <el-color-picker
      class="custom-color-picker"
      v-model="color"
      :disabled="props.data.disabled"
      @active-change="activeChange"
    />
    <div class="input">
      <el-input class="custom-input" v-model="color" readonly />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const color = ref("");

watch(
  () => props.data,
  (val) => {
    color.value = val.value;
  },
  { deep: true, immediate: true }
);

const activeChange = (val) => {
  color.value = val;
  emit("onChange", { key: props.data.key, val });
};
</script>

<style lang="less" scoped>
.color-box {
  display: flex;
  align-items: center;

  .input {
    width: 101px;
    overflow: hidden;
    margin-left: 12px;
  }
}
</style>
