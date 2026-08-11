<!-- 右键菜单 -->
<template>
  <template v-for="item in menuList">
    <el-sub-menu
      v-if="item.list && item.list.length > 0"
      popper-class="context-menu-list"
      :index="`${item.value}`"
    >
      <template #title>
        {{ item.label }}
        <el-icon class="icon-arrows"><ArrowRight /></el-icon>
      </template>
      <context-menu-vue
        :list="item.list"
        @callback="(obj) => callback(obj, item)"
        :level="props.level + 1"
      />
    </el-sub-menu>
    <el-menu-item v-else @click="labelClick(item)" :index="`${item.value}`">
      {{ item.label }}
    </el-menu-item>
  </template>
</template>

<script setup name="">
import ContextMenuVue from "./ContextMenu.vue";

const props = defineProps({
  list: { type: Array, default: [] },
  level: { type: Number, default: 0 },
});

const emit = defineEmits(["callback"]);

const menuList = computed({
  get: () => {
    const arr = [];
    props.list.forEach((item) => {
      item.show = false;
      arr.push(item);
    });
    return arr;
  },
  set: () => {},
});

const callback = ({ key, value }, item) => {
  let func;
  if (key == undefined) {
    func = item.value;
  } else {
    func = item.value + "_" + key;
  }
  if (props.level != 1) {
    emit("callback", { key: func, value });
  } else {
    emit("callback", {
      func: ["_pluginDispatch", "OperatePlugin", "execute"],
      param: [func, value],
    });
  }
};

const labelClick = (obj) => {
  if (!obj.list || obj.list.length <= 0) {
    if (props.level == 1) {
      emit("callback", {
        func: ["_pluginDispatch", "OperatePlugin", "execute"],
        param: [obj.value],
      });
    } else {
      emit("callback", { value: obj.value });
    }
  }
};
</script>

<style lang="less">
.el-popper.is-light.context-menu-list {
  background-color: transparent;
  border: none;
  transform: translate(2px, -4px);
  height: auto !important;
  background: #282828;
  box-shadow:
    2px 0px 6px 0px rgba(0, 0, 0, 0.6),
    inset 0px 0px 4px 0px rgba(0, 0, 0, 0.8);
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.23);
  padding: 2px 4px;
  width: auto;

  .el-icon {
    display: none;
  }
}

.el-menu {
  min-width: 80px;
  width: auto;
  border: none;
  background-color: transparent;

  & > li + li {
    margin-top: 5px;
  }

  .el-sub-menu {
    .el-sub-menu__title,
    .el-menu-item {
      height: 30px;
      width: auto;
      color: #fff;
      font-size: 14px;
      overflow: hidden;
      padding: 0 10px;
      justify-content: center;

      .icon-arrows {
        width: 12px;
        font-size: 14px;
        margin-left: 10px;
        display: inline-block;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);

        .icon-arrows {
          transform: rotate(90deg);
        }
      }
    }
  }

  .el-menu-item {
    height: 30px;
    width: auto;
    color: #fff;
    font-size: 14px;
    overflow: hidden;
    padding: 0 10px;
    justify-content: center;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  &:not(.el-menu--collapse) .el-sub-menu__title {
    font-size: 14px;
  }

  &.el-menu--popup {
    min-width: 80px;
    width: auto;
  }
}
</style>
