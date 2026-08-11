export default {
  // 拖拽指令的定义
  created: function (el, binding) {
    let odiv = el; // 获取当前元素
    const { value } = binding; //是否进行拖拽 true不进行 false可以拖拽
    if (value) return;
    el.onmousedown = (e) => {
      // 算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft;
      let disY = e.clientY - odiv.offsetTop;
      let left = "";
      let top = "";
      document.onmousemove = (e) => {
        // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        left = e.clientX - disX;
        top = e.clientY - disY;
        // 绑定元素位置到positionX和positionY上面
        // 移动当前元素
        odiv.style.left = left + "px";
        odiv.style.top = top + "px";
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
};
