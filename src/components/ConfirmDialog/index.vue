<template>
    <el-dialog modal-class="tip-dialog" @closed="closed" v-model="props.visible">
      <template #header>
        <div class="title-body">
          <div class="title-c"></div>
          {{ props.title }}
        </div>
      </template>
      <div class="body-c">{{ props.content }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="primary-button" @click="cancel">取消</el-button>
          <el-button class="primary-button" type="primary" @click="submit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  <script setup>
  
  const emit = defineEmits(["update:visible","cancel","submit"]);
  
  const props = defineProps({
    visible: {
      //弹框展示
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "提示",
    },
    content: {
      type: String,
      default: "",
    },
  });
  
  const cancel = () => {
    emit("update:visible", false);
  };
  
  const submit = () => {
    emit("submit")
   
  };
  const closed=()=>{
    emit("update:visible", false);
  }
  </script>
  <style lang="less" scoped></style>
  