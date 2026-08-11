import CryptoJS from "crypto-js";

/**
 * 深拷贝
 */
export function deepCopy(target) {
  if (typeof target === "object") {
    const result = Array.isArray(target) ? [] : {};
    for (const key in target) {
      if (typeof target[key] === "object" && target[key]) {
        result[key] = deepCopy(target[key]);
      } else {
        result[key] = target[key];
      }
    }
    return result;
  }
  return target;
}

// 时间戳转年月日时分秒
export const timeCompute = (time) => {
  const date = new Date(time * 1000);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes(); // 获取分钟
  let seconds = date.getSeconds(); // 获取秒

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
};

//下载
export const download = (url) => {
  const a = document.createElement("a");
  a.style.display = "none";
  let serverIp, serverPort;
  if (process.env.NODE_ENV == "production") {
    const arr = window.location.host.split(":");
    serverIp = arr[0];
    serverPort = arr[1];
  } else {
    serverIp = "172.23.60.21";
    serverPort = "50000";
  }
  const href = `http://${serverIp}:${serverPort}`;
  a.href = href + url;
  const arr = url.split("/");
  const name = arr[arr.length - 1];
  a.setAttribute("download", name);
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
};

// 验证IP
export const validateIP = (rule, value, callback) => {
  if (!value || value === null || value === "") {
    callback(new Error("IP不能为空"));
  } else {
    if (
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        value
      )
    ) {
      callback();
    } else {
      callback(new Error("IP格式不正确"));
    }
  }
};

/** 获取字符串长度 */
export const getStrLen = (str) => {
  if (str == undefined || str == "") return 0;

  const chineseRegex = /[\u4e00-\u9fa5]/g;
  const chineseCount = (str.match(chineseRegex) || []).length;
  return str.length + chineseCount;
};

//加密方法
export function encrypt(word) {
  const key = "0102030405060708";
  const iv = "0102030405060708";
  var keyArray = CryptoJS.enc.Utf8.parse(key);
  var ivArray = CryptoJS.enc.Utf8.parse(iv);
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, keyArray, {
    iv: ivArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
}
