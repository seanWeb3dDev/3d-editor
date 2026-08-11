<!-- 无预览文件 -->
<template>
  <div class="input-button">
    <div class="input-div" :title="String(field.value)">
      {{ field.value }}
    </div>
    <div class="progress" :class="uploadClass(field.progress)">
      {{ uploadText(field.progress) }}
    </div>
    <el-upload
      action="#"
      :http-request="
        (options) => {
          httpRequest(options, field);
        }
      "
      :show-file-list="false"
      :before-upload="beforeUpload"
      :accept="accept"
    >
      <template #trigger v-if="!field.disabled">
        <i class="select-file"></i>
      </template>
    </el-upload>
  </div>
</template>

<script setup name="">
const props = defineProps({ data: { type: Object, default: {} } });

const emit = defineEmits(["onChange"]);

const accept = [".jpg"];

const file = computed({ get: () => props.data.value, set: () => {} });

const uploadClass = (progr = undefined) => {
  if (!progr) {
    return "";
  } else if (progr === -1) {
    return "error";
  } else if (progr < 100) {
    return "loading";
  } else if (progr == 100) {
    return "success";
  }
};

const uploadText = (progr = undefined) => {
  if (progr && progr >= 0 && progr < 100) {
    return `${Math.floor(progr)}%`;
  } else {
    return "";
  }
};

const httpRequest = (options) => {
  return new Promise(async (reslove) => {
    if (props.data.type == "path") {
      file.value = options.file.name;
    } else if (props.data.type == "imageBitmap") {
      file.value = URL.createObjectURL(options.file);
    }
    if (accept && accept.indexOf(".jpg") >= 0) {
      file.value = options.file;
    } else {
      file.value = URL.createObjectURL(options.file);
    }
    if (file.value) {
      callback({ key: props.data.key, value: file.value });
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
</script>

<style lang="less" scoped></style>
