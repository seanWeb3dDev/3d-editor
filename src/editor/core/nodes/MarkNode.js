import * as THREE from "three";
import { BaseNode,MaterialNode,Object3DNode } from ".";
import { DataAgent } from "./agent/DataAgent";
import { LanguageMap } from "../config";

export class MarkPointNode extends BaseNode {


    /**
 * @param {THREE.Object3D} object3d 
 */
    constructor(object3d) {
        super(object3d);
    }


    /**用于层级展示 */
    toJSON() {

        const object3d = this.object;
        const data = {};

        if (!object3d) return data;

        data.uuid = object3d.uuid;
        data.name = object3d.name;
        data.type = object3d.type;


        const material = object3d.material;

        if (material) {
            data.material = new MaterialNode(material).toJSON();
        }

        return data;

    }

    /**用于可修改属性展示 */
    toModifyJSON() {

        const object3d = this.object;

        const data = {};

        if (!object3d) return data;

        data.uuid = new DataAgent(object3d.uuid,{ writable: false });
        data.name = new DataAgent(object3d.name);
        data.type = new DataAgent(object3d.type,{ writable: false });


        // 模型对象,组
        data.position = new DataAgent(object3d.position,{ label: "坐标" });
        data.rotation = new DataAgent(object3d.rotation,{ label: "旋转" });
        data.scale = new DataAgent(object3d.scale,{ label: "缩放倍数" });

        data.visible = new DataAgent(object3d.visible,{ label: "可见" });



        const material = object3d.material;

        if (material) {
            data.material = new MaterialNode(material).toModifyJSON();
        }

        return data;
    }
}

export class MarkGroupNode extends BaseNode {

}

export class MarkLineNode extends BaseNode {

}