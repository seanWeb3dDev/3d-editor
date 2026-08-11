<!--  -->
<template>
  <div>
    <canvas ref="CanvasRef"></canvas>
  </div>
</template>

<script setup name="">
const props = defineProps({
  img: {
    type: [String, Number, Boolean, ImageBitmap, Array],
    default: null,
  },
});

const CanvasRef = ref(null);

watch(
  () => props.img,
  async (val) => {
    await nextTick();
    if (CanvasRef.value && val) {
      if (val instanceof ImageBitmap) {
        let width = val.width,
          height = val.height;
        if (width > 129) {
          height = (129 / width) * height;
          width = 129;
        }
        if (height > 96) {
          width = (96 / height) * width;
          height = 96;
        }
        CanvasRef.value.width = width;
        CanvasRef.value.height = height;

        // 获取canvas上下文
        const ctx = CanvasRef.value.getContext("2d");
        if (ctx) {
          // 将ImageBitmap绘制到canvas上
          ctx.drawImage(val, 0, 0, width, height);
        }
      }
    }
  },
  { immediate: true }
);
</script>

<style lang="less" scoped></style>
