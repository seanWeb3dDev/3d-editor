<!-- 宫格列表 -->
<template>
  <div class="grid" :class="{ pure: props.pure }" v-loading="props.loading">
    <div class="operate">
      <div class="search-div" v-if="props.operateArr.includes('search')">
        <slot name="search-slot"></slot>
      </div>
      <el-select
        v-if="props.sortOptions.length > 0"
        v-model="sort"
        placeholder="请选择排序方式"
        clearable
      >
        <el-option v-for="item in props.sortOptions" :label="item.label" :value="item.value" />
      </el-select>
      <el-button
        type="primary"
        class="icon-btu"
        @click="add"
        v-if="props.editArr.includes('add')"
        v-purview:add
      >
        <i class="add icon-img"></i>
        <span>新增</span>
      </el-button>
    </div>
    <div v-if="props.operateArr.includes('step')" class="step-div">
      <slot name="crumbs"></slot>
    </div>
    <div class="list" :class="{ 'has-step': props.operateArr.includes('step') }">
      <el-scrollbar>
        <div v-for="item in props.tableData" class="grid-item">
          <div class="thumbnail" @click.stop="(e) => projectClick(e, item)" v-purview:editor>
            <item-vue :data="item" :template-list="props.templateList" />
          </div>
          <div class="grid-name">
            <div class="name">{{ item.name }}</div>
            <div class="item-operate">
              <el-tooltip content="导出" v-if="props.operateArr.includes('export')">
                <el-button link @click.stop="download(item)" v-purview:export>
                  <i
                    class="icon-img download"
                    :class="{
                      downloading: route.name == 'home' && state.exportProject.includes(item.id),
                    }"
                  ></i>
                </el-button>
              </el-tooltip>
              <el-tooltip
                content="预览"
                v-if="
                  props.operateArr.includes('preview') &&
                  (route.name !== 'material' || item.type >= 0)
                "
              >
                <el-button link @click.stop="preview(item)" v-purview:preview>
                  <i class="icon-img preview"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="编辑" v-if="props.editArr.includes('edit')">
                <el-button link @click.stop="edit(item)" v-purview:edit>
                  <i class="icon-img edit"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" v-if="props.editArr.includes('delete')">
                <el-button link @click.stop="handelDelete(item)" v-purview:delete>
                  <i class="icon-img delete"></i>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="page" v-if="props.operateArr.includes('page')">
      <el-pagination
        v-model:current-page="pageIndex"
        :page-size="12"
        :page-sizes="[10, 20, 30, 40]"
        layout="prev, pager, next"
        :total="props.total"
        @current-change="pageChange"
      />
    </div>
  </div>
</template>

<script setup name="">
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";
import ItemVue from "./Item.vue";

const { state, getters } = useStore();

const route = useRoute();

const props = defineProps({
  /** 包含的维护功能 */
  editArr: { type: Array, default: () => ["add", "edit", "delete", "open"] },
  /** 包含的操作功能 */
  operateArr: { type: Array, default: () => ["search", "page", "export", "preview", "step"] },
  /** 排序选项 */
  sortOptions: { type: Array, default: [] },
  /** 列表数据 */
  tableData: { type: Array, default: [] },
  /** 总条数 */
  total: { type: Number, default: 0 },
  /** 加载状态 */
  loading: { type: Boolean, default: false },
  /** 无背景图 */
  pure: { type: Boolean, default: false },
  /** 模板列表 */
  templateList: { type: Array, default: () => [] },
});

const emit = defineEmits(["editCallback", "operateCallback"]);

const purview = computed(() => getters.getPurview(route.name) || {});

const sort = ref("");

const pageIndex = ref(1);

/**
 * 翻页
 * @param {number} val
 */
const pageChange = (val) => {
  pageIndex.value = val;
  emit("operateCallback", "page", val);
};

watch(
  () => sort.value,
  (val) => emit("operateCallback", "sort", val)
);

/**
 * 新增
 */
const add = () => {
  emit("editCallback", "add");
};

/** 下载 */
const download = (obj) => emit("operateCallback", "export", { ...obj });

/**
 * 编辑
 */
const edit = (obj) => emit("editCallback", "edit", { ...obj });

/**
 * 预览
 */
const preview = (obj) => emit("operateCallback", "preview", obj.id);

/**
 * 删除
 */
const handelDelete = (obj) => {
  ElMessageBox.confirm("确定删除该数据?", "提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then(() => emit("editCallback", "delete", { ...obj }));
};

let level = 0;
const checkClickDomPurview = (dom) => {
  if ([...dom.classList].includes("thumbnail")) {
    return dom.getAttribute("no-click") == undefined;
  } else {
    level += 1;
    if (level > 10) {
      return false;
    } else {
      return checkClickDomPurview(dom.parentElement);
    }
  }
};

const projectClick = (e, obj) => {
  level = 0;
  if (checkClickDomPurview(e.srcElement) && props.editArr.includes("open")) {
    emit("editCallback", "open", obj);
  }
};

const reset = () => (pageIndex.value = 1);

defineExpose({ reset });
</script>

<style lang="less" scoped>
@import url("@/style/grid2.less");
</style>
