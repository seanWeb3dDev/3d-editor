<!-- 配置信息（离线版：仅全局配置） -->
<template>
  <div>
    <el-scrollbar height="40rem">
      <div style="padding-left: 1rem; margin-bottom: 1rem">
        <el-button type="primary" @click="setView">设置默认视角</el-button>
      </div>
      <form-list-vue :data-list="globalConfig" @callback="formCallback" />
    </el-scrollbar>
    <div class="foot-div">
      <el-button type="primary" @click="save">保存配置</el-button>
    </div>
  </div>
</template>

<script setup name="">
import FormListVue from "@/components/Form/FormList.vue";
import bus from "@/utils/bus";

const globalConfig = reactive([]);

/** 修改模型信息 */
const updateModel = (obj) => bus.emit("use_map_function", obj);

/** 获取视角 */
const setView = () =>
  updateModel({
    func: ["_FUNCS", "getViewAngle"],
    callback: (val) => {
      if (val) {
        Object.keys(val).forEach((key) => {
          const item = globalConfig.find((m) => m.key == key);
          if (item) {
            item.value = val[key];
          }
        });
      }
    },
  });

/** 全局配置返回 */
const formCallback = ({ obj: { key, val } }) =>
  updateModel({ func: ["_FUNCS", "setValue"], param: { key, value: val } });

/** 保存配置 */
const save = () => bus.emit("save-map", 5);

/** 处理配置信息 */
const handleConfig = ({ global }) => {
  globalConfig.length = 0;
  global.forEach((m) => {
    if (m.key == "global_pathTracer") {
      // 跳过渲染配置（离线版不需要）
      return;
    }
    m.isGlobal = true;
    if (m.key == "global_background") {
      m.hasColor = true;
      m.notClear = true;
    }
    globalConfig.push(m);
  });
};

onMounted(() => {
  bus.emit("get_map_config_info", (obj) => handleConfig(obj));
});
</script>

<style lang="less" scoped>
.foot-div {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px 1rem 8px 0;
  text-align: right;
}
</style>
