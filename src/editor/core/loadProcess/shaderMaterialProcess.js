
import * as THREE from "three";
import * as SHADER from "../material";

class ShaderMaterialPlugin {
    constructor(executor) {
        this.executor = executor;
        this.core = executor.core;

        this.shaderMaterials = {};


    }
    beforeProcess(scene) {

        const shaders = scene.userData.shaderMaterials;

        if (shaders) {
            // 镜面材质无法用该种形式处理 
            const uuids = Object.keys(shaders);
            uuids.forEach((id) => {
                const type = shaders[id].shaderType;
                const material = SHADER[type];

                const shader = new material(shaders[id]);
                this.shaderMaterials[id] = shader;
            });

            delete scene.userData.shaderMaterials;
        }

    }

    process(object) {

        const userData = object.userData;

        if (object.isMesh && userData.shaderMaterial) {

            const shader = this.shaderMaterials[userData.shaderMaterial];
            if (shader) {
                object.material = shader;
            } else {
                console.log(userData.shaderMaterial,'材质丢失');
            }


            delete userData.shaderMaterial;

        }

    }


    afterProcess(scene) {

        // todo 把现有材质放入材质管理器中
        // if (Object.keys(this.shaderMaterial).length > 0) {
        //     this.core.shaderMaterial[scene.uuid] = this.shaderMaterial;
        // }
    }

}


export { ShaderMaterialPlugin };