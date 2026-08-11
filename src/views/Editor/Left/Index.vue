<!-- 左侧资源 -->
<template>
  <div class="left-resource">
    <el-tabs v-model="resourceTab" type="card" class="custom-tabs-resource" @tab-change="tabChange">
      <el-tab-pane label="资源" name="resource">
        <el-scrollbar>
          <el-collapse
            v-model="activeName"
            class="resource-collapse"
            accordion
            :icon="ArrowRightBold"
          >
            <el-collapse-item v-for="(item, index) in list" :name="`${index + 1}`">
              <template #title>
                <title-vue
                  :type-list="item.addObjectList"
                  @callback="(key) => callback({ func: item.func, param: key })"
                >
                  {{ item.label }}
                </title-vue>
              </template>
              <tree-vue
                ref="TreeRef"
                :uuid="item.uuid"
                @handleNodeClick="handleNodeClick"
                @lock="lock"
                @showOrHide="showOrHide"
                @contextMenu="contextMenu"
                @callback="callback"
              />
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane
        label="材质"
        name="texture"
        :class="{ 'no-data': textureList.length <= 0 }"
        text="暂无数据"
      >
        <el-scrollbar v-if="textureList.length > 0">
          <div class="res-mater-list-box">
            <div
              class="res-mater-li"
              v-for="item in textureList"
              :class="{ active: item.uuid == nowTexture && state.uuid != '' }"
              @click.stop="
                () => {
                  clickHan = true;
                  nowTexture = item.uuid;
                  emit('callback', { func: ['_FUNCS', 'selectMaterial'], param: item.uuid });
                }
              "
            >
              {{ item.name || item.uuid }}
            </div>
          </div>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>

  <!-- 右键菜单 -->
  <div
    v-if="showContentMenu"
    class="context-menu"
    :style="{
      top: contextMenuPos.y == undefined ? 'unset' : `${contextMenuPos.y}px`,
      bottom: contextMenuPos.b == undefined ? 'unset' : `${contextMenuPos.b}px`,
      left: `${contextMenuPos.x}px`,
    }"
  >
    <el-menu :collapse="true">
      <context-menu-vue :list="contextMenuList" @callback="callback" :level="1" />
    </el-menu>
  </div>

  <!-- 上传模型 -->
  <import-vue v-model:VisibleP="visible" v-if="visible" @callback="callback" />
</template>

<script setup name="">
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { ArrowRightBold } from "@element-plus/icons-vue";
import TitleVue from "./Title.vue";
import TreeVue from "./Tree.vue";
import ImportVue from "./Import.vue";
import ContextMenuVue from "./ContextMenu.vue";

const { state } = useStore();

const props = defineProps({
  addObjectList: { type: Object, default: () => {} },
});

const emit = defineEmits(["callback"]);

let clickHan = false;

const resourceTab = ref("resource");
const activeName = ref("1");

const TreeRef = ref();

const list = reactive([
  { label: "灯光组", uuid: "", addObjectList: [], func: ["_FUNCS", "addLight"] },
  { label: "文本组", uuid: "", addObjectList: [], func: ["_FUNCS", "addText"] },
  { label: "粒子组", uuid: "", addObjectList: [], func: ["_FUNCS", "addParticle"] },
  { label: "辅助线组", uuid: "", addObjectList: [], func: ["_FUNCS", "addHelperLine"] },
  { label: "模型", uuid: "", addObjectList: [], func: ["_FUNCS", "addModel"] },
]);

watch(
  () => props.addObjectList,
  (val) => {
    list[0].addObjectList = val.lightGroup;
    list[1].addObjectList = val.textGroup;
    list[2].addObjectList = val.ParticleGroup;
    list[4].addObjectList = val.modelGroup;
    list[3].addObjectList = val.helperLineGroup || [];
  },
  { deep: true, immediate: true }
);

let clickKey = "",
  clickTime = Date.now();
/** 节点点击 */
const handleNodeClick = async (data) => {
  clickHan = true;
  if (data.key) {
    if (clickKey != data.key || Date.now() - clickTime > 500) {
      clickKey = data.key;
      clickTime = Date.now();
      emit("callback", { func: ["_FUNCS", "select"], param: data.key });
    } else if (clickKey == data.key && Date.now() - clickTime <= 500) {
      emit("callback", { func: ["_FUNCS", "objectFocus"], param: data.key });
      clickKey = "";
    }
  }
};

watch(
  () => state.uuid,
  (val) => {
    if (val) {
      if (!clickHan) {
        resourceTab.value == "texture" && (resourceTab.value = "resource");
      }
      clickHan = false;
      let _index = -1;
      try {
        TreeRef.value.forEach((objRef, index) => {
          if (objRef.setCurrentKey(val)) {
            _index = index;
            throw new Error("已设置");
          }
        });
      } catch (error) {}
      if (_index >= 0) {
        activeName.value = `${_index + 1}`;
        nextTick(() => {
          setTimeout(() => {
            const currentNode = document.querySelector(`.el-tree [data-key='${val}']`);
            if (currentNode) {
              currentNode.scrollIntoView({ block: "center", behavior: "smooth" });
            }
          }, 50);
        });
      }
    } else {
      TreeRef.value.forEach((objRef) => {
        objRef.setCurrentKey("");
      });
    }
  }
);

const visible = ref(false);

const callback = (obj) => {
  emit("callback", obj);
};

const showContentMenu = ref(false);
const contextMenuList = reactive([]);
const contextMenuPos = reactive({ x: 0, y: 0, b: undefined });

const contextMenu = ({ event, uuid }) =>
  callback({
    func: ["_pluginDispatch", "OperatePlugin", "getOperateList"],
    param: [uuid],
    callback: (data) => {
      if (data.length > 0) {
        const { x, y } = event;
        contextMenuPos.x = x - 1;
        if (y > document.body.clientHeight / 2) {
          contextMenuPos.y = undefined;
          contextMenuPos.b = document.body.clientHeight - y - 28;
        } else {
          contextMenuPos.y = y - 28;
          contextMenuPos.b = undefined;
        }
        contextMenuList.length = 0;
        data.forEach((item) => contextMenuList.push(item));
        showContentMenu.value = true;
      }
    },
  });

/** 锁定 */
const lock = (obj) => callback({ func: ["_FUNCS", "lockObject"], param: obj });

/** 显示、隐藏 */
const showOrHide = ({ uuid, value }) => {
  callback({ func: ["_FUNCS", "setValue"], param: { uuid, key: "attribute_visible", value } });
};

const textureList = reactive([]);
const nowTexture = ref("");
const tabChange = (tabName) => {
  if (tabName == "texture") {
    textureList.length = 0;
    callback({
      func: ["_FUNCS", "getAllMaterial"],
      callback: (data) => {
        for (const [_key, value] of data) {
          textureList.push(value);
        }
      },
    });
  }
  emit("callback", { func: ["_FUNCS", "select"], param: null });
  nowTexture.value && (nowTexture.value = "");
};

const setValue = (data, parentUid, sign, index) => {
  if (data.length <= 0) {
    switch (sign) {
      case 0:
        list[0].uuid = parentUid;
        break;
      case 1:
        list[1].uuid = parentUid;
        break;
      case 2:
        list[4].uuid = parentUid;
        break;
      case 3:
        list[2].uuid = parentUid;
        break;
      case 4:
        list[3].uuid = parentUid;
        break;
    }
  } else {
    data.forEach((item) => {
      try {
        TreeRef.value.forEach((objRef) => {
          if (objRef.append(item, parentUid, index)) {
            throw new Error("已添加");
          }
        });
      } catch (error) {}
    });
  }
};

const remove = (uuid) => {
  let hasObj = false;
  try {
    TreeRef.value.forEach((objRef) => {
      if (objRef.remove(uuid)) {
        throw new Error("已删除");
      }
    });
  } catch (error) {
    hasObj = true;
  }
  !hasObj && ElMessage.info("未找到该对象");
};

const updateName = (name) => {
  try {
    TreeRef.value.forEach((objRef) => {
      if (objRef.updateName(name)) {
        throw new Error("已更新");
      }
    });
  } catch (error) {}
};

const setVisible = (bo, uuid) => {
  try {
    TreeRef.value.forEach((objRef) => {
      if (objRef.setVisible(bo, uuid)) {
        throw new Error("已更新");
      }
    });
  } catch (error) {}
};

onMounted(() => {
  window.addEventListener("click", () => (showContentMenu.value = false));
});

defineExpose({ setValue, remove, updateName, setVisible });
</script>

<style lang="less" scoped>
@collapse-header: 50px;
.left-resource {
  font-family: AlibabaPuHuiTiR;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.9);
  height: 100%;

  .res-mater-list-box {
    padding-top: 12px;
    padding-bottom: 12px;
    .res-mater-li {
      padding: 10px 24px;
      font-family: AlibabaPuHuiTiR;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      &.active {
        background: #0f8dff;
      }
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 1;
  display: flex;
  height: auto !important;
  position: absolute;
  top: 56px;
  left: 50%;
  background: #282828;
  box-shadow:
    2px 0px 6px 0px rgba(0, 0, 0, 0.6),
    inset 0px 0px 4px 0px rgba(0, 0, 0, 0.8);
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.23);
  padding: 4px 4px;

  .el-menu {
    background-color: transparent;
    width: 100%;
    height: 100%;
  }
}
</style>
