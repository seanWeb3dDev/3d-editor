<!-- 报表组件 -->
<template>
  <div class="table-component">
    <div class="table-operate operate" v-if="props.operate && props.add">
      <el-button type="primary" class="icon-btu" @click="add" v-purview:add>
        <i class="icon-img add"></i>新增
      </el-button>
    </div>
    <div class="table-list">
      <el-table
        :data="props.tableData"
        v-bind="$attrs"
        v-loading="props.loading"
        empty-text="暂无数据"
        @row-dblclick="(row) => emit('rowDblclick', row)"
      >
        <!-- 序号列 -->
        <el-table-column label="序号" width="60" v-if="props.serial">
          <template #default="scoped">
            {{
              (params.pageIndex ? (params.pageIndex - 1) * params.pageSize : 0) + scoped.$index + 1
            }}
          </template>
        </el-table-column>
        <template v-for="item in props.tableObj">
          <template v-if="item.hide != true">
            <!-- 自定义插槽列 -->
            <el-table-column
              v-if="item.slot"
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              :fixed="item.fixed"
              :align="item.align ? item.align : 'left'"
              :show-overflow-tooltip="item.tooltip ? true : false"
            >
              <template #default="{ row, $index }">
                <slot v-if="item.slot" :name="item.slot" :row="row" :index="$index"></slot>
              </template>
            </el-table-column>
            <!-- 普通列 -->
            <el-table-column
              v-else
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              :fixed="item.fixed"
              show-overflow-tooltip
              :formatter="item.formatter"
            />
          </template>
        </template>
        <el-table-column v-if="props.operate" label="操作" :width="props.role ? 260 : 210">
          <template #default="{ row }">
            <div
              class="operate"
              v-if="row.username != 'admin' || (row.value !== undefined && row.value >= 0)"
            >
              <el-button
                type="primary"
                class="icon-btu"
                link
                @click="roleConfig(row)"
                v-if="props.role"
                v-purview:role
              >
                <i class="icon-img edit-b"></i>
                权限配置
              </el-button>
              <el-button
                type="primary"
                class="icon-btu"
                link
                @click="edit(row)"
                v-if="props.edit"
                v-purview:edit
              >
                <i class="icon-img edit-b"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                class="icon-btu"
                link
                @click="delet(row)"
                v-if="row.value == undefined || row.value >= 0"
                v-purview:delete
              >
                <i class="icon-img delete-b"></i>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="table-page" v-if="props.pagination">
      <el-pagination
        v-model:current-page="params.pageIndex"
        v-model:page-size="params.pageSize"
        :page-sizes="[10, 20, 30, 40]"
        layout="prev, pager, next, sizes, jumper"
        :total="props.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup name="TableComponents">
import { ElMessageBox } from "element-plus";

const props = defineProps({
  tableObj: { type: Array, default: [] },
  tableData: { type: Array, default: [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  serial: { type: Boolean, default: true },
  add: { type: Boolean, default: true },
  operate: { type: Boolean, default: true },
  role: { type: Boolean, default: false },
  edit: { type: Boolean, default: true },
  pagination: { type: Boolean, default: true },
});
const emit = defineEmits(["getTableData", "add", "roleConfig", "edit", "delet", "rowDblclick"]);

const params = reactive({ pageIndex: 1, pageSize: 10 });

/**
 * 重置
 */
const reset = () => {
  params.pageIndex = 1;
  params.pageSize = 10;
  emit("getTableData", params);
};

/**
 * 行数更换
 * @param {number} val
 */
const handleSizeChange = (val) => {
  params.pageSize = val;
  emit("getTableData", params);
};

/**
 * 翻页
 * @param {number} val
 */
const handleCurrentChange = (val) => {
  params.pageIndex = val;
  emit("getTableData", params);
};

/**
 * 新增
 */
const add = () => {
  console.log(22);

  emit("add");
};

/**
 * 权限配置
 * @param {object} row
 */
const roleConfig = (row) => {
  emit("roleConfig", row);
};

/**
 * 编辑
 * @param {object} row
 */
const edit = (row) => {
  emit("edit", row);
};

/**
 * 删除
 * @param {object} row
 */
const delet = (row) => {
  ElMessageBox.confirm("确定删除该数据?", "提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then(() => {
    emit("delet", row);
  });
};

defineExpose({ reset });
</script>

<style lang="less" scoped>
@import url("@/style/table.less");
</style>
