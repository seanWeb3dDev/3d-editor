<!-- 宫格详情 -->
<template>
  <div
    class="info-item"
    :class="{
      'no-img': props.data.thumbnailUrl == '' || props.data.thumbnailUrl == null,
    }"
    @mouseover="mouseover"
    @mouseout="mouseout"
  >
    <img
      v-if="props.data.thumbnailUrl"
      :src="fileUrl(props.data.thumbnailUrl)"
      alt=""
      style="max-width: 100%; max-height: 100%"
    />
    <div class="infos-div" :class="{ infoShow }" v-if="props.data.sign !== undefined">
      <el-scrollbar>
        <div v-for="item in showInfo" class="info-div">
          <span class="label">{{ item.label }}</span>
          <span class="value">{{ item.value }}</span>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup name="">
const props = defineProps({
  /** 数据 */
  data: { type: Object, default: {} },
  /** 模板列表 */
  templateList: { type: Array, default: () => [] },
});

const infoShow = ref(false);

const infoObj = {
  project: [
    { label: "创建人", key: "createdBy" },
    { label: "修改人", key: "modifiedBy" },
    {
      label: "修改时间",
      key: "modifiedDate",
      transition: (v) => new Date(v).formate("YYYY-MM-DD HH:mm:ss"),
    },
    { label: "项目标识", key: "key" },
    {
      label: "使用模板",
      key: "template",
      transition: (v) => props.templateList.find((m) => m.sign == v)?.name || "",
    },
  ],
  material: [
    { label: "创建人", key: "createdBy" },
    { label: "修改人", key: "modifiedBy" },
    {
      label: "修改时间",
      key: "modifiedDate",
      transition: (v) => new Date(v).formate("YYYY-MM-DD HH:mm:ss"),
    },
  ],
};

const showInfo = computed(() => {
  let _infoObj = [];
  const _data = props.data;
  switch (_data.sign) {
    case 0:
      _infoObj = infoObj.project;
      break;
    case 1:
      _infoObj = infoObj.material;
      break;
  }
  const res = [];
  _infoObj.forEach((item) => {
    const { label, key, transition } = item;
    if (_data[key] !== undefined && _data[key] !== "") {
      let v = _data[key];
      if (transition != undefined) {
        v = transition(_data[key]);
      }
      res.push({ label, value: v });
    }
  });
  return res;
});

const file_url = window.config.fileUrl;

const fileUrl = (url) => {
  if (file_url) {
    const rand = Math.random();
    const randUrl = "?u=" + rand.toFixed(3);
    const res = file_url + url + randUrl;
    return res;
  } else {
    return "";
  }
};

const mouseover = () => (infoShow.value = true);

const mouseout = () => (infoShow.value = false);
</script>

<style lang="less" scoped>
.info-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;

  & > div {
    pointer-events: none;
  }

  &.no-img {
    background-image: url("^/no-img.png");
    background-size: 140px 134px;
    background-repeat: no-repeat;
    background-position: center center;
  }

  img {
    max-width: 100%;
    max-height: 100%;
  }

  .infos-div {
    width: 100%;
    height: 100%;
    position: absolute;
    top: -100%;
    transition: top 0.5s ease;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 15px 16px;

    &.infoShow {
      top: 0;
    }

    .el-scrollbar {
      width: 100%;
      height: 100%;

      :deep(.el-scrollbar__view) {
        flex-direction: column;
        color: #fff;
        gap: 12px !important;

        .info-div {
          font-size: 14px;

          .label {
            font-family: AlibabaPuHuiTiR;
            color: rgba(255, 255, 255, 0.8);
            display: inline-block;
            width: 70px;
          }

          .value {
            font-family: AlibabaPuHuiTiM;
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
