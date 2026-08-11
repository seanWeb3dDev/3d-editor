import * as THREE from "three";
// import { FLOW_LIGHT_TYPE,NONE_EFFECT_TYPE } from "../constant/constant";
import {
    BaseNode,
    MaterialNode,
    LightNode,
    MarkPointNode,
    MarkGroupNode,
    MarkLineNode,
    ShaderNode,
    AnimationNode,
    TextNode,
    ParticleNode,
    HelperLineNode,
    HelperDotNode,
} from ".";
import { DataAgent } from "./agent/DataAgent";
import { LanguageMap } from "../config";
import { checkObjectType,inModelGroup } from "../Util";

const TRIGGER = [
    { label: "鼠标悬浮",value: "mousemove" },
    { label: "单击鼠标",value: "click" },
    { label: "双击鼠标",value: "dblclick" },
    { label: "接收消息",value: "onMessage" },
    { label: "WebSocket数据",value: "socket" },
];
const ACTION = [
    { label: "高亮",value: "outline" },
    { label: "镜头拉近",value: "getClose" },
    { label: "状态修改",value: "stateChange" },
    { label: "向前端发送信息",value: "postMessage" },
    { label: "向其他资源发送信息",value: "windowMessage" }
];
const CHILD_ACTION = [
    { label: "镜头拉近",value: "getClose" },
    { label: "高亮",value: "outline" },
    { label: "属性修改",value: "attributeChange" },
    // { label: "向其他资源发送信息",value: "windowMessage" }
];

const OPERATE = {
    batchOperate: {
        label: '批量操作',
        value: 'batchOperate',
        list: [
            {
                label: '产生阴影',
                value: 'castShadow',
                list: [{
                    label: '开',
                    value: true
                },
                {
                    label: '关',
                    value: false
                }
                ]
            },
            {
                label: '接收阴影',
                value: 'receiveShadow',
                list: [{
                    label: '开',
                    value: true
                },
                {
                    label: '关',
                    value: false
                }
                ]
            }
        ],
        available: ["isGroup","isObject3D"]
    },
    eventPlugin: {
        label: "事件操作",
        value: "eventPlugin",
        list: [
            {
                label: "添加事件",
                value: "addEvent",
                list: [
                    {
                        label: "悬浮高亮",
                        value: "mousemove_outline"
                    },
                    {
                        label: "点击拉近",
                        value: "click_getClose"
                    },
                    {
                        label: "点击发送消息",
                        value: "click_postMessage"
                    },
                    {
                        label: "点位控制状态",
                        value: "socket_stateChange"
                    },
                    {
                        label: "点位控制属性",
                        value: "socket_stateChange_attributeChange"
                    },
                ]
            },
            {
                label: "复制事件",
                value: "copyEvent",
            },
            {
                label: "粘贴事件",
                value: "pasteEvent",
            },
            {
                label: "复制状态",
                value: "copyState",
            },
            {
                label: "粘贴状态",
                value: "pasteState",
            }
        ],
        available: ["isMesh","isGroup","isObject3D"]
    }
};



export class Object3DNode extends BaseNode {

    /**
     * @param {THREE.Object3D} object3d 
     */
    constructor(object3d) {
        super(object3d);
        this.type = "object3dNode";

        // 生成节点时为对象绑定锁定值
        object3d.isLocked = object3d.isLocked ? object3d.isLocked : false;


    }

    /**用于层级展示 */
    toJSON() {

        const object3d = this.object;
        const data = {};

        if (!object3d) return data;

        data.uuid = object3d.uuid;
        data.name = object3d.name;
        data.type = object3d.type;
        data.parent = object3d.parent ? object3d.parent.uuid : null;
        data.visible = object3d.visible;

        data.isLocked = object3d.isLocked;

        const eventList = object3d.userData.eventList;
        const state = object3d.userData.state;

        data.hasEvent = eventList && eventList.length > 0 ? true : false;
        data.hasState = state && Object.keys(state).length > 0 ? true : false;

        data.children = [];

        const t_children = data.children;
        const o_children = object3d.children;

        if (o_children.length) {

            o_children.forEach(oc => {

                if (oc instanceof THREE.Light) {

                    t_children.push(new LightNode(oc).toJSON());

                } else if (oc.isMarkPoint) {
                    t_children.push(new MarkPointNode(oc).toJSON());

                } else if (oc.isMarkGroup) {
                    t_children.push(new MarkGroupNode(oc).toJSON());

                } else if (oc.isMarkLine) {
                    t_children.push(new MarkLineNode(oc).toJSON());

                } else if (oc.isParticle) {
                    t_children.push(new ParticleNode(oc).toJSON());
                } else if (oc.isTwins) {

                } else if (oc.isText) {

                    t_children.push(new TextNode(oc).toJSON());
                } else if (oc.isHelperLine) {

                    t_children.push(new HelperLineNode(oc).toJSON());
                } else if (oc.isHelperDot) {

                    t_children.push(new HelperDotNode(oc).toJSON());
                } else {

                    t_children.push(new Object3DNode(oc).toJSON());

                }

            });

        }
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


        const attribute = {
            uuid: new DataAgent(object3d.uuid,{ writable: false }),
            name: new DataAgent(object3d.name,{ label: "名称" }),
            type: new DataAgent(object3d.type,{ label: "类型",writable: false }),
        };

        // 如果节点为场景
        if (object3d.isScene) {
            return data;
        }

        attribute.position = new DataAgent(object3d.position,{ label: "坐标",inputType: 'vec3' });
        attribute.rotation = new DataAgent(object3d.rotation,{ label: "旋转",inputType: 'vec3_radian' });
        attribute.scale = new DataAgent(object3d.scale,{ label: "缩放倍数",inputType: 'vec3' });

        const geometry = object3d.geometry;
        if (geometry && geometry.toModifyJSON) {

            attribute.geometry = geometry.toModifyJSON();
            attribute.geometry.inputType = 'group';
        }

        attribute.renderOrder = new DataAgent(object3d.renderOrder,{ label: "渲染顺序",inputType: 'number' });
        attribute.visible = new DataAgent(object3d.visible,{ inputType: 'switch',label: "是否可见" });


        if (object3d instanceof THREE.Mesh) {
            attribute.castShadow = new DataAgent(object3d.castShadow,{ inputType: 'switch',label: "产生阴影" });
            attribute.receiveShadow = new DataAgent(object3d.receiveShadow,{ inputType: 'switch',label: "接收阴影" });
        }

        data.attribute = attribute;


        const material = object3d.material;

        if (material) {

            data.material = new MaterialNode(material).toModifyJSON();

        }


        const userData = object3d.userData;

        data.state = userData.state || {}; // 节点的状态数据

        data.eventList = userData.eventList || []; // 节点的事件数据


        const animations = object3d.animations;

        if (animations.length > 0) {

            data.animations = new AnimationNode(object3d).toModifyJSON();
        }

        return data;
    }
    toMaterialList() {
        // 获取该三维对象下的所有材质
        const data = {};

        const object3d = this.object;

        if (!object3d) return data;

        object3d.traverse((child) => {
            const material = child.material;
            if (material) {
                if (Array.isArray(material)) {
                    for (var i = 0,l = material.length; i < l; i++) {
                        const uuid = material[i].uuid;
                        if (data[uuid] === undefined) {
                            data[uuid] = material[i].name;
                        }
                    }
                } else {
                    const uuid = material.uuid;
                    if (data[uuid] === undefined) {
                        data[uuid] = material.name;
                    }
                }
            }
        });

        return data;
    }


    /**用于返回右键可操作功能列表 */
    toOperateList(operate) {
        if (!OPERATE[operate]) return;

        // 判断是否是在模型组里 本operateList列表只针对在模型组的对象使用，如果是在文本组或者其他组的则不支持
        // 比如在辅助线组的点资源和文本组的文本背景也是mesh对象但是无法进行相关操作
        const isModel = inModelGroup(this.object);


        if (!isModel) return;

        const available = OPERATE[operate].available;

        if (checkObjectType(this.object,available)) {

            return [OPERATE[operate]];
        }

        return [];


        // if (this.object.isGroup || this.object.isObject3D && !this.object.isMesh) {

        //     return OPERATE[operate] ? [OPERATE[operate]] : [];

        // }
    }

    toTriggerList() {
        const list = [];
        list.push(...TRIGGER);
        if (this.object.actions) {

            list.push(
                { label: "动画播放",value: "animationPlay" },
            );
        }


        return list;
    }
    toActionList() {
        return ACTION;
    }
    toChildActionList() {
        return CHILD_ACTION;
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
    toAttributeChangeList() {
        // 获取事件的所有相关列表
        const arr = super.toAttributeChangeList();
        const list = [...arr];

        const attrs = [
            { label: "坐标X轴",value: "position_x" },
            { label: "坐标Y轴",value: "position_y" },
            { label: "坐标Z轴",value: "position_z" },
            { label: "缩放X轴",value: "scale_x" },
            { label: "缩放Y轴",value: "scale_y" },
            { label: "缩放Z轴",value: "scale_z" },
        ];
        list.push(...attrs);

        const material = this.object.material;
        if (material) {

            const materialList = new MaterialNode(material).toAttributeChangeList();
            list.push(...materialList);
        }

        return list;
    }

}

