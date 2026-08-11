import * as THREE from "three";
import { BaseNode,Object3DNode,HelperDotNode } from ".";
import { DataAgent } from "./agent/DataAgent";


const OPERATE = {
    generate: {
        label: '生成',
        value: 'generate',
        list: [
            {
                label: '管道',
                value: 'pipe',
            },
            {
                label: '路径',
                value: 'path',
            },
            {
                label: '箭头',
                value: 'arrow',
            },
            {
                label: '粒子',
                value: 'particle',
            },
        ]
    },
    addChild: {
        label: '添加点',
        value: 'addChild'
    }

};




export class HelperLineNode extends BaseNode {

    /**
     * @param {HelperLine} helperLine
     */
    constructor(line) {
        super(line);
        this.type = "helperLineNode";
        line.isLocked = line.isLocked ? line.isLocked : false;
    }

    toJSON() {

        const data = {};

        const line = this.object;

        data.uuid = line.uuid;
        data.name = line.name;
        data.type = line.type;
        data.parent = line.parent ? line.parent.uuid : null;
        data.visible = line.visible;


        data.children = [];

        const t_children = data.children;

        const dots = line.dotGroup.children;



        if (dots.length) {

            dots.forEach(oc => {
                if (oc.isHelperDot) {
                    t_children.push(new HelperDotNode(oc).toJSON());

                }

            });

        }

        return data;

    }

    toModifyJSON() {


        const line = this.object;

        const data = {};

        if (!line) return data;

        let attribute = {
            uuid: new DataAgent(line.uuid,{ writable: false }),
            name: new DataAgent(line.name,{ label: "名称" }),
        };


        attribute.position = new DataAgent(line.position,{ label: "坐标",inputType: "vec3" });
        attribute.rotation = new DataAgent(line.rotation,{ label: "旋转",inputType: "vec3" });
        attribute.scale = new DataAgent(line.scale,{ label: "缩放倍数",inputType: 'vec3' });
        attribute.visible = new DataAgent(line.visible,{ inputType: 'switch',label: "是否可见" });


        data.attribute = attribute;





        return data;
    }

    toOperateList(operate) {

        return OPERATE[operate] ? [OPERATE[operate]] : [];


    }
}

