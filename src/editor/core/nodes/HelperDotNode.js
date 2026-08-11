import * as THREE from "three";
import { BaseNode,Object3DNode } from ".";
import { DataAgent } from "./agent/DataAgent";



const OPERATE = {

    addChild: {
        label: '插入点',
        value: 'addChild'
    }

};


export class HelperDotNode extends BaseNode {
    /**
 * @param {HelperDot} helperDot
 */
    constructor(dot) {
        super(dot);
        this.type = "helperDotNode";
    }
    toJSON() {

        const data = {};

        const dot = this.object;

        data.uuid = dot.uuid;
        data.name = dot.name;
        data.type = dot.type;
        data.parent = dot.parent.parent.uuid;

        data.children = [];


        return data;

    }
    toModifyJSON() {


        const dot = this.object;

        const data = {};

        if (!dot) return data;

        let attribute = {
            uuid: new DataAgent(dot.uuid,{ writable: false }),
            name: new DataAgent(dot.name,{ label: "名称" }),
        };

        attribute.position = new DataAgent(dot.position,{ label: "坐标",inputType: "vec3" });

        data.attribute = attribute;


        return data;
    }

    toOperateList(operate) {

        return OPERATE[operate] ? [OPERATE[operate]] : [];


    }

}