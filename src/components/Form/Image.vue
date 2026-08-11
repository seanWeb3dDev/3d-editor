<!-- 图片 -->
<template>
  <!-- 文件上传 -->
  <div class="img-upload-div" ref="UploadDivRef">
    <el-upload
      ref=""
      class="img-upload"
      action="#"
      :http-request="(options) => httpRequest(options)"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :accept="accept"
      :disabled="disabled"
    >
      <template #trigger v-if="file">
        <canvas ref="CanvasRef"></canvas>
      </template>
    </el-upload>
    <el-icon @click.stop="clearImg"><Close /></el-icon>
  </div>
</template>

<script setup name="">
const props = defineProps({
  data: { type: Object, default: {} },
  isGlobal: { type: Boolean, default: false },
});

const emit = defineEmits(["onChange"]);

const disabled = computed(() => !props.data?.writable);

const accept = ".jpg,.png,.jpeg";
const file = ref("");

watch(
  () => props.data.value,
  (val) => (file.value = val),
  { immediate: true }
);

const UploadDivRef = ref(null);
const CanvasRef = ref(null);

const drawCanvas = (w, h, v, s) => {
  const mw = UploadDivRef.value.clientWidth,
    mh = UploadDivRef.value.clientHeight;
  let width = w,
    height = h;
  if (w != 0) {
    if (width > mw) {
      height = (mw / width) * height;
      width = mw;
    }
    if (height > mh) {
      width = (mh / height) * width;
      height = mh;
    }
  } else {
    width = mw;
    height = mh;
  }
  CanvasRef.value.width = width;
  CanvasRef.value.height = height;

  // 获取canvas上下文
  const ctx = CanvasRef.value.getContext("2d");
  if (s == 0) {
    if (ctx) {
      // 将ImageBitmap绘制到canvas上
      ctx.drawImage(v, 0, 0, width, height);
    }
  } else {
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, width, height);
  }
};

watch(
  () => file.value,
  async (val) => {
    await nextTick();
    if (CanvasRef.value && val) {
      if (val instanceof ImageBitmap) {
        drawCanvas(val.width, val.height, val, 0);
      } else if (typeof val == "string") {
        try {
          new URL(val);
          const img = document.createElement("img");
          img.onload = () => {
            drawCanvas(img.width, img.height, img, 0);
          };
          img.src = val;
        } catch (error) {
          drawCanvas(0, 0, val);
        }
      }
    }
  },
  { immediate: true }
);

const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const httpRequest = (options) => {
  return new Promise(async (reslove) => {
    if (props.data.type == "path") {
      file.value = options.file.name;
    } else if (props.data.type == "imageBitmap") {
      file.value = URL.createObjectURL(options.file);
    }
    if (props.data.accept && props.data.accept.indexOf(".jpg") >= 0) {
      file.value = options.file;
    } else {
      file.value = URL.createObjectURL(options.file);
    }
    if (file.value) {
      let val;
      if (props.isGlobal) {
        val = await readFileAsBase64(options.file);
      } else {
        val = file.value;
      }
      emit("onChange", { key: props.data.key, val });
    }
    reslove(true);
  });
};

const beforeUpload = (rawFile) => {
  if (!["image/jpeg", "image/png"].includes(rawFile.type)) {
    ElMessage.error("只能上传图片");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 200) {
    ElMessage.error("文件最大支持200MB!");
    return false;
  }
  return true;
};

const clearImg = () => {
  file.value = "";
  emit("onChange", { key: props.data.key, val: null });
};
</script>

<style lang="less" scoped>
canvas {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.img-upload-div {
  position: relative;

  .el-icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 24px;
    height: 24px;
    padding: 2px 2px 0 0;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 0 0 0 24px;
    justify-content: flex-end;
    align-items: flex-start;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }
}
</style>
