import directive from "./directives";
/** 自定义指令 */
export const Directives = (app) => {
  Object.keys(directive).forEach((key) => app.directive(key, directive[key]));
};
