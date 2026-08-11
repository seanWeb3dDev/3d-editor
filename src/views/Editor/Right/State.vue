<!-- 状态 -->
<template>
  <div class="custom state-content-page" v-show="props.show">
    <div class="event-btn-box">
      <el-button type="primary" class="icon-btu" @click="openDialog(undefined)"
        ><i class="icon-img add"></i>添加</el-button
      >
    </div>

    <div class="content">
      <el-scrollbar>
        <div class="content-item-state" v-for="(item, index) in state.stateList">
          <div class="state-list">
            <div class="label">标识</div>
            <div class="value">{{ item.key }}</div>
          </div>
          <div class="state-list">
            <div class="label">类型</div>
            <div class="value">{{ getStatusTypeInfo(item.type).name }}</div>
          </div>
          <div class="state-list">
            <div class="label">默认值</div>
            <div class="value">{{ item.value }}</div>
          </div>

          <div class="op-group">
            <el-button class="icon-btu" link @click.stop="openDialog(item.key, index)">
              <i class="icon-img edit"></i>修改
            </el-button>
            <el-button class="icon-btu" link @click.stop="deleteKey(item.key, index)">
              <i class="icon-img delete"></i>删除
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>

  <el-dialog v-model="visible" title="添加状态" width="32rem" :close-on-click-modal="false">
    <el-form :model="ruleForm" status-icon label-width="4rem">
      <el-form-item label="标识" prop="key">
        <el-input v-model="ruleForm.key" :disabled="operateType == 1" />
      </el-form-item>
      <el-form-item label="类型">
        <el-radio-group
          v-model="ruleForm.type"
          @change="
            (v) => {
              ruleForm.value = v == 'boolean' ? false : '';
            }
          "
        >
          <el-radio :value="item.value" v-for="(item, index) in stateTypeList" :key="index">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="默认值" prop="value">
        <el-radio-group v-if="ruleForm.type == 'boolean'" v-model="ruleForm.value">
          <el-radio :value="false">false</el-radio>
          <el-radio :value="true">true</el-radio>
        </el-radio-group>
        <el-input v-else v-model="ruleForm.value" />
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
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";

const { state, commit } = useStore();

const props = defineProps({
  show: { type: Boolean, default: false },
  dialogVisible: { type: Boolean, default: false },
  pointData: { type: Array, default: [] },
});

const emit = defineEmits(["callback"]);

const stateTypeList = ref([
  {
    label: "布尔值",
    value: "boolean",
  },
  {
    label: "数字",
    value: "number",
  },
  {
    label: "字符串",
    value: "string",
  },
]);

const visible = ref(false);
const ruleForm = reactive({ key: "", type: "", value: "" });
const operateType = ref(0);
let editIndex = -1;

const openDialog = (key, index) => {
  if (key) {
    editIndex = index;
    operateType.value = 1;
    const item = state.stateList.find((m) => m.key == key);
    if (item) {
      ruleForm.key = item.key;
      ruleForm.type = item.type;
      ruleForm.value = item.value;
    }
  } else {
    editIndex = -1;
    operateType.value = 0;
    ruleForm.key = "";
    ruleForm.type = "boolean";
    ruleForm.value = false;
  }
  visible.value = true;
};

const submitForm = () => {
  if (ruleForm.key === "") {
    ElMessage.info("请输入标识");
    return;
  }
  if (ruleForm.type == "number" && isNaN(ruleForm.value)) {
    ElMessage.info("请输入正确的数据");
    return;
  }
  if (state.stateList.some((m, i) => m.key == ruleForm.key && i != editIndex)) {
    ElMessage.info("已存在相同标识的状态");
    return;
  }
  emit("callback", { func: ["_FUNCS", "setState"], param: { ...ruleForm } });
  if (operateType.value == 0) {
    commit("pushStateList", ruleForm);
  } else {
    commit("setStateListByKey", ruleForm);
  }
  visible.value = false;
};

const deleteKey = (key, index) => {
  ElMessageBox.confirm("确定要删除该数据？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    draggable: true,
  })
    .then(() => {
      emit("callback", { func: ["_FUNCS", "deleteState"], param: key });
      index >= 0 && commit("deleteStateListByIndex", index);
    })
    .catch(() => {});
};

//获取状态类型
const getStatusTypeInfo = (code) => {
  let result = {
    name: "",
  };
  let find = stateTypeList.value.find((v) => v.value == code);
  if (find) {
    result.name = find.label;
  }
  return result;
};
</script>

<style lang="less" scoped>
@import url("@/style/editor-custom.less");
</style>
