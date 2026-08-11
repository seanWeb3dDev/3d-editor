
import * as THREE from "three";
import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";

export class ShadowCameraNode extends BaseNode {

    constructor(object) {
        super(object);
    }

    toModifyJSON() {

        /**@type {THREE.OrthographicCamera} */
        const camera = this.object;

        const data = {};

        data.inputType = 'group';

        data.left = new DataAgent(camera.left,{ label: '阴影左距',inputType: 'number' });
        data.right = new DataAgent(camera.right,{ label: '阴影右距',inputType: 'number' });
        data.top = new DataAgent(camera.top,{ label: '阴影上距',inputType: 'number' });
        data.bottom = new DataAgent(camera.bottom,{ label: '阴影下距',inputType: 'number' });
        data.near = new DataAgent(camera.near,{ label: '近视距离',inputType: 'number' });
        data.far = new DataAgent(camera.far,{ label: '远视距离',inputType: 'number' });

        return data;
    }
}