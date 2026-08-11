/**
 * 数字校验
 * @param {any} value 校验数值
 * @param {number} dec 小数位
 * @param {boolean} positive 是否大于0
 * @returns
 */
export const number = (value, dec = 0, positive = true) => {
  if (positive && (/^0+/.test(value) || /^\+/.test(value)) && value == "0") {
    return "只能输入正数，不能以0或+开头！";
  }
  if (!positive && /^-0+/.test(value) && value != "0") {
    return "只能输入整数，不能以多个0开头！";
  }
  if (!/^[-+]?\d+$/.test(value)) {
    return "只能输入整数！";
  }
  return true;
};

/**
 * 数字校验
 * @param {any} value 校验数值
 * @param {boolean} positive 是否大于0
 * @returns
 */
export const decmial = (value, positive = true) => {
  if (positive && /^\+/.test(value)) {
    return "只能输入小数，不能以+开头！";
  }
  if (!positive && /^-0+/.test(value) && value != "0") {
    return "只能输入小数，不能以多个0开头！";
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return "小数位只能输入两位！";
  }
  return true;
};

/**
 * 数字转换
 * @param {any} val
 * @param {boolean} inter
 * @returns
 */
export const verifyNumber = (val, inter = false) => {
  if (val == undefined || val == "") return "";

  const check = Number(val) < 0;
  if (typeof val == "number") {
    val = val.toString();
  }
  let v = val.replace(/(^\s*)|(\s*$)/g, "");
  v = v.replace(/[^\d.]/g, "");
  v = v.replace(/^0{2}$/g, "");
  v = v.replace(/^\./g, "");
  v = v.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  if (v == "") {
    return 0;
  }
  if (inter) {
    return Number(v);
  }
  if (check) {
    return -Number(v);
  } else {
    return Number(v);
  }
};

export const validateRole = (rule, value, callback) => {
  if (!value || value.toString() === "") {
    callback(new Error("角色必选"));
  } else {
    callback();
  }
};
export const validateCode = (rule, value, callback) => {
  if (!value || value === "") {
    callback(new Error("登录账号必填"));
  } else {
    callback();
  }
};
export const validateName = (rule, value, callback) => {
  if (!value || value === "") {
    callback(new Error("请输入名称"));
  } else {
    callback();
  }
};

/** 密码校验（英文大小写、特殊字符和数字） */
export const validatePwd = (_r, value, callback) => {
  if (!value || value === "") {
    callback(new Error("请输入密码"));
  } else if (value.length < 8) {
    callback(new Error("密码至少8位"));
  } else if (value.length > 16) {
    callback(new Error("密码最多16位"));
  } else {
    if (/[\u4e00-\u9fa5]/.test(value)) {
      callback(new Error("密码不能包含中文"));
    } else {
      let i = 0;
      // 小写英文
      if (/[a-z]/.test(value)) {
        i++;
      }
      // 大写英文
      if (/[A-Z]/.test(value)) {
        i++;
      }
      // 数字
      if (/[0-9]/.test(value)) {
        i++;
      }
      // 特殊字符
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        i++;
      }
      if (i >= 3) {
        callback();
      } else {
        callback(new Error("密码至少包含英文大小写、特殊字符、数字中3种字符"));
      }
    }
  }
};

/** 必填 */
export const required = (_rule, value, callback) => {
  if (value === "" || (value instanceof Array && value.length == 0)) {
    callback(new Error("请输入"));
  } else {
    callback();
  }
};

/** 非中文必填 */
export const requiredNoChinese = (_rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入"));
  } else {
    const reg = /[\u4e00-\u9fa5]/;
    if (reg.test(value)) {
      callback(new Error("不可输入中文"));
    } else {
      callback();
    }
  }
};

/** 数字必填 */
export const requiredNum = (_rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入"));
  } else {
    if (isNaN(value)) {
      callback(new Error("只能输入数字"));
    } else {
      callback();
    }
  }
};
