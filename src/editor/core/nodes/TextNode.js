import * as THREE from "three";
import { BaseNode,Object3DNode } from ".";
import { DataAgent } from "./agent/DataAgent";

import { Text } from 'troika-three-text';
import { getColorString } from "../Util";


const fontMap = {
    '黑体': "./font/heiti_regular.otf",
    "./font/heiti_regular.otf": "黑体",

};
const fontOptions = [
    { label: '黑体',value: "./font/heiti_regular.otf" },
    { label: '南笙体',value: "./font/HuXiaoBoNanShenTi-2.otf" },
];
const TRIGGER = [

    { label: "接收消息",value: "onMessage" },
    { label: "WebSocket数据",value: "socket" },
    // { label: "视野距离",value: "distance" }

];
const ACTION = [
    // { label: "高亮",value: "outline" },
    // { label: "镜头拉近",value: "getClose" },
    { label: "发送前端数据",value: "postMessage" },
    { label: "状态修改",value: "stateChange" },
];
const CHILD_ACTION = [
    // { label: "镜头拉近",value: "getClose" },
    // { label: "高亮",value: "outline" },
    { label: "属性修改",value: "attributeChange" },
];
export class TextNode extends BaseNode {

    /**
     * @param {Text} text 
     */
    constructor(text) {
        super(text);
        this.type = "textNode";
        text.isLocked = text.isLocked ? text.isLocked : false;
    }

    toJSON() {

        const data = {};

        const text = this.object;

        data.uuid = text.uuid;
        data.name = text.name;
        data.type = text.type;
        data.parent = text.parent ? text.parent.uuid : null;

        const eventList = this.object.userData.eventList;
        const state = this.object.userData.state;

        data.hasEvent = eventList && eventList.length > 0 ? true : false;
        data.hasState = state && Object.keys(state).length > 0 ? true : false;

        data.isLocked = text.isLocked;
        data.visible = text.visible;

        data.children = [];

        const t_children = data.children;
        const o_children = text.children;


        if (o_children.length) {

            o_children.forEach(oc => {

                if (oc.isText) {

                    t_children.push(new TextNode(oc).toJSON());

                } else {

                    t_children.push(new Object3DNode(oc).toJSON());

                }

            });

        }

        return data;

    }

    toModifyJSON() {


        const text = this.object;

        const data = {};

        if (!text) return data;
        const userData = text.userData;

        const material = text.material;

        let attribute = {
            uuid: new DataAgent(text.uuid,{ writable: false }),
            name: new DataAgent(text.name,{ label: "名称" }),
            type: new DataAgent(text.type,{ label: "类型",writable: false }),
        };

        attribute.position = new DataAgent(text.position,{ label: "坐标",inputType: "vec3" });
        attribute.rotation = new DataAgent(text.rotation,{ label: "旋转",inputType: "vec3_radian" });
        attribute.scale = new DataAgent(text.scale,{ label: "缩放倍数",inputType: "vec3" });

        attribute.visible = new DataAgent(text.visible,{ inputType: 'switch',label: "是否可见" });


        const textSetting = {};

        textSetting.inputType = "group";

        attribute.textSetting = textSetting;

        textSetting.preText = new DataAgent(text.preText,{ label: "内容",inputType: 'richInput' });
        textSetting.font = new DataAgent(text.font,{ label: "字体",inputType: 'select',options: fontOptions });
        textSetting.fontSize = new DataAgent(text.fontSize,{ label: "字号",inputType: 'number' });
        textSetting.letterSpacing = new DataAgent(text.letterSpacing,{ label: "字距",inputType: 'number' });
        // textSetting.overflowWrap = new DataAgent(text.overflowWrap,{ label: "换行",writable: false });
        textSetting.color = new DataAgent(getColorString(text.color),{ label: "颜色",inputType: "color" });
        textSetting.maxWidth = new DataAgent(text.maxWidth,{ label: "宽度",inputType: 'number' });
        textSetting.outlineWidth = new DataAgent(text.outlineWidth,{ label: "描边",inputType: 'number' });
        textSetting.outlineColor = new DataAgent(getColorString(text.outlineColor),{ label: "描边颜色",inputType: "color" });
        textSetting.outlineBlur = new DataAgent(text.outlineBlur,{ label: "描边模糊",inputType: 'number' });
        textSetting.lineHeight = new DataAgent(text.lineHeight,{ label: "行高",inputType: 'number' });







        data.attribute = attribute;

        data.state = userData.state || {};

        data.eventList = userData.eventList || [];






        return data;
    }

    toTriggerList() {
        return TRIGGER;
    }
    toActionList() {
        return ACTION;
    }
    toChildActionList() {
        return CHILD_ACTION;
    }

    toAttributeChangeList() {
        const arr = super.toAttributeChangeList();
        const list = [...arr];

        const attrs = [
            { label: "颜色",value: "color" },
        ];
        list.push(...attrs);

        return list;
    }

    toEventData() {
        const obj = {
            trigger: this.toTriggerList(),
            action: this.toActionList(),
            childAction: this.toChildActionList(),
            attribute: this.toAttributeChangeList()
        };

        return obj;
    }
}