import store from "@/store";
import axios from "axios";

/**
 * Blob转Buffer
 * @param blob  文件二进制流
 * @returns
 */
export const blobToBuffer = (blob) => {
  return new Promise((reslove) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const buffer = reader.result;
      reslove(buffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Blob转Buffer
 * @param blob  文件二进制流
 * @returns
 */
export const blobToFile = (blob) => {
  return new Promise((reslove) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const buffer = reader.result;
      reslove(buffer);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Blob转Text
 * @param blob  文件二进制流
 * @returns
 */
export const blobToText = (blob) => {
  return new Promise((reslove) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const buffer = reader.result;
      reslove(buffer);
    };
    reader.readAsText(blob);
  });
};

export const blobUrlToFile = async (blobUrl, fileName) => {
  const res = await axios.get(blobUrl, { responseType: "blob" });
  if (res.status == 200) {
    const type = res.headers["content-type"];
    switch (type) {
      case "image/jpeg":
        fileName += ".jpg";
        break;
      case "image/png":
        fileName += ".png";
        break;
    }
    const file = new File([res.data], fileName, { type });
    return file;
  }
};

let elementIftrame = null;
/**
 * 下载文件
 * @param url  文件地址
 */
export const downLoad = (url) => {
  if (url) {
    if (elementIftrame) {
      document.body.removeChild(elementIftrame);
    }
    const http = window.config.fileUrl;
    url = http + url;
    elementIftrame = document.createElement("iframe");
    elementIftrame.src = url;
    elementIftrame.style.display = "none";
    document.body.appendChild(elementIftrame);
  }
};

/**
 * 保留小数位
 * @param value 原始值
 * @param digit 小数位数
 * @returns  保留小数位后的值
 */
export const decimalFix = (value, digit) => {
  const res = Math.floor(value * Math.pow(10, digit)) / Math.pow(10, digit);
  return res;
};

export const LIGHT_LIST = [
  { label: "环境光", value: "AmbientLight" },
  { label: "平行光", value: "DirectionalLight" },
  { label: "半球光", value: "HemisphereLight" },
  { label: "点光源", value: "PointLight" },
  { label: "聚光灯", value: "SpotLight" },
];

/** rgb转十六进制 */
export const rgbToHex = (val) => {
  const regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  const match = val.match(regex);
  if (match) {
    const { r, g, b } = {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
    };
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  } else {
    return "";
  }
};

/** 十六进制转rgb */
export const hexToRgb = (hex) => {
  const r = decimalFix(parseInt(hex.slice(1, 3), 16) / 255, 2);
  const g = decimalFix(parseInt(hex.slice(3, 5), 16) / 255, 2);
  const b = decimalFix(parseInt(hex.slice(5, 7), 16) / 255, 2);
  return [r, g, b];
};

/** ImageBitmapToBase64 */
export const imageBitmapToBase64 = (imageBitmap) => {
  // 创建一个canvas元素
  const canvas = document.createElement("canvas");
  let width = imageBitmap.width,
    height = imageBitmap.height;
  if (width > 100) {
    height = (100 / width) * height;
    width = 100;
  }
  canvas.width = width;
  canvas.height = height;

  // 获取canvas上下文
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // 将ImageBitmap绘制到canvas上

    ctx.drawImage(imageBitmap, 0, 0);

    // 将canvas转换成Base64
    return canvas;
  } else {
    return null;
  }
};

/** canvans导出File */
const canvasToBlob = (canvans, name) => {
  return new Promise((reslove) => {
    canvans.toBlob((blob) => {
      if (blob) {
        reslove(new File([blob], name, { type: "image/png" }));
      } else {
        reslove(false);
      }
    });
  });
};

/** ImageBitmapToFile */
export const imageBitmapToFile = async (imageBitmap, name) => {
  // 创建一个canvas元素
  const canvas = document.createElement("canvas");
  let width = imageBitmap.width,
    height = imageBitmap.height;
  if (width > 100) {
    height = (100 / width) * height;
    width = 100;
  }
  canvas.width = width;
  canvas.height = height;

  // 获取canvas上下文
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // 将ImageBitmap绘制到canvas上
    ctx.drawImage(imageBitmap, 0, 0);

    const res = await canvasToBlob(canvas, name);
    if (res) {
      return res;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

/**
 * 获取字符串分隔的数据
 * @param {String} str 分隔的字符串
 * @param {String} separator 分隔符
 * @param {Number} index 获取位数 undefined：数组，-1：最后一位，其他数字：对应位置数据
 * @returns {*} 返回String或Array
 */
export const getStrIndex = (str, separator, index = undefined) => {
  try {
    const arr = str.split(separator);
    let res;
    index ?? (res = arr);
    if (arr.length <= 0) return "";
    if (index == -1 || index > arr.length) {
      res = arr[arr.length - 1];
    } else {
      res = arr[index];
    }
    return res;
  } catch (error) {}
  return "";
};

/**
 * 获取不缓存的文件地址
 * @param {String} url 文件路径
 * @returns
 */
export const getNCacheUrl = (url) => {
  if (!url) return "";
  const rand = Math.random();
  const randUrl = "?u=" + rand.toFixed(3);
  return url + randUrl;
};

/**
 * 分块下载
 * @param {*} url
 * @param {*} fileName
 */
export const downloadAndMergeFiles = async (data, fileName) => {
  const chunkSize = 1024 * 1024; // 1MB
  const totalChunks = Math.ceil(data.size / chunkSize);
  const chunks = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.size);
    const chunk = data.slice(start, end);
    chunks.push(chunk);
  }

  const mergedData = new Blob(chunks);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(mergedData);
  a.download = fileName;
  a.click();
};

/** 数字转中文 */
export const numberToChinese = (num) => {
  if (num < 1 || num > 1000) return num.toString();

  const digit = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const unit = ["", "十", "百", "千"];

  const parts = [];
  const str = num.toString();
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const n = parseInt(str[i]);
    const u = unit[len - i - 1];

    if (n === 0) {
      // 避免重复“零”
      if (parts[parts.length - 1] !== digit[0]) {
        parts.push(digit[0]);
      }
    } else {
      parts.push(digit[n] + u);
    }
  }
  // 清理尾部零
  while (parts[parts.length - 1] === digit[0]) {
    parts.pop();
  }
  // 特例处理：十~十九不需要“一十”
  let result = parts.join("");
  result = result.replace(/一十/, "十");
  result = result.replace(/零+/g, "零"); // 多个零合并
  return result;
};

/** 获取字符长度 */
export const getStrLen = (str) => {
  let len = 0;
  // 中文字符长度
  str.replace(/[\u4e00-\u9fa5]/gi, () => len++);
  return len + str.length;
};

/** 菜单列表 */
export const menuList = [
  {
    menuKey: "main",
    label: "三维可视化编辑器",
  },
  {
    menuKey: "home",
    label: "项目管理",
    parentKey: "main",
    operate: {
      search: false,
      range: 0,
      add: false,
      edit: false,
      delete: false,
      export: false,
      editor: false,
      preview: false,
      history: false,
    },
  },
  {
    menuKey: "material",
    label: "素材管理",
    parentKey: "main",
    operate: {
      search: false,
      range: 0,
      add: false,
      edit: false,
      delete: false,
      export: false,
      preview: false,
    },
  },
  {
    menuKey: "management",
    label: "后台管理",
    parentKey: "main",
  },
  {
    menuKey: "role",
    label: "角色管理",
    parentKey: "management",
    operate: { search: false, range: 0, add: false, edit: false, delete: false, role: false },
  },
  {
    menuKey: "user",
    label: "用户管理",
    parentKey: "management",
    operate: { search: false, range: 0, add: false, edit: false, delete: false },
  },
  {
    menuKey: "dictionary",
    label: "字典管理",
    parentKey: "management",
    operate: { search: false, range: 0, add: false, edit: false, delete: false },
  },
  {
    menuKey: "sysLog",
    label: "系统日志",
    parentKey: "management",
    operate: { search: false },
  },
  {
    menuKey: "template",
    label: "模板管理",
    parentKey: "management",
    operate: { search: false, range: 0, add: false, edit: false, delete: false },
  },
  {
    menuKey: "frontEnd",
    label: "前端模板管理",
    parentKey: "management",
    operate: { search: false, range: 0, add: false, edit: false, delete: false },
  },
  {
    menuKey: "runner",
    label: "运行包管理",
    parentKey: "management",
    operate: { search: false, range: 0, add: false, delete: false },
  },
];

/**
 * 获取模块功能权限
 * @param {*} routeName 路由
 * @param {*} purviews 权限列表
 * @param {*} operateKey 功能标识
 */
export const getMenuPurview = (routeName, purviews, operateKey) => {
  const purview = purviews.find((m) => m.menuKey == routeName);
  return purview.operate[operateKey];
};

/** 防抖执行方法 */
export const debounceImmediateAsync = (func, wait) => {
  let timeout = null;
  let pendingResolve = null;
  let pendingReject = null;
  let isFirstCall = true;
  let lastArgs = null;
  let lastThis = null;

  return (...args) => {
    return new Promise(async (resolve, reject) => {
      lastArgs = args;
      lastThis = this;

      // 清除之前的pending
      if (pendingReject) {
        pendingReject("阻断并清理");
      }

      pendingResolve = resolve;
      pendingReject = reject;

      if (isFirstCall) {
        isFirstCall = false;
        await execute();
        return;
      }

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        await execute();
        isFirstCall = true;
      }, wait * 100);
    });
  };

  async function execute() {
    try {
      const result = await func.apply(lastThis, lastArgs);
      if (pendingResolve) {
        pendingResolve(result);
      }
    } catch (error) {
      if (pendingReject) {
        pendingReject(error);
      }
    } finally {
      pendingResolve = null;
      pendingReject = null;
    }
  }
};

/** 保留4位小数 */
const toDecimal4 = (num) => {
  return Number((Math.round(num * 10000) / 10000).toFixed(4));
};

/** 弧度转角度 */
export const radianToAngle = (radian) => {
  return toDecimal4((radian * 180) / Math.PI);
};

/** 角度转弧度 */
export const angleToRadian = (angle) => {
  return toDecimal4((angle * Math.PI) / 180);
};
