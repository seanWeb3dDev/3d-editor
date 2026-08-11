import { OperatePlugin } from "./OperatePlugin";
import { MaterialPlugin } from "./MaterialPlugin";

import { ParticleBehaviorPlugin } from "./ParticleBehaviorPlugin";


/**
 * 插件函数派发器
 * 用于在编辑器中注册插件，并派发插件函数
 * 考虑到后续插件拓展，为了更好的管理插件功能，编辑器中插件的功能触发采用派发模式
 */

class PluginDispatcher {

    constructor(editor) {
        this.editor = editor;
        this.plugins = new Map();



        this.register(new MaterialPlugin(editor));
        this.register(new OperatePlugin(editor));
        this.register(new ParticleBehaviorPlugin(editor));



    }

    register(plugin) {
        this.plugins.set(plugin.name,plugin);
    }

    getFunc(name,func) {
        const plugin = this.plugins.get(name);
        if (plugin) return plugin[func];
    }

    getPlugin(name) {
        const plugin = this.plugins.get(name);
        if (plugin) return plugin;
    }

    dispatch(name,func,param = []) {

        const plugin = this.plugins.get(name);

        if (plugin) {
            if (plugin[func] instanceof Function) {
                return plugin[func](...param);
            } else {
                return plugin[func];
            }
        }
    }

}

export { PluginDispatcher };