import { createStore } from "vuex";
import editor from "./editor";

export default createStore({
  state: {
    ...editor.state,
  },
  mutations: {
    ...editor.mutations,
  },
  actions: {
    ...editor.actions,
  },
});