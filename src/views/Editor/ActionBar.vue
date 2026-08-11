<template>
  <div class="mater-tools-box">
    <ul>
      <li v-for="(action, index) in actionList">
        <el-popover :visible="visible[index]" placement="bottom-end" :show-arrow="false"
          popper-class="mater-tools-popper">
          <template #reference>
            <el-button class="only-icon bigger border" :class="{ bc: visible[index] }" @click="openAction(index)">
              <el-tooltip effect="dark" :content="`${action.name}插件`" placement="right">
                <i class="icon-img" :class="action.icon"></i>
              </el-tooltip>
            </el-button>
          </template>
          <div class="mater-main-container">
            <div class="btn-group-toolbar">
              <el-dropdown popper-class="light" placement="right" trigger="click" :popper-options="{
                placement: 'left-start',
                modifiers: [{}],
              }">
                <el-button class="only-icon big">
                  <el-tooltip effect="dark" :content="`添加${action.tip}`" placement="top">
                    <i class="icon-img add tf"></i>
                  </el-tooltip>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in addList[index]" @click.stop="addAction(item.value, action.plugin)">
                      {{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button class="only-icon big" @click.stop="extract(action.plugin)">
                <el-tooltip effect="dark" :content="`提取${action.tip}`" placement="top">
                  <i class="icon-img absorb tf"></i>
                </el-tooltip>
              </el-button>
              <el-button class="only-icon big" @click.stop="copy(action.plugin)">
                <el-tooltip effect="dark" :content="`赋予${action.tip}`" placement="top">
                  <i class="icon-img give tf"></i>
                </el-tooltip>
              </el-button>
            </div>
            <div class="mater-list-main-container">
              <el-scrollbar>
                <div class="list" v-for="(item, ind) in list[index]" :class="{ active: nowObj == item.value }"
                  @click.stop="selectAction(item.value, action.plugin)">
                  <span>{{ item.label }}</span>
                  <i class="icon close" @click.stop="remove(index == 0 ? item.value : ind, action.plugin)"></i>
                </div>
              </el-scrollbar>
            </div>
            <div class="footer" v-if="index == 0">
              <div></div>
              <div>
                <div></div>
                <div class="cavImage" ref="ContentRef"></div>
                <div></div>
              </div>
              <div></div>
            </div>
          </div>
        </el-popover>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";

const emit = defineEmits(["callback"]);

const actionList = [
  { name: "材质", plugin: "MaterialPlugin", tip: "材质", icon: "material-btn" },
  { name: "粒子", plugin: "ParticleBehaviorPlugin", tip: "行为", icon: "particle-btn" },
];

const visible = reactive([false, false]);

const addList = reactive([[], []]);
const list = reactive([[], []]);
let nowIndex = -1;

const openAction = async (index) => {
  nowIndex = index;
  let isOpen = false;
  let materialBallState = -1;
  if (visible[0]) {
    materialBallState = 0;
  } else if (index == 0) {
    materialBallState = 1;
  }
  visible.forEach((_it, ind) => {
    if (index == ind) {
      isOpen = visible[ind] = !visible[index];
    } else if (visible[ind]) {
      visible[ind] = false;
    }
  });
  addList[index].length = list[index].length = 0;
  if (isOpen) {
    let plugin = index == 0 ? "MaterialPlugin" : "ParticleBehaviorPlugin";
    callback({
      func: ["_pluginDispatch", plugin, "getAddList"],
      callback: (data) => {
        data.forEach((item) => addList[index].push(item));
      },
    });
    callback({
      func: ["_pluginDispatch", plugin, "map"],
      callback: (data) => {
        data.forEach((item) =>
          list[index].push({
            label: item.name || item.type,
            value: item.uuid,
          })
        );
      },
    });
  }
  if (materialBallState >= 0) {
    await nextTick();
    callback({
      func: ["_pluginDispatch", "MaterialPlugin", "viewportVisible"],
      param: [materialBallState == 1],
    });
    resize();
  }
};

const nowObj = ref("");

const addAction = (val, plugin) => {
  callback({
    func: ["_pluginDispatch", plugin, "add"],
    param: [val],
    callback: (data) => {
      if (data instanceof Array) {
        list[nowIndex].length = 0;
        data.forEach((m) => list[nowIndex].push({ ...m, label: m.type }));
      } else {
        list[nowIndex].push(data);
      }
    },
  });
};

const selectAction = (val, plugin) => {
  nowObj.value = val;
  callback({ func: ["_pluginDispatch", plugin, "select"], param: [val] });
};

const extract = (plugin) => {
  callback({
    func: ["_pluginDispatch", plugin, "absorb"],
    callback: (data) => {
      if (data === false) {
        ElMessage.info("请选择有效模型");
      } else {
        if (data instanceof Array) {
          list[nowIndex].length = 0;
          data.forEach((m) => list[nowIndex].push({ ...m, label: m.type }));
        } else if (typeof data == "string") {
          selectAction(data);
        } else if (data.label) {
          list[nowIndex].push({ ...data });
        }
      }
    },
  });
};

const copy = (plugin) => {
  callback({
    func: ["_pluginDispatch", plugin, "set"],
    param: nowIndex == 0 ? [nowObj.value] : undefined,
    callback: (data) => {
      if (data === false) {
        ElMessage.info("请选择有效模型");
      }
    },
  });
};

const remove = (val, plugin) => {
  callback({
    func: ["_pluginDispatch", plugin, "removeFromList"],
    param: [val],
  });
  if (nowObj.value == val) {
    nowObj.value = "";
    callback({ func: ["_pluginDispatch", plugin, "select"] });
  }
  let deleteInd = -1;
  if (nowIndex == 0) {
    deleteInd = list[nowIndex].findIndex((m) => m.value == val);
  } else {
    deleteInd = val;
  }
  list[nowIndex].splice(deleteInd, 1);
};

/** 获取dom的实际坐标 */
const getDomPosition = (dom, scale) => {
  const rect = dom.getBoundingClientRect();
  return [
    rect.left - scale * 260,
    document.body.clientHeight - rect.top - ContentRef.value[0].clientHeight - scale * 2,
  ];
};

const ContentRef = ref();

const resize = () => {
  if (visible[0] && ContentRef.value[0]) {
    const scale = Number(document.documentElement.style.fontSize.replace("px", "")) / 16;
    const arr = getDomPosition(ContentRef.value[0], scale);
    arr.push(ContentRef.value[0].clientWidth + scale * 2);
    callback({
      func: ["_pluginDispatch", "MaterialPlugin", "viewportResize"],
      param: arr,
    });
  }
};

const callback = ({ func, param, callback }) => {
  emit("callback", { func, param, callback });
};

onMounted(() => {
  window.addEventListener("resize", () => setTimeout(resize, 0));
});
</script>

<style lang="less" scoped>
.mater-tools-box {
  position: absolute;
  top: 63px;
  right: 0px;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}
</style>
