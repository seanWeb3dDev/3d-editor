<!-- 可移动弹窗 -->
<template>
  <div
    class="move-dialog"
    :class="className"
    v-if="visible"
    :style="{ top: `${top}px`, left: `${left}px` }"
  >
    <header :class="{ move }" @mousedown="move = true" @mouseup="move = false">
      <template v-if="$slots.header" slot="header">
        <slot name="header"> </slot>
      </template>
      <template v-else>
        <div>{{ props.title }}</div>
      </template>

      <Close class="close" @click.stop="emit('close')" />
    </header>
    <div><slot></slot></div>
  </div>
</template>

<script setup name="">
const props = defineProps({
  className: { type: String, default: "" },
  visibleP: { type: Boolean, default: false },
  title: { type: String, default: "" },
  config: { type: Array, default: [] },
});

const emit = defineEmits(["close"]);

const visible = ref(false);

watch(
  () => props.visibleP,
  (val) => (visible.value = val)
);

const move = ref(false);
const top = ref(60);
const left = ref(260);

const oldPosition = { x: 0, y: 0 };
const mouseMove = (e) => {
  if (move.value) {
    top.value += e.clientY - oldPosition.y;
    left.value += e.clientX - oldPosition.x;
  }
  oldPosition.x = e.clientX;
  oldPosition.y = e.clientY;
};

onMounted(() => {
  window.addEventListener("mousemove", mouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", mouseMove);
});
</script>

<style lang="less" scoped>
.move-dialog {
  position: fixed;
  width: 400px;
  min-height: 100px;
  z-index: 99;
  background: #282828;
  box-shadow:
    2px 0px 6px 0px rgba(0, 0, 0, 0.6),
    inset 0px 0px 4px 0px rgba(0, 0, 0, 0.8);
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.23);
  header {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px 16px;
    font-family: AlibabaPuHuiTiM;
    font-size: 16px;
    color: #ffffff;
    &.move {
      cursor: move;
    }
  }
}
</style>
