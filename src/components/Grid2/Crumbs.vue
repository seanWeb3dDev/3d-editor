<!-- 项目、素材级别路径 -->
<template>
  <div class="crumbs-div">
    <template v-for="(item, index) in props.list">
      <el-dropdown placement="top-start" v-if="item.list && item.list.length > 1">
        {{ item.label }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="it in item.list" @click="goTo({ data: item, index })">
              {{ it.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div v-else @click="goTo({ data: item, index })">{{ item.label }}</div>
      <span v-if="index < props.list.length - 1">/</span>
    </template>
  </div>
</template>

<script setup name="">
const props = defineProps({ list: { type: Array, default: () => [] } });

const emits = defineEmits(["callback"]);

const goTo = (obj) => emits("callback", obj);
</script>

<style lang="less" scoped>
.crumbs-div {
  height: 20px;
  display: flex;
  align-items: center;
  font-family: AlibabaPuHuiTiM;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);

  :deep(.el-dropdown) {
    span {
      font-family: AlibabaPuHuiTiM;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  & > div {
    cursor: pointer;

    &:last-child {
      color: rgba(255, 255, 255, 1);
    }
  }

  span {
    margin: 0 5px;
    display: flex;
  }
}
</style>
