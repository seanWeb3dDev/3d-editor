import axios from "axios";
import router from "../router/index";
import { ElMessage } from "element-plus";

export class pubHttp {
  constructor() {
    this.timeoutTip = false;
  }
  getInsideConfig() {
    let baseURL;
    baseURL = window.config.apiUrl;
    const config = {
      baseURL,
      timeout: 60000, //超时时长
      withDirectives: true, //携带cookie
    };
    return config;
  }
  interceptors(instance) {
    instance.interceptors.request.use(
      (config) => {
        if (config.headers.Authorization == "" || config.headers.Authorization == undefined) {
          config.headers.Authorization = localStorage.getItem("TP_token");
        }
        return config;
      },
      (error) => {
        throw new Error(error);
      }
    );
    // 响应拦截
    instance.interceptors.response.use(
      (res) => {
        this.timeoutTip = false;
        let { data } = res;
        if (["/group/export", "/project/download/"].some((m) => res.config.url.indexOf(m) >= 0)) {
          return res;
        } else {
          // 失败提示
          if (data.code == 403) {
            localStorage.setItem("TP_token", "");
            ElMessage.info("登录超时");
            router.push({ name: "login" });
          }
          if (data?.code != 200 && res.config.url.indexOf("http") < 0) {
            ElMessage.info(data?.msg);
          }
          return res.data;
        }
      },
      (error) => {
        let { response } = error;
        if (response && response.data && response.data.code == 403) {
          if (!this.timeoutTip) {
            this.timeoutTip = true;
            localStorage.setItem("TP_token", "");
            ElMessage.info("登录超时");
            router.push({ name: "login" });
          }
        }
        throw new Error(error);
      }
    );
  }
  request(options) {
    const instance = axios.create();
    options = Object.assign(this.getInsideConfig(), options);
    this.interceptors(instance);
    return instance(options);
  }
}

const http = new pubHttp();

export default http;
