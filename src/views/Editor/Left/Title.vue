<!--  -->
<template>
  <div class="header-main">
    <div class="header-main-title">
      <slot></slot>
    </div>
    <div class="header-op-right">
      <el-dropdown
        popper-class="light"
        placement="right"
        trigger="click"
        :popper-options="popperOptions"
      >
        <el-button class="only-icon" @click.stop="() => {}">
          <i class="icon-img add-icon-ic"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in props.typeList" @click.stop="callback(item.key)">
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup name="">
const props = defineProps({ typeList: { type: Array, default: [] } });

const emit = defineEmits(["callback"]);

const popperOptions = {
  placement: "right-start",
  modifiers: [{}],
};

const callback = (key) => emit("callback", key);
</script>

<style lang="less" scoped></style>
