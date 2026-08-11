<!-- 表单列表 -->
<template>
  <div
    class="field"
    v-for="field in dataList"
    :class="{ relateStyle: field.inputType == 'relate' }"
  >
    <span>{{ field.label }}</span>
    <div :class="{ 'color-multiple-box': field.inputType == 'relate' }">
      <form-vue :data="field" v-bind="$attrs" @on-change="(obj) => onChange(obj, field)" />
    </div>
  </div>
</template>

<script setup name="">
import FormVue from "./Index.vue";

const props = defineProps({ dataList: { type: Array, default: () => [] } });

const emits = defineEmits(["callback"]);

const onChange = (obj, field) => {
  emits("callback", { obj, field });
};
</script>

<style lang="less" scoped></style>
