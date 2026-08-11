/**
 * 离线版 API stub - 所有后端请求返回空数据
 * 纯前端项目，零后端依赖
 */
const emptyResponse = () => Promise.resolve({ code: 200, data: [], msg: "offline mode" });
const emptyObject = () => Promise.resolve({ code: 200, data: {}, msg: "offline mode" });
const emptyNull = () => Promise.resolve({ code: 200, data: null, msg: "offline mode" });

export const dictionarie = {
  get: emptyResponse,
  save: emptyObject,
  delete: emptyNull,
  getDictionarie: emptyResponse,
};

export const sysLog = {
  get: emptyResponse,
};

export const material = {
  get: emptyResponse,
  getList: emptyResponse,
  save: emptyObject,
  delete: emptyNull,
  getMaterialByType: emptyResponse,
};

export const template = {
  get: emptyResponse,
  save: emptyObject,
  delete: emptyNull,
  getInfoBySign: emptyNull,
};

export const groupApi = {
  get: emptyResponse,
  set: emptyObject,
  delete: emptyNull,
  add: emptyObject,
  export: emptyNull,
};

export const project = {
  info: emptyNull,
  get: emptyResponse,
  save: emptyObject,
  delete: emptyNull,
};

export const editorAxios = {
  save: emptyObject,
  editRelieve: emptyNull,
};

export const frontEnd = {
  get: emptyResponse,
  save: emptyObject,
  delete: emptyNull,
};

export const runnerApi = {
  get: emptyResponse,
  save: emptyObject,
  delete: emptyNull,
};

export const oss = {
  save: emptyObject,
  uploadAGetUrl: async () => "",
  delete: emptyNull,
};