<!-- 素材 -->
<template>
  <div class="material">
    <div class="material-tag">
      <i
        v-for="item in typeList"
        :class="{ select: nowType == item.value }"
        @click="getTable(item.value)"
        >{{ item.code }}</i
      >
    </div>
    <div style="display: flex; align-items: center">
      <el-input style="margin-right: 2rem" v-model="search" clearable @change="searchFun" />
      <Close class="close" @click.stop="emit('close')" />
    </div>
  </div>
  <el-scrollbar>
    <div class="material-content">
      <div
        v-for="item in list"
        @click.stop="
          emit('callback', { func: ['_FUNCS', 'addModel'], param: FILE_URL + item.modelUrl })
        "
      >
        <div>
          <img :src="FILE_URL + item.thumbnailUrl" />
        </div>
        <div>
          <template v-if="getStrLen(item.name) <= 20">
            {{ item.name }}
          </template>
          <el-tooltip v-else :content="item.name">{{ item.name }}</el-tooltip>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup name="">
import { useStore } from "vuex";
import { dictionarie, material } from "@/api/base";
import { getStrLen } from "@/utils";

const { state } = useStore();

const emit = defineEmits(["close", "callback"]);

const FILE_URL = window.config.fileUrl;
let searchRange = -1;

const allList = [];
const list = reactive([]);
const nowType = ref("");

const getTable = async (type) => {
  search.value = "";
  nowType.value = type;
  allList.length = list.length = 0;
  try {
    const { code, data } = await material.get({ type, range: searchRange });
    if (code == 200 && data && data.records) {
      data.records.forEach((item) => {
        allList.push(item);
        list.push(item);
      });
    }
  } catch (error) {}
};

const searchFun = () => {
  list.length = 0;
  allList.forEach((item) => {
    if (item.name.includes(search.value)) {
      list.push(item);
    }
  });
};

const search = ref("");

const typeList = reactive([]);

const getType = async () => {
  try {
    const { code, data } = await dictionarie.getDictionarie("material");
    if (code == 200 && data && Array.isArray(data)) {
      data.forEach((item) => {
        if (item.value >= 0 || item.value == -3) {
          typeList.push(item);
        }
      });
      typeList.length > 1 && getTable(typeList[0].value);
    }
  } catch (error) {}
};

onMounted(() => {
  searchRange = -1;
  getType();
});
</script>

<style lang="less" scoped>
.material {
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;

  .material-tag {
    flex: 1;

    i {
      display: inline-block;
      height: 28px;
      line-height: 28px;
      border-radius: 2px;
      font-family: AlibabaPuHuiTiR;
      font-size: 14px;
      color: #ffffff;
      font-style: normal;
      cursor: pointer;
      padding: 0 12px;

      &.select,
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      & + i {
        margin-left: 16px;
      }
    }
  }

  :deep(.el-input) {
    width: 150px;
    height: 36px;
    background-color: transparent;
    border-radius: 4px;

    .el-input__wrapper {
      background-color: transparent;
      box-shadow: 0 0 0 1px #646464;

      input {
        font-family: AlibabaPuHuiTiR;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.el-scrollbar {
  width: 100%;
  height: calc(100% - 68px);
}

.material-content {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: calc(100% - 104px);
  margin: 0 auto;

  & > div {
    width: 139px;
    height: 164px;
    cursor: pointer;
    margin: 0 16px;
    margin-bottom: 8px;

    & > div {
      &:nth-child(1) {
        width: 139px;
        height: 104px;
        margin-right: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);

        img {
          max-width: 100%;
          max-height: 100%;
        }
      }

      &:nth-child(2) {
        width: 100%;
        text-align: center;
        font-family: AlibabaPuHuiTiR;
        font-size: 14px;
        color: #ffffff;
        margin: 16px 0 24px;

        :deep(.el-tooltip__trigger) {
          max-width: 100%;
          display: inline-block;
          .overflow-label();
        }
      }
    }
  }
}
</style>