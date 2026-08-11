<!-- 编辑工具配置表单 -->
<template>
  <el-scrollbar height="100%">
    <div
      class="field"
      v-for="field in dataList"
      :class="{ relateStyle: field.inputType == 'relate' }"
    >
      <template v-if="getStrLen(field.label) <= 8">
        <span>{{ field.label }}</span>
      </template>
      <el-tooltip v-else effect="dark" :content="field.label" placement="top">
        <span class="overflow-label">{{ field.label }}</span>
      </el-tooltip>
      <!-- 动画播放 -->
      <div v-if="field.inputType == 'animations'">
        <el-button
          @click="
            () => {
              emit('animationsCallback', field.uuid);
              field.play = !field.play;
            }
          "
        >
          {{ field.play ? "暂停" : "播放" }}
        </el-button>
      </div>
      <div v-else :class="{ 'color-multiple-box': field.inputType == 'relate' }">
        <form-vue :data="field" v-bind="$attrs" @on-change="(obj) => onChange(obj, field)" />
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup name="">
import { ElMessage } from "element-plus";
import FormVue from "@/components/Form/Index.vue";
import { getStrLen } from "@/utils/common";

const emit = defineEmits(["callback", "animationsCallback"]);

const dataList = reactive([]);

/** 修改 */
const onChange = ({ key, val }, field) => {
  let check = true;
  let param = val;
  if (field.type == "number") {
    param = Number(val);
  } else if (field.type == "boolean") {
    param = Boolean(val);
  }
  if (check) {
    emit("callback", { key: key, value: param });
  } else {
    ElMessage.info("数据不符合要求");
  }
};

const setValue = async (arr, change) => {
  if (change) {
    dataList.length = 0;
    await nextTick();
    setTimeout(() => {
      arr.forEach((item) => {
        dataList.push(item);
      });
    }, 50);
  } else {
    dataList.splice(0, Infinity, ...arr);
  }
};

const setOValue = (key, value) => {
  const item = dataList.find((m) => m.key == key);
  if (item) {
    item.value = value;
  }
};

defineExpose({ setValue, setOValue });
</script>

<style lang="less" scoped>
.color-multiple-box {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px 16px;
}
</style>

<style lang="less">
@import url("@/style/editor-form.less");
</style>
