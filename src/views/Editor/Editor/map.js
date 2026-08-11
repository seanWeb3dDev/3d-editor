import { editorInit } from "@/editor/main";
import { saveSceneToIDB, saveConfigToIDB, clearSceneFromIDB, saveBlobToIDB } from "@/utils/idb";
import { ElMessage } from "element-plus";
import { deepCopy } from "@/utils/index";
import bus from "@/utils/bus";

class Map {
  constructor(dom) {
    this.editor = editorInit(dom);
    this._FUNCS = this.editor._FUNCS;
    this._pluginDispatch = this.editor._FUNCS._pluginDispatch;
    this.saving = false;
    bus.on("use_map_function", this.useMapFunc.bind(this));
    bus.on("get_map_config_info", this.getMapConfigInfo.bind(this));
  }
  useMapFunc({ func: _func, param, callback }) {
    console.self(_func, param);
    let res;
    if (param !== undefined) {
      const _param =
        typeof param === "object" && param !== null && !Array.isArray(param)
          ? deepCopy(param)
          : param;
      res = this.func(_func, _param);
    } else {
      res = this.func(_func);
    }
    callback && callback(res);
  }
  func(_func, param) {
    if (_func.length > 1) {
      if (_func.includes("_pluginDispatch")) {
        return this._pluginDispatch(_func[1], _func[2], param);
      } else if (_func.includes("_FUNCS")) {
        if (_func[1] === "select") {
          this.dirSend = true;
        }
        const res = this._FUNCS[_func[1]](param);
        return res;
      }
    } else {
      return this.editor[_func](param);
    }
  }
  /**
   * 获取配置信息
   */
  getMapConfigInfo(callback) {
    const tree = this._FUNCS.getGlobalSetting();
    console.self("GlobalSetting", tree);
    callback && callback({ global: this.handelData(tree, "global"), render: this.renderImgConfig });
  }
  /**
   * 获取全局配置
   */
  getGlobalSetting() {
    const tree = this._FUNCS.getGlobalSetting();
    if (tree.pathTracer != undefined) {
      delete tree.pathTracer;
    }
    console.self("全局配置", tree);
    return this.handelData(tree, "global");
  }
  /**
   * 保存
   * @param type（0：保存场景，5：保存配置）
   */
  save(type, pointInfo) {
    if (this.saving) return;
    this.saving = true;
    this.saveType = type;
    this.pointInfo = pointInfo;
    try {
      this._FUNCS.save(type === 5 ? "config" : "scene");
    } catch (error) {
      console.error("save error", error);
      this.saving = false;
    }
  }
  /** 将 blob URL 转存为 IndexedDB Blob */
  async persistBlob(config, key, idbKey) {
    const val = config[key];
    if (val && typeof val === "string" && val.startsWith("blob:")) {
      try {
        const resp = await fetch(val);
        const blob = await resp.blob();
        await saveBlobToIDB(idbKey, blob);
        config[key] = "idb://" + idbKey;
      } catch (e) {
        console.warn("persistBlob failed for", key, e);
      }
    }
  }
  /** 保存配置到 IndexedDB */
  async fileConfig(config) {
    console.self("fileConfig", config);
    try {
      this.schedule && this.schedule(true, "配置保存中...", 0, false, true);
      // 持久化背景图/环境贴图 Blob
      await this.persistBlob(config, "background", "background");
      await this.persistBlob(config, "environment", "environment");
      await saveConfigToIDB(config);
      ElMessage.success("配置保存成功");
    } catch (e) {
      console.error("fileConfig error", e);
      ElMessage.error("配置保存失败");
    }
    this.schedule && this.schedule(false);
    this.saving = false;
  }
  /** 保存场景（GLB + 配置）到 IndexedDB */
  async fileBuffer(files, config) {
    console.self(["fileBuffer", files, config]);
    try {
      const names = Object.keys(files);
      this.schedule && this.schedule(true, "场景保存中 0/" + names.length, 0, false, true);
      // 持久化背景图/环境贴图 Blob
      await this.persistBlob(config, "background", "background");
      await this.persistBlob(config, "environment", "environment");
      // 写入 IndexedDB
      await saveSceneToIDB(files, config);
      ElMessage.success("场景保存成功");
    } catch (e) {
      console.error("fileBuffer error", e);
      ElMessage.error("场景保存失败");
    }
    this.schedule && this.schedule(false);
    this.saving = false;
  }
}

export default Map;
