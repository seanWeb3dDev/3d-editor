import * as THREE from "three";
import { BaseNode,ShadowNode } from ".";
import { DataAgent } from "./agent/DataAgent";
import { getColorString } from "../Util";




const OPERATE = {
    generate: {
        label: '快速创建',
        value: 'generate',
        list: [
            {
                label: '直线光',
                value: 'DirectionalLight',
                list: [
                    {
                        label: '高精',
                        value: 'high'
                    },
                    {
                        label: '标准',
                        value: 'medium'

                    },
                    {
                        label: '小场景',
                        value: 'room'
                    },
                ]
            },
            {
                label: '聚光灯',
                value: 'SpotLight',
                list: [
                    {
                        label: '范围光',
                        value: 'normal'
                    },
                    {
                        label: '射灯',
                        value: 'spot'
                    },
                ]
            },

        ]
    },


};

export class LightNode extends BaseNode {

    /**
     * @param {THREE.Light} light 
     */
    constructor(light) {
        super(light);
        this.type = "lightNode";
    }

    toJSON() {

        const data = {};

        const light = this.object;

        // data.id = light.id
        data.uuid = light.uuid;
        data.name = light.name;
        data.type = light.type;
        data.parent = light.parent ? light.parent.uuid : null;
        data.visible = light.visible;

        return data;

    }

    toModifyJSON() {
        const data = {};

        /** @type {THREE.Light} */
        const light = this.object;

        let attribute = {
            uuid: new DataAgent(light.uuid,{ writable: false }),
            name: new DataAgent(light.name,{ label: "名称" }),
            type: new DataAgent(light.type,{ label: "类型",writable: false }),
            intensity: new DataAgent(light.intensity,{ label: "强度" }),
            color: new DataAgent(getColorString(light.color),{ label: "颜色",inputType: 'color' }),
            visible: new DataAgent(light.visible,{ label: "是否可见",inputType: 'switch' }),
            position: new DataAgent(light.position,{ label: "坐标",inputType: 'vec3' }),
            rotation: new DataAgent(light.rotation,{ label: "旋转",inputType: 'vec3_radian' })
        };


        data.attribute = attribute;

        const type = light.type;


        switch (type) {
            case "DirectionalLight":
                {
                    attribute.castShadow = new DataAgent(light.castShadow,{ label: "产生阴影",inputType: 'switch' });
                    attribute.shadow = new ShadowNode(light.shadow).toModifyJSON();

                }
                break;
            case "AmbientLight":
                break;
            case "SpotLight":
                {
                    attribute.distance = new DataAgent(light.distance,{ label: '距离',inputType: 'number' });
                    attribute.penumbra = new DataAgent(light.penumbra,{ label: '半影衰减',inputType: 'slider_input',range: [0,1] });
                    attribute.angle = new DataAgent(light.angle,{ label: '角度',inputType: 'radian' });
                    attribute.decay = new DataAgent(light.decay,{ label: '衰减',inputType: 'number' });
                    attribute.castShadow = new DataAgent(light.castShadow,{ label: "产生阴影",inputType: 'switch' });
                    attribute.target = new DataAgent(light.target.position,{ label: '朝向',inputType: 'vec3' });


                    attribute.shadow = new ShadowNode(light.shadow).toModifyJSON();




                }
                break;
            case "PointLight":
                {
                    attribute.distance = new DataAgent(light.distance,{ label: '距离',inputType: 'number' });
                    attribute.decay = new DataAgent(light.decay,{ label: '衰减',inputType: 'number' });
                    attribute.castShadow = new DataAgent(light.castShadow,{ label: "产生阴影",inputType: 'switch' });
                    attribute.shadow = new ShadowNode(light.shadow).toModifyJSON();


                }
                break;
            case "HemisphereLight":

                break;
            default:
                break;
        }
        return data;
    }

    toOperateList(operate) {

        return OPERATE[operate] ? [OPERATE[operate]] : [];


    }

}