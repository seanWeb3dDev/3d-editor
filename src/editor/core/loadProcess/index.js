import { LightProcessPlugin } from "./lightProcess";
import { AddObjectCommand } from "../commands";
import { Memory } from "../../library";
import { ShaderProcessPlugin } from './shaderProcess';
import { TextProcessPlugin } from "./textProcess";
import { SceneProcessPlugin } from "./sceneProcess";
import { ShaderMaterialPlugin } from "./shaderMaterialProcess";
import { AttributeProcessPlugin } from "./attributeProcess";
import { ParticleProcessPlugin } from "./particleProcess";
import { GeometryProcessPlugin } from "./geometryProcess";
import { HelperLineProcessPlugin } from "./helperLineProcess";


class ProcessManager {
    constructor(editor) {
        this.pluginCallbacks = [];
        this.editor = editor;
        this.editorEM = editor.editorEM;

        this.register(function (executor) {
            return new LightProcessPlugin(executor);
        });

        this.register(function (executor) {
            return new TextProcessPlugin(executor);
        });
        this.register(function (executor) {
            return new ParticleProcessPlugin(executor);
        });
        this.register(function (executor) {
            return new HelperLineProcessPlugin(executor);
        });

        this.register(function (executor) {
            return new AttributeProcessPlugin(executor);
        });

        this.register(function (executor) {
            return new GeometryProcessPlugin(executor);
        });

        this.register(function (executor) {
            return new ShaderMaterialPlugin(executor);
        });
        this.register(function (executor) {
            return new SceneProcessPlugin(executor);
        });

    }

    /**
 * 
 * @param {Function} pluginCallback 创建插件的回调函数
 * @returns 
 */
    register(pluginCallback) {

        this.pluginCallbacks.push(pluginCallback);

        return this;
    }

    /**
     * 
     * @param {THREE.Scene} scene 
     * @param {String} type 文件格式
     */
    process(scene,type) {

        const executor = new Executor(this.editor);
        const plugins = [];


        for (let i = 0,l = this.pluginCallbacks.length; i < l; i++) {

            const plugin = this.pluginCallbacks[i](executor);

            // 根据scene和name判断当前scene是否需要此插件，该函数非必须

            if (plugin.checkNeed && !plugin.checkNeed(scene,type)) {
                continue;
            }

            plugins.push(plugin);

        }

        executor.setPlugins(plugins);

        executor.execute(scene);

    }

}

class Executor {
    constructor(editor) {
        this.editor = editor;
        this.plugins = [];

        // 特殊模型需要添加进特定group，在plugin的afterProcess中修改该参数
        this.actionAfterProcess = null;
    }

    setPlugins(plugins) {
        this.plugins = plugins;
    }

    execute(scene) {

        this._invokeAll(function (ext) {

            ext.beforeProcess && ext.beforeProcess(scene);

        });

        // scene traverse

        scene.traverse((child) => {

            this._invokeAll(function (ext) {

                ext.process && ext.process(child,scene);

            });

        });

        this._invokeAll(function (ext) {

            ext.afterProcess && ext.afterProcess(scene);

        });

        this.actionAfterProcess ?

            this.actionAfterProcess() :

            this.editor.execute(new AddObjectCommand(this.editor,scene));

    }


    _invokeAll(func) {

        for (let i = 0,il = this.plugins.length; i < il; i++) {

            func(this.plugins[i]);

        }


    }
    setAction(fn) {

        this.actionAfterProcess = fn;

    }


}


export { ProcessManager };