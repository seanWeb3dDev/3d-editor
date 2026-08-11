export default {
  state: {
    baseInfo: {
      id: 1,
      name: "离线编辑器",
      templateName: "",
    },
    selectedTopNav: [],
    pointConfig: [],
    uuid: "",
    stateList: [],
    viewControl: "translate",
    pointList: [],
    configList: [],
    chartletList: [],
    particleList: [],
  },
  mutations: {
    setBaseInfo(state, val) {
      state.baseInfo = val;
    },
    setBaseInfoByKey(state, { key, val }) {
      state.baseInfo[key] = val;
    },
    setNav(state, val) {
      if (state.selectedTopNav.includes(val)) {
        state.selectedTopNav = state.selectedTopNav.filter((item) => item != val);
      } else {
        state.selectedTopNav.push(val);
      }
    },
    removeNav(state, val) {
      if (state.selectedTopNav.includes(val)) {
        state.selectedTopNav = state.selectedTopNav.filter((item) => item != val);
      }
    },
    setUuid(state, val) {
      val != state.uuid && (state.uuid = val);
    },
    setStateList(state, val) {
      state.stateList = val;
    },
    pushStateList(state, obj) {
      state.stateList.push({ ...obj });
    },
    setStateListByKey(state, { key, type, value }) {
      const index = state.stateList.findIndex((m) => m.key == key);
      if (index >= 0) {
        state.stateList[index].type = type;
        state.stateList[index].value = value;
      }
    },
    deleteStateListByIndex(state, index) {
      state.stateList.splice(index, 1);
    },
    clearStateList(state) {
      state.stateList = [];
    },
    setViewControl(state, val) {
      state.viewControl = val;
    },
    setPointList(state, val) {
      state.pointList = val;
    },
    setPointListValueByCode(state, { code, code1, val, sign, hasTemplate, needEdit }) {
      if (hasTemplate) {
        let index = -1;
        let keys = ["", ""];
        if (sign == 0) {
          index = state.pointList.findIndex((m) => m.field0 == code);
          keys = ["field0", "code"];
        } else {
          index = state.pointList.findIndex((m) => m.field3 == code1);
          keys = ["field3", "code1"];
        }
        if (index >= 0) {
          state.pointList[index][keys[0]] = val;
          state.pointList[index][keys[1]] = val;

          const oldObj = state.pointList[index];
          if (sign == 3) {
            if (val == "") {
              state.pointList[index].realCode = oldObj.code;
            } else {
              state.pointList[index].realCode = val;
            }
          } else {
            needEdit && (state.pointList[index].realCode = val);
          }
        }
      } else {
        const index = state.pointList.findIndex((m) => m.field0 == code);
        if (index >= 0) {
          state.pointList[index].code = val;
        }
      }
    },
    pushPointList(state, obj) {
      state.pointList.push({ ...obj, code: obj.field0 });
    },
    clearPointList(state) {
      state.pointList = [];
    },
    setConfigListValueByCode(state, { index, obj }) {
      state.configList[index] = obj;
    },
    pushConfigList(state, obj) {
      if (!state.configList.some((m) => m.key == obj.key)) {
        state.configList.push({ ...obj });
      }
    },
    deleteConfigList(state, key) {
      const index = state.configList.findIndex((m) => m.key == key);
      if (index >= 0) {
        state.configList.splice(index, 1);
      }
    },
    clearConfigList(state) {
      state.configList = [];
    },
    setChartlet(state, val) {
      state.chartletList = val;
    },
    setParticle(state, val) {
      state.particleList = val;
    },
  },
  actions: {},
};