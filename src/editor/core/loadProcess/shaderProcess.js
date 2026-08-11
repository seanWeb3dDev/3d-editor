import * as THREE from "three";

import { shaderModify } from "../shader";

import { editorEM } from "../EventRegister";

/** 着色器json解析规则
 * 该规则用于编辑器内添加着色器，渲染器加载模型时解析着色器，以及解析器加载模型时解析着色器
 * 如果发现该规则需要修改，需要同时修改渲染器和解析器两处的文件
 */
editorEM.shaderProcess.add(shaderProcess);


function shaderProcess(object,setting) {

    const userData = object.userData;

    const uniforms = {};
    const data = {
        type: "",
        setting: setting, // 保存原始数据，用于还原
        uniforms: uniforms
    };

    Reflect.ownKeys(setting).forEach((key) => {

        switch (key) {
            case 'type':
                data.type = setting[key];
                break;
            case 'color':
                uniforms.uColor = { value: new THREE.Color(setting[key]) };
                break;
            default:
                uniforms[key] = {
                    value: setting[key]
                };
                break;
        }

    });
    // 用于保证着色器被修改时每次都可重新编译
    object.material.needsUpdate = true;
    object.material.customProgramCacheKey = () => {
        return data['type'];
    };


    object.material.onBeforeCompile = shader => {

        shaderModify(shader,data['type'],uniforms);


    };

    userData['shader'] = data; // 数据存入userData，用于保存uniforms
}

class ShaderProcessPlugin {

    constructor(executor) {

        this.executor = executor;

    }

    process(object) {

        const userData = object.userData;

        if (!userData['shader']) return;

        const setting = userData['shader'].setting;

        shaderProcess(object,setting);

    }
}


export { ShaderProcessPlugin };