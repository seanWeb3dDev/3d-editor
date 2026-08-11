import * as THREE from "three";
import { BaseNode,ShadowCameraNode } from ".";
import { DataAgent } from "./agent/DataAgent";


const mapSizeOptions = [
    { label: "超高精",value: "[4096,4096]" },
    { label: "高精",value: "[2048,2048]" },
    { label: "普通",value: "[1024,1024]" },
    { label: "高性能",value: "[512,512]" },
];
export class ShadowNode extends BaseNode {

    constructor(object) {
        super(object);
    }

    toModifyJSON() {
        const shadow = this.object;

        if (!shadow) return;

        let data = {};

        data.inputType = 'group';

        data.bias = new DataAgent(shadow.bias,{ label: "偏移" });
        data.blurSamples = new DataAgent(shadow.blurSamples,{ label: "模糊采样" });
        data.normalBias = new DataAgent(shadow.normalBias,{ label: "法线偏移" });
        data.radius = new DataAgent(shadow.radius,{ label: "采样半径" });
        data.mapSize = new DataAgent(`[${shadow.mapSize.x},${shadow.mapSize.y}]`,{ label: "阴影精度",inputType: 'select',options: mapSizeOptions });

        if (shadow.camera instanceof THREE.OrthographicCamera) {
            data.camera = new ShadowCameraNode(shadow.camera).toModifyJSON();

            // const camera = new ShadowCameraNode(shadow.camera).toModifyJSON();

            // data = Object.assign(data,camera);
        }


        return data;
    }

}

