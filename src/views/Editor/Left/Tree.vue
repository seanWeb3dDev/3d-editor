<!-- 模型树 -->
<template>
  <el-tree
    ref="TreeRef"
    node-key="key"
    :data="list"
    :props="defaultProps"
    :expand-on-click-node="false"
    draggable
    :indent="6"
    :icon="ArrowRightBold"
    @node-click="handleNodeClick"
    @node-contextmenu="showContextMenu"
    :allow-drop="allowDrop"
    :allow-drag="allowDrag"
    @node-drop="nodeDrop"
  >
    <template #default="{ data }">
      <div class="resource-list-dt">
        <div
          class="tree-li-name"
          :class="{
            visible: !data.visible && data.visible !== undefined,
            'has-event': data.hasEvent == true,
          }"
        >
          {{ data.label }}
        </div>
        <div class="op-group">
          <!--锁-->
          <el-button
            v-if="data.isLocked !== undefined"
            class="only-icon"
            :class="{ lock: data.isLocked }"
            @click.stop="lock(data)"
          >
            <i class="icon-img lock-icon-ic"></i>
          </el-button>
          <!--隐藏-->
          <el-button
            v-if="data.visible !== undefined"
            class="only-icon"
            :class="{ show: !data.visible }"
            @click.stop="showOrHide(data)"
          >
            <i class="icon-img hide-icon-ic"></i>
          </el-button>
        </div>
      </div>
    </template>
  </el-tree>
</template>

<script setup name="">
import { useStore } from "vuex";
import { ArrowRightBold } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import bus from "@/utils/bus";

const { state } = useStore();

const props = defineProps({ uuid: { type: String, default: "" } });

const emit = defineEmits(["handleNodeClick", "showOrHide", "lock", "contextMenu", "callback"]);

const TreeRef = ref();

const list = reactive([]);

/** 节点点击 */
const handleNodeClick = (data) => {
  if (data.isLocked) {
    ElMessage.info("已被锁定，请先取消锁定");
    return;
  }
  emit("handleNodeClick", data);
};

const showContextMenu = (e, data) => {
  emit("contextMenu", { event: e, uuid: data.key });
};

/** 锁定 */
const lock = (data) => {
  emit("lock", {
    uuid: data.key,
    value: !data.isLocked,
  });
};

/** 显示、隐藏 */
const showOrHide = (data) => {
  data.visible = !data.visible;
  emit("showOrHide", {
    uuid: data.key,
    value: data.visible,
  });
};

const customNodeClass = (data) => {
  let selfClass = data.class;
  if (data.key && data.key == state.uuid) {
    selfClass += " no-children";
  }
  return selfClass;
};

const defaultProps = {
  children: "children",
  label: "label",
  visible: "visible",
  class: customNodeClass,
};

const getNode = (uuid) => {
  return TreeRef.value.getNode(uuid || state.uuid);
};
const setCurrentKey = (uuid) => {
  if (uuid == "") {
    return true;
  } else {
    if (getNode(uuid)) {
      TreeRef.value.setCurrentKey(uuid, true);
      return true;
    }
    return false;
  }
};

const traverseList = (obj, arr) => {
  try {
    arr.forEach((item) => {
      if (item.key == obj.key) {
        item.children = obj.children;
        throw new Error("已找到");
      } else if (item.children.length > 0) {
        traverseList(obj, item.children);
      } else {
        throw new Error("遍历结束");
      }
    });
  } catch (error) {}
};

const traverseUnlock = (uuid) => {
  const node = getNode(uuid);
  if (node) {
    const data = node.data;
    if (data && data.isLocked) {
      data.isLocked = false;
      traverseUnlock(node.parent.data.key);
    }
  }
};

const appendOrUpdate = (obj, parentUuid, _index) => {
  const node = getNode(obj.key);
  if (node) {
    // 检查是否需要移动到新父节点：当前父节点与目标父节点不同时，先移除再重新插入
    const currentParentKey = node.parent?.data?.key;
    if (parentUuid && currentParentKey && currentParentKey !== parentUuid) {
      TreeRef.value.remove(obj.key);
      // 安全兜底：若 remove 后节点仍在内部缓存中，强制更新属性后 return，避免重复插入
      const afterRemove = getNode(obj.key);
      if (afterRemove) {
        const data = afterRemove.data;
        if (data) {
          data.isLocked = obj.isLocked;
          data.visible = obj.visible;
          data.hasEvent = obj.hasEvent;
        }
        return;
      }
      // 移除成功，fall-through 到下方插入分支
    } else {
      const data = node.data;
      if (!data) return;
      const needUnlock = data.isLocked != obj.isLocked;
      data.isLocked = obj.isLocked;
      data.visible = obj.visible;
      data.hasEvent = obj.hasEvent;
      if (obj.children && obj.children.length > 0) {
        traverseList(obj, list);
      }
      if (parentUuid && needUnlock && !data.isLocked) {
        traverseUnlock(parentUuid);
      }
      return;
    }
  }
  // 节点不存在（或刚从旧父节点移除），插入到新父节点下
  if (parentUuid) {
    if (_index != undefined) {
      const _node = getNode(parentUuid);
      if (_node && _index <= _node.childNodes.length - 1) {
        TreeRef.value.insertBefore(obj, _node.childNodes[_index]);
      } else if (_node && _node.childNodes.length > 0) {
        TreeRef.value.insertAfter(obj, _node.childNodes[_node.childNodes.length - 1]);
      } else {
        TreeRef.value.append(obj, parentUuid);
      }
    } else {
      TreeRef.value.append(obj, parentUuid);
    }
  } else {
    TreeRef.value.append(obj);
  }
};

const append = (item, uuid, index) => {
  if (props.uuid == uuid) {
    appendOrUpdate(item);
    return true;
  } else if (getNode(uuid)) {
    appendOrUpdate(item, uuid, index);
    return true;
  }
  return false;
};
const remove = (uuid) => {
  if (getNode(uuid)) {
    TreeRef.value.remove(uuid);
    return true;
  }
  return false;
};

const updateName = (name) => {
  const node = getNode();
  if (node) {
    node.data.label = name;
    return true;
  }
  return false;
};

const setVisible = (bo, uuid) => {
  const node = getNode(uuid || state.uuid);
  if (node) {
    node.data.visible = bo;
    return true;
  }
  return false;
};

/** 是否允许拖拽 */
const allowDrag = (node) => {
  return !node.data.isLocked;
};

/** 拖拽行为判断 */
const allowDrop = (_node, dropNode) => {
  return !dropNode.isLocked;
};

/** 遍历找位置及父uuid */
const traverseListForInd = (arr, _uuid) => {
  let res = { uuid: undefined, index: -1 };
  try {
    for (let index = 0; index < arr.length; index++) {
      const item = arr[index];
      if (item.key == _uuid) {
        res.index = index;
        throw new Error("ok");
      } else if (item.children && item.children.length > 0) {
        const { uuid, index } = traverseListForInd(item.children, _uuid);
        if (index >= 0) {
          res.index = index;
          if (uuid == undefined) {
            res.uuid = item.key;
          } else {
            res.uuid = uuid;
          }
          throw new Error("ok");
        }
      }
    }
  } catch (err) {}
  return res;
};

const nodeDrop = (node) => {
  const { uuid, index } = traverseListForInd(list, node.data.key);
  let parentUuid = "";
  if (uuid != undefined) {
    parentUuid = uuid;
  } else {
    parentUuid = props.uuid;
  }
  emit("callback", {
    func: ["_FUNCS", "moveObject"],
    param: { uuid: node.data.key, parentUuid: parentUuid, index },
  });
};

defineExpose({ getNode, setCurrentKey, append, remove, updateName, setVisible });

const updateSceneData = ({ uuid, key, value }) => {
  const node = TreeRef.value.getNode(uuid);
  if (node) {
    node.data[key] = value;
  }
};

onMounted(() => {
  bus.on("update-scene-data", updateSceneData);
});

onBeforeUnmount(() => {
  bus.off("update-scene-data");
});
</script>

<style lang="less" scoped></style>
