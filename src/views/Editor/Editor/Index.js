import { ElMessage,ElMessageBox } from "element-plus";
import MapClass from "./map";
import { radianToAngle } from "@/utils/common";
import { deepCopy } from "@/utils/index";
import { loadSceneFromIDB, loadBlobFromIDB } from "@/utils/idb";
import bus from "@/utils/bus";

class Editor extends MapClass {
  constructor(id,dom,{ jsonUrl,template }) {
    super(dom);

    bus.on("update_bom",this.updateBom.bind(this));
    bus.on("update_editor_config",this.updateEditorConfig.bind(this));

    this.fileUrl = window.config.fileUrl;

    this.id = id;
    this.jsonUrl = jsonUrl;
    this.oldPath = { projectConfig: "",modelFile: [],pointJson: "" };
    this.modelCount = 0;
    this.loadingCount = 0;
    this.template = template;
    this.editor._template = template;

    this.pointInfo = {};
    this.needload = 0;
    this.loaded = 0;

    this.dirSend = false;

    this.saveType = -1;
    this.renderImgConfig = null;
  }
  /** 初始化回调方法 */
  initFun({
    loadInfo,
    getAddConfig,
    saveInfo,
    selectObj,
    deleteInfo,
    dataCallback,
    schedule,
    updateView,
    updateRenderInfo,
  }) {
    this.loadInfo = loadInfo;
    this.getAddConfig = getAddConfig;
    this.selectObj = selectObj;
    this.deleteInfo = deleteInfo;
    this.saveInfo = saveInfo;
    this.dataCallback = dataCallback;
    this.schedule = schedule;

    /**
     * 三维二次确认框
     * @param {*} tip 提示信息
     * @param {*} success 确认回调方法
     * @param {*} error 取消回调
     * @param {*} successPar 成功参数
     * @param {*} errorPar 失败参数
     */
    const tipFun = (tip,success,error,successPar,errorPar) => {
      ElMessageBox.confirm(tip,"提示",{
        distinguishCancelAndClose: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(async () => {
          success && success(successPar);
        })
        .catch((err) => {
          error && error(errorPar,err);
        });
    };

    this.editor.register({
      /** 保存配置 */
      fileConfig: this.fileConfig.bind(this),
      /** 保存文件 */
      fileBuffer: this.fileBuffer.bind(this),
      modelData: (obj,index) => {
        console.self(["modelData",obj,index]);
        this.loadInfo && this.loadInfo(this.handelTreeData([obj]),obj.parent,index);
      },
      selected: (params) => {
        this.selected(params);
      },
      delete: (uuid) => {
        console.self([uuid]);
        this.deleteInfo && this.deleteInfo(uuid);
      },
      loadProgress: (state) => {
        switch (state) {
          case "loading":
            this.needload += 1;
            break;
          case "loaded":
            this.loaded += 1;
            break;
        }
        if (this.needload === this.loaded) {
          this.needload = this.loaded = 0;
          this.schedule(false);
        } else {
          this.schedule(true,`模型加载中${this.loaded + 1}/${this.needload}`,0,false,true);
        }
      },
      updateView: (obj) => {
        console.self(["updateView",obj]);
        updateView && updateView(obj);
      },
      updateRenderInfo: (obj) => {
        updateRenderInfo && updateRenderInfo(obj);
      },
      // 更新场景数据
      updateSceneData: (data) => bus.emit("update-scene-data",data),
      // 更新节点 visible 属性（左侧树和右侧面板）
      updateVisible: (data) => bus.emit("update-visible",data),
      tipFun: tipFun,
    });

    this.onloaded();

    this.initConfig();
  }
  /** 从 IndexedDB 恢复场景，无数据则空场景 */
  async initConfig(load = true) {
    if (!load) return;
    try {
      const saved = await loadSceneFromIDB();
      if (saved && saved.config && Object.keys(saved.config).length > 0) {
        const config = saved.config;
        // 恢复背景图/环境贴图 Blob
        await this.restoreBlob(config, "background", "background");
        await this.restoreBlob(config, "environment", "environment");
        this.renderImgConfig = config.renderImgConfig || null;
        console.self("从 IndexedDB 恢复场景", config, saved.files.length + " 个模型");
        this.editor._FUNCS.init(config, []);
        // 加载模型文件（复用拖拽加载链路）
        if (saved.files.length > 0) {
          this.schedule && this.schedule(true, "模型加载中 0/" + saved.files.length, 0, false, true);
          this.modelCount = saved.files.length;
          this.editor.loader.loadFiles(saved.files);
        }
      } else {
        // 首次打开：空场景
        this.editor._FUNCS.init({}, []);
      }
    } catch (error) {
      console.error("initConfig from IDB error", error);
      this.editor._FUNCS.init({}, []);
    }
  }
  /** 从 IndexedDB 恢复 Blob 引用为 ObjectURL */
  async restoreBlob(config, key, idbKey) {
    const val = config[key];
    if (val && typeof val === "string" && val.startsWith("idb://")) {
      try {
        const blob = await loadBlobFromIDB(idbKey);
        if (blob) {
          config[key] = URL.createObjectURL(blob);
        }
      } catch (e) {
        console.warn("restoreBlob failed for", key, e);
      }
    }
  }
  /** 加载完成，获取树结构 */
  onloaded() {
    this.getAddConfig && this.getAddConfig(this.editor._AddObjectList);
    const obj = this._FUNCS.getSceneData();
    console.self([obj]);
    const data = [];
    if (obj && obj.uuid) {
      data.push({ uuid: obj.uuid,sign: 2 });
      obj.children?.forEach((item) => {
        data.push({
          uuid: item.uuid,
          sign:
            item.name === "灯光组"
              ? 0
              : item.name === "文本组"
                ? 1
                : item.name === "粒子组"
                  ? 3
                  : 4, // 4：辅助线组
          ...item,
        });
      });
    }
    this.loadInfo && this.loadInfo(data);
  }
  /** 处理树 */
  handelTreeData(arr) {
    const res = [];
    if (arr && arr.length > 0) {
      arr.forEach((item) => {
        const obj = {
          key: item.uuid,
          label: item.name || item.type || item.uuid,
          isLocked: item.isLocked,
          visible: item.visible,
          hasEvent: item.hasEvent,
        };
        if (item.children && item.children.length > 0) {
          obj.children = this.handelTreeData(item.children);
        }
        res.push(obj);
      });
      return res;
    } else {
      return undefined;
    }
  }
  selected(params) {
    console.self(["selected",params]);
    let uuid = "";
    const obj = {
      attribute: undefined,
      material: undefined,
      animations: undefined,
      state: undefined,
      event: undefined,
    };
    if (params) {
      if (params.attribute) {
        uuid = params.attribute.uuid.value;
        obj.attribute = this.handelData(params.attribute,"attribute");
        if (params.material) {
          obj.material = this.handelData(params.material,"material");
        }
        if (params.animations) {
          obj.animations = (params.animations?.value || []).map((item) => {
            item.inputType = "animations";
            item.label = item.name;
            return item;
          });
        }
        if (obj.material && obj.material.length > 0 && params.shader) {
          obj.shader = this.handelData(params.shader,"shader");
        }
        if (params.state) {
          const stateObj = params.state;
          obj.state = Object.keys(stateObj).map((key) => {
            const _obj = { key,type: stateObj[key].type,value: stateObj[key].value };
            return _obj;
          });
        }
        if (params.eventList !== undefined) {
          obj.event = deepCopy(params.eventList);
        }
      } else if (params.material) {
        uuid = params.material.uuid.value;
        obj.material = this.handelData(params.material,"material");
      }
    }
    if (this.selectObj) {
      this.selectObj(obj,uuid);
    }
    this.dirSend = false;
  }
  handelData(objP,parentKey = "") {
    if (objP === undefined) return [];
    const arr = [];
    Object.keys(objP).forEach((key) => {
      const obj = objP[key];
      if (typeof obj !== "object") return;

      if (parentKey) {
        obj.key = parentKey + "_";
      }
      if (obj.key) {
        obj.key += key;
      } else {
        obj.key = key;
      }
      if (obj.inputType === "group") {
        arr.push(...this.handelData(obj,obj.key));
        return;
      } else if (obj.inputType === "relate") {
        obj.children = this.handelData(obj,obj.key);
      } else if (
        ["font","fontSize","letterSpacing"].includes(key) &&
        Object.keys(objP).length > 3
      ) {
        let check = obj.children === undefined || obj.children.length <= 0;
        check = check && objP.font !== undefined;
        check = check && objP.fontSize !== undefined;
        check = check && objP.letterSpacing !== undefined;

        if (check) {
          if (arr.some((m) => m.inputType === "fontGroup")) return;

          obj.inputType = "fontGroup";
          obj.children = this.handelData(
            { font: objP.font,fontSize: objP.fontSize,letterSpacing: objP.letterSpacing },
            parentKey
          );
        }
      }
      if (!obj.label) {
        obj.label = key;
      }
      if (obj.inputType === "vec3_radian" || obj.inputType === "vec2_radian") {
        obj.value = obj.value.map((item) => radianToAngle(item));
      } else if (obj.inputType === "radian") {
        obj.value = radianToAngle(obj.value);
      }
      if (typeof obj.value === "number") {
        obj.value = Number(obj.value.toFixed(4));
      } else if (obj.value instanceof Array) {
        obj.value = obj.value.map((item) => {
          try {
            return Number(item.toFixed(4));
          } catch (error) {
            return item;
          }
        });
      }
      arr.push(obj);
    });
    return arr;
  }
  updateBom(key,value) {
    this[key] = value;
  }
  updateEditorConfig({ key,val }) {
    this[key] = val;
  }
}

export default Editor;
