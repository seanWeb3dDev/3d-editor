import { GLTFLightExtraExtension } from "./Light";
import { GLTFTextMeshExtension } from "./Text";
import { GLTFShaderMaterialExtension } from "./MaterialManager";
import * as THREE from "three";
import { GLTFParticleExtension } from "./Particle";


/**
 * input处理插件 用于迁移模型最外层group的数据，
 * 如userData position rotation scale等等
 */

class GLTFInputProcessExtension {
    constructor(writer) {

        this.writer = writer;
        this.name = 'BL_userData_extension';
        this.userData = null;

        this.position = new THREE.Vector3(0,0,0);
        this.scale = new THREE.Vector3(1,1,1);
        this.rotation = new THREE.Euler(0,0,0);

        this.name = null;

        this.isNewGroup = false;


    }
    beforeParse(input) {



        const originScene = input[0];

        originScene.userData.exportFromEditor = true; // 模型标识，表示该glb是从编辑器导出

        this.name = originScene.name;

        // input为长度为1的数组,input[0]为将要导出的模型group


        if (originScene.children.length === 0) {
            //进入该条件时说明originScene不是一个group，因此position,scale,rotation保留在原有的object3D上即可
            // 此时exporter会重新创建一个新的scene用来存放该object

            // this.userData = originScene.userData; // v1.2.1版本
            this.userData = {
                exportFromEditor: true,
            }; // 在V1.2.2版本中发现该值如果使用originScene.userData时会同时继承一些没有必要的属性到scene中


            this.isNewGroup = true;



        }

        if (originScene.children.length > 0) {

            //进入该条件说明originScene是一个group

            //记录该group的基础属性 比如位置 旋转 放大信息
            const p = originScene.position;
            const r = originScene.rotation;
            const s = originScene.scale;

            this.position = this.position.equals(p) ? null : p.clone();
            this.scale = this.scale.equals(s) ? null : s.clone();
            this.rotation = this.rotation.equals(r) ? null : r.clone();

            // 保存该group的userData
            this.userData = originScene.userData;

            // 将input替换成input.children
            const children = originScene.children;

            input.pop(); // 删除input[0]

            children.forEach((child) => {
                input.push(child);
            });

        }



    }
    afterParse(input) {
        const scene = this.writer.json.scenes[0];

        if (this.isNewGroup) {

            const obj = {};
            for (let key in this.userData) {
                if (["state","eventList"].includes(key)) continue;

                obj[key] = this.userData[key];
            }

            scene.extras = obj;

            this.isNewGroup = false;
        } else {


            scene.extras = JSON.parse(JSON.stringify(this.userData));
        }





        const obj = {};
        this.position ? obj.position = this.position : null;
        this.scale ? obj.scale = this.scale : null;
        this.rotation ? obj.rotation = this.rotation : null;

        if (Object.keys(obj).length > 0) {
            scene.extras.originAttr = obj;
        }

        scene.name = this.name;
    }
}
/**
 * 用于处理一些object3D上无法携带的属性，比如castShadow和receiveShadow
 */
class GLTFAttributeExtension {
    constructor(writer) {

        this.writer = writer;
        this.name = 'BL_attribute_extension';

    }

    // writeNode阶段无法往userData中添加参数 需要修改nodeDef.extras
    writeNode(input,nodeDef) {
        const userData = input.userData = input.userData || {};
        const specialAttr = {};


        specialAttr.visible = input.visible;


        if (input instanceof THREE.Group) {
            specialAttr.isGroup = true;
        }

        if (input instanceof THREE.Mesh) {
            specialAttr.castShadow = input.castShadow;
            specialAttr.receiveShadow = input.receiveShadow;

            input.renderOrder !== 0 ? specialAttr.renderOrder = input.renderOrder : null;

            const material = input.material;
            specialAttr.depthTest = material.depthTest;
            specialAttr.depthWrite = material.depthWrite;
            specialAttr.side = material.side;

            if (input.isReflector) {
                // 在特殊属性插件记录反射体
                userData.isReflector = true;
            }
        } else {
            // input不是mesh
            if (input.children.length > 0
                || !input.isLight
                || !input.isSprite
                || !input.isText
            ) {
                specialAttr.isGroup = true;
            }
        }

        if (Object.keys(specialAttr).length > 0) {

            userData.specialAttr = specialAttr;
            nodeDef.extras = JSON.parse(JSON.stringify(userData));
        }

    }
    afterParse(input) {


    }
}



export { GLTFLightExtraExtension,GLTFTextMeshExtension,GLTFInputProcessExtension,GLTFShaderMaterialExtension,GLTFAttributeExtension,GLTFParticleExtension };