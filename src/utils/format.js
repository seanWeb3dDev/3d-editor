Date.prototype.format = "yyyy-MM-dd HH:mm:ss";

/** 鏃堕棿鏍煎紡鍖?*/
Date.prototype.formate = function (fmt) {
  if (!fmt) {
    fmt = Date.prototype.format;
  }
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "D+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "HH+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //瀛ｅ害
    S: this.getMilliseconds(), //millisecond
  };
  if (/(y+)/.test(fmt) || /(Y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substring(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length)
      );
  return fmt;
};

String.prototype.myReplace = function (f, e) {
  //鍚鏇挎崲鎴恊
  var reg = new RegExp(f, "g"); //鍒涘缓姝ｅ垯RegExp瀵硅薄
  return this.replace(reg, e);
};

// 离线版：console.self polyfill（原定义在 log.js 中）
if (!console.self) {
  console.self = function () {};
}
