<!--  -->
<template>
  <div class="left-menu" :class="className">
    <el-scrollbar>
      <div
        v-for="(item, index) in menuList"
        :class="{ selected: nowMenu == index }"
        @click="selectMenu(item, index)"
      >
        <i :class="item.url"></i>
        <span>{{ item.name }}</span>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup name="LeftMenuComponents">
const props = defineProps({
  type: {
    type: Number,
    default: 0,
  },
  menuList: {
    type: Array,
    default: [],
  },
});
const emit = defineEmits(["callback"]);

const nowMenu = ref(0);

const className = computed(() => {
  if (props.type == 0) {
    return "home";
  } else {
    return "management";
  }
});

const selectMenu = (obj, i) => {
  if (nowMenu.value != i) {
    emit("callback", obj);
    nowMenu.value = i;
  }
};

const setNowMenu = (i) => {
  nowMenu.value = i;
};

defineExpose({ setNowMenu });
</script>
