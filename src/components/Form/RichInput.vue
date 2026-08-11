<!-- 富文本编辑 -->
<template>
  <div class="rich-input">
    <el-scrollbar height="100%">
      <div
        class="rich-div"
        ref="RichInputRef"
        contenteditable
        @input="input"
        @focusin="focusin"
        @focusout="isFocus = false"
      >
        <div v-if="!props.needDefault"><br /></div>
      </div>
    </el-scrollbar>
  </div>

  <!-- 选择 -->
  <div class="option-div" :style="{ left: `${optionsPos.l}px`, top: `${optionsPos.t}px` }">
    <div v-for="item in options" @click.stop="addOption(item)">{{ item.key }}</div>
  </div>
</template>

<script setup name="">
import { useStore } from "vuex";

const { state } = useStore();

const props = defineProps({
  data: { type: Object, default: {} },
});
const emit = defineEmits(["onChange"]);

const options = computed(() => state.stateList);
const optionsPos = reactive({ l: -200, t: -200 });

const RichInputRef = ref();

const isFocus = ref(false);

let selection = null,
  range = null;

const input = (e) => {
  controlOption(false);
  if (e.data == "@") {
    selection = window.getSelection();
    if (selection.rangeCount === 0) {
      selection = null;
    } else {
      range = selection.getRangeAt(0);
      if (range.rangeCount !== 0) {
        RichInputRef.value.blur();
        controlOption(true);
      }
    }
    emit("change", false);
  } else {
    selection = null;
    htmlToTxt();
  }
};

const addOption = (obj) => {
  controlOption(false);

  const textNode = range.startContainer;
  range.setStart(textNode, range.endOffset - 1);
  range.setEnd(textNode, range.endOffset);
  range.deleteContents();

  const txtDom = createOptionDom(obj.key);
  range.insertNode(txtDom);
  // 将光标移动到新元素之后
  const newRange = document.createRange();
  newRange.setStartAfter(txtDom);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);

  htmlToTxt();
};

/** 状态标签 */
const createOptionDom = (txt) => {
  if (!txt) return null;

  const element = document.createElement("span");
  element.className = "option-txt";
  element.contentEditable = "false";
  element.innerHTML = txt;
  return element;
};

// 获取光标位置的函数
const getCursorPosition = () => {
  // 确保有选中的范围且范围不为折叠（即是一个光标点）
  if (selection.rangeCount > 0) {
    // 获取第一个范围
    const range = selection.getRangeAt(0);
    // 获取这个范围的边界矩形（通常代表光标的位置）
    const rect = range.getBoundingClientRect();

    // 如果矩形是有效的
    if (rect) {
      // 计算相对于页面左上角的坐标，加上当前的滚动距离
      return {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
      };
    }
  }
  return { x: null, y: null };
};

const controlOption = (show) => {
  if (show) {
    const { x, y } = getCursorPosition();
    optionsPos.l = x || -200;
    optionsPos.t = y || -200;
  } else {
    optionsPos.l = -200;
    optionsPos.t = -200;
  }
};

const focusin = () => {
  isFocus.value = true;
  controlOption(false);
};

/**
 * 检测标识
 * @param {*} n 当前
 * @param {*} a 下一个
 */
const checkSign = (n, a) => {
  // 开头
  if (n == "@" && a == "{") {
    return true;
  }
  // 结尾
  else if (n == "}" && a == "@") {
    return true;
  }
  return false;
};

const txtToHtml = (txt) => {
  const parentDiv = document.createElement("div");
  txt.split("\n").forEach((item) => {
    const div = document.createElement("div");
    let isKey = false,
      keyStr = "";
    for (let i = 0; i < item.length; i++) {
      const txt = item[i];
      if (checkSign(item[i], item[i + 1])) {
        i++;
        if (!isKey) {
          isKey = true;
        } else {
          div.appendChild(createOptionDom(keyStr));
          keyStr = "";
          isKey = false;
        }
      } else {
        if (isKey) {
          keyStr += txt;
        } else {
          div.innerHTML += txt;
        }
      }
    }
    if (div.childNodes.length > 0) {
      parentDiv.appendChild(div);
    }
  });
  if (parentDiv.childNodes.length > 0) {
    RichInputRef.value.innerHTML = parentDiv.innerHTML;
  } else if (props.needDefault) {
  }
};

const msgList = [];
/** 遍历Dom */
const traverseDom = (dom) => {
  if (!dom) return;
  for (let i = 0; i < dom.childNodes.length; i++) {
    const item = dom.childNodes[i];
    if (item.nodeType == Node.TEXT_NODE) {
      if (i > 0) {
        const before = dom.childNodes[i - 1];
        if (
          before.nodeType == Node.ELEMENT_NODE &&
          before.nodeName == "DIV" &&
          msgList[msgList.length - 1].type != "br"
        ) {
          msgList.push({ type: "br" });
        }
      }
      item.textContent && msgList.push({ type: "txt", value: item.textContent });
    } else if (item.nodeType == Node.ELEMENT_NODE) {
      if (item.nodeName == "BR") {
        if (msgList.length > 0 && msgList[msgList.length - 1].type != "br") {
          msgList.push({ type: "br" });
        }
      } else if (item.nodeName == "DIV") {
        if (msgList.length > 0 && msgList[msgList.length - 1].type != "br") {
          msgList.push({ type: "br" });
        }
        traverseDom(item);
      } else if (item.classList.contains("option-txt")) {
        msgList.push({ type: "key", value: item.childNodes[0].textContent });
      } else {
        item.textContent && msgList.push({ type: "txt", value: item.textContent });
      }
    }
  }
};

const htmlToTxt = () => {
  msgList.length = 0;
  traverseDom(RichInputRef.value);
  if (msgList.length > 0 && msgList[msgList.length - 1].type == "br") {
    msgList.splice(msgList.length - 1, 1);
  }
  let res = "",
    showInfo = "";
  msgList.forEach((item) => {
    if (item.type == "txt") {
      res += item.value;
      showInfo += item.value;
    } else if (item.type == "br") {
      res += "\n";
      showInfo += " ";
    } else if (item.type == "key") {
      res += `@{${item.value}}@`;
    }
  });
  emit("onChange", { key: props.data.key, val: res });
};

watch(
  () => props.data.value,
  async (val) => {
    await nextTick();
    msgList.length = 0;
    txtToHtml(val);
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.rich-input {
  width: auto;
  height: 100px;
  border-radius: 3px;
  border: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: "SourceHanSansCN";
  color: #bcc4cb;
  font-size: 14px;
  padding: 10px 10px;
  outline: none;
  line-height: 18px;

  .el-scrollbar {
    width: 100%;
  }

  .rich-div {
    width: 100%;
    min-height: 78px;
    outline: none;
    white-space: pre;
    overflow: hidden;
    text-wrap: auto;

    :deep(.option-txt) {
      color: #56a9ff;

      & + .option-txt {
        margin-left: 2px;
      }
    }
  }
}

.option-div {
  position: fixed;
  background-color: rgba(50, 50, 50, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  z-index: 9;

  & > div {
    background-color: transparent;
    font-family: SourceHanSansCN;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
}
</style>
