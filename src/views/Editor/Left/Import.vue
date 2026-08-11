<!-- 导入模型 -->
<template>
  <el-dialog v-model="visible" title="导入模型" width="800px" :close-on-click-modal="false">
    <el-form :model="ruleForm" status-icon>
      <el-form-item label="">
        <div class="input-button">
          <el-upload
            class="button-upload"
            action="#"
            multiple
            :auto-upload="false"
            :show-file-list="false"
            :on-change="beforeUploadGlb"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip> 支持批量上传，上传格式为glb文件</template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item v-if="tableData.length > 0" label="" style="height: 300px">
        <table-vue
          :tableObj="tableObj"
          :tableData="tableData"
          :add="false"
          :pagination="false"
          :edit="false"
          @delet="delet"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button plain @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="">
import { ElMessage } from "element-plus";
import TableVue from "@/components/Table/Index.vue";

const props = defineProps({
  visibleP: { type: Boolean, default: false },
  pointData: { type: Array, default: [] },
});

const emit = defineEmits(["update:visibleP", "callback"]);

const visible = computed({
  get: () => props.visibleP,
  set: (val) => emit("update:visibleP", val),
});

const ruleForm = reactive({ fileName: "" });

const tableObj = [
  { prop: "name", label: "文件名", width: 160 },
  { prop: "size", label: "大小（KB）", width: 160 },
];
const tableData = reactive([]);

const beforeUploadGlb = (rawFile) => {
  const arr = rawFile.name.split(".");
  if (arr[arr.length - 1] != "glb") {
    ElMessage.info("仅支持glb文件!");
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 200) {
    ElMessage.info("文件最大支持200MB!");
    return false;
  }
  if (tableData.some((m) => m.name == rawFile.name)) {
    ElMessage.info("同名文件已存在!");
    return false;
  }
  tableData.push({
    uid: String(rawFile.uid),
    name: rawFile.name,
    size: parseInt(rawFile.size / 1024),
    file: rawFile.raw,
  });
};

const delet = ({ uid }) => {
  const index = tableData.findIndex((m) => m.uid == uid);
  if (index >= 0) {
    tableData.splice(index, 1);
  }
};

const submitForm = () => {
  visible.value = false;
  if (tableData.length > 0) {
    emit("callback", { func: ["_FUNCS", "addModel"], param: [...tableData.map((m) => m.file)] });
  }
};

onMounted(() => {});

watch(
  () => visible.value,
  (val) => {
    if (val) {
    }
  }
);
</script>

<style lang="less" scoped></style>
