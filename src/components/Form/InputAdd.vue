<!-- 选择点表配置 -->
<template>
  <div style="display: flex; width: 100%">
    <el-input v-model="value" style="margin-right: 1rem" @change="change" />
    <el-button type="primary" @click="operDialog" style="padding: 0 0.3rem">
      <i class="icon-img add" style="margin-right: 0"></i>
    </el-button>
  </div>
  <el-dialog title="选择状态" v-model="visibel" width="40rem" append-to-body>
    <div class="search-div">
      <el-input class="custom-input" v-model="searchTxt">
        <template #append>
          <el-button :icon="Search" @click="searchData" />
        </template>
      </el-input>
    </div>
    <div style="height: 40rem; width: 38rem">
      <table-vue
        :tableObj="tableObj"
        :tableData="tableData"
        :operate="false"
        :pagination="false"
        :row-class-name="rowStyleFun"
        @row-click="rowClick"
        @row-dblclick="rowDblclick"
      >
        <template #type="{ row }">{{ typeList[row.type] }}</template>
      </table-vue>
    </div>
    <template #footer>
      <el-button plain @click="visibel = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="">
import { useStore } from "vuex";
import TableVue from "../Table/Index.vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const { state } = useStore();

const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

let key = "";
const value = ref("");

watch(
  () => props.data,
  (val) => {
    key = val.key;
    value.value = val.value;
  },
  { deep: true, immediate: true }
);

const visibel = ref(false);
const typeList = ["", "布尔值", "数字", "字符串"];
const tableObj = [
  { prop: "key", label: "标识" },
  { prop: "name", label: "名称" },
  { slot: "type", label: "类型" },
];
const tableData = reactive([]);
const searchTxt = ref("");

const operDialog = () => {
  rowKey.value = "";
  visibel.value = true;
  searchData();
};

const searchData = () => {
  tableData.length = 0;
  state.configList.forEach((item) => {
    if (item.key.includes(searchTxt.value) || item.name.includes(searchTxt.value)) {
      tableData.push({ ...item });
    }
  });
};

const rowKey = ref("");
const rowClick = (row) => (rowKey.value = row.key);

const rowDblclick = (row) => {
  emit("onChange", { key, val: row.key });
  visibel.value = false;
};

const rowStyleFun = ({ row }) => {
  return row.key == rowKey.value ? "selected" : "";
};

const submit = () => {
  if (rowKey.value == "") {
    ElMessage.info("请选择状态");
    return;
  }
  emit("onChange", { key, val: rowKey.value });
  visibel.value = false;
};

const change = () => {
  emit("onChange", { key, val: value.value });
};

watch(
  () => visibel.value,
  () => (searchTxt.value = "")
);
</script>

<style lang="less" scoped>
.search-div {
  width: 220px;
  padding-left: 10px;

  :deep(.el-input) {
    .el-input__wrapper {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .el-input-group__append {
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-left: none;
      background-color: #2c2f33;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
</style>
