
import * as THREE from "three";
import { Reflector } from "../Mesh/Reflector";


/**
 * 处理特殊属性的插件
 */
class AttributeProcessPlugin {
    constructor(executor) {
        this.executor = executor;
        this.core = executor.core;

        this.reflectors = [];


    }
    beforeProcess(scene) {


    }

    process(object) {
        const userData = object.userData;

        const specialAttr = userData.specialAttr || {};

        if (object instanceof THREE.Mesh) {

            object.castShadow = specialAttr.castShadow ? true : false;
            object.receiveShadow = specialAttr.receiveShadow ? true : false;
            object.renderOrder = specialAttr.renderOrder === undefined ? 0 : specialAttr.renderOrder;

            const material = object.material;
            material.depthTest = specialAttr.depthTest === undefined ? true : specialAttr.depthTest;
            material.depthWrite = specialAttr.depthWrite === undefined ? true : specialAttr.depthWrite;
        }

        if (specialAttr.isGroup === true) {
            object.isGroup = true;
        }

        if (specialAttr.visible !== undefined) {
            object.visible = specialAttr.visible;
        }

        if (userData.isReflector) {
            this.reflectors.push(object);

        }

    }


    afterProcess(scene) {
        if (this.reflectors.length > 0) {

            const editor = this.executor.editor;

            const options = {
                textureHeight: editor.container.offsetWidth,
                textureWidth: editor.container.offsetHeight,
            };

            this.reflectors.forEach((r) => {
                const mesh = new Reflector(r.geometry,r.material,options);
                const parent = r.parent;
                mesh.children = r.children;
                mesh.userData = r.userData;
                mesh.name = r.name;
                r.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);
                parent.remove(r);
                parent.add(mesh);

            });

        }

    }

}


export { AttributeProcessPlugin };