import * as THREE from "three";
import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";


const valueOptions = [
    { label: '恒定值',value: "ConstantValue" },
    { label: '区间值',value: "IntervalValue" },
];
const colorOptions = [
    { label: '固定颜色',value: "ConstantColor" },
    { label: '随机颜色',value: "RandomColor" },
];
const shapeOptions = [
    { label: '网格',value: "grid",constructor: 'GridEmitter' },
    { label: '锥形',value: "cone",constructor: 'ConeEmitter' },
    { label: '圆形',value: "circle",constructor: 'CircleEmitter' },
    { label: '环形',value: "donut",constructor: 'DonutEmitter' },
    { label: '球形',value: "sphere",constructor: 'SphereEmitter' },
    { label: '点',value: "point",constructor: 'PointEmitter' },
];

const TRIGGER = [


    { label: "接收消息",value: "onMessage" },
    { label: "WebSocket数据",value: "socket" },
];
const ACTION = [

    { label: "状态修改",value: "stateChange" },
    { label: "向前端发送信息",value: "postMessage" },
    { label: "向其他资源发送信息",value: "windowMessage" }
];

const CHILD_ACTION = [
    // { label: "镜头拉近",value: "getClose" },
    // { label: "高亮",value: "outline" },
    { label: "属性修改",value: "attributeChange" },
    // { label: "向其他资源发送信息",value: "windowMessage" }
];

const renderModeOptions = [
    // { label: '精灵图',value: 0 },
    { label: '几何体',value: 2 },
    // { label: '路径',value: 3 },
];
const rotationOptions = [
    { label: '随机旋转',value: 'RandomQuatGenerator' },
    { label: '初始方向',value: 'ConstantValue' },
];
export class ParticleNode extends BaseNode {

    /**
     * @param {Particle} particle 
     */
    constructor(particle) {
        super(particle);
        this.type = "particleNode";
    }

    toJSON() {

        const data = {};

        const particle = this.object;

        data.uuid = particle.uuid;
        data.name = particle.name;
        data.type = particle.type;
        data.parent = particle.parent ? particle.parent.uuid : null;

        const eventList = particle.userData.eventList;
        const state = particle.userData.state;

        data.hasEvent = eventList && eventList.length > 0 ? true : false;
        data.hasState = state && Object.keys(state).length > 0 ? true : false;

        data.children = [];


        return data;

    }

    toModifyJSON() {


        const particle = this.object;

        const data = {};

        if (!particle) return data;
        const userData = particle.userData;


        data.state = userData.state || {}; // 节点的状态数据

        data.eventList = userData.eventList || []; // 节点的事件数据



        let attribute = {
            uuid: new DataAgent(particle.uuid,{ writable: false }),
            name: new DataAgent(particle.name,{ label: "名称" }),
            type: new DataAgent(particle.type,{ label: "类型",writable: false }),
        };

        attribute.position = new DataAgent(particle.position,{ label: "坐标",inputType: "vec3" });
        attribute.rotation = new DataAgent(particle.rotation,{ label: "旋转",inputType: "vec3_radian" });
        attribute.scale = new DataAgent(particle.scale,{ label: "缩放倍数",inputType: "vec3" });

        attribute.visible = new DataAgent(particle.visible,{ inputType: 'switch',label: "是否可见" });

        // 共有属性

        const particleSetting = {};
        particleSetting.inputType = 'group';

        particleSetting.duration = new DataAgent(particle.duration,{ label: "特效时长",inputType: "select_input" });
        particleSetting.looping = new DataAgent(particle.looping,{ label: "是否循环",inputType: "switch" });
        particleSetting.startLife = new DataAgent(particle.startLife.value,{ label: "生命周期",inputType: "vec2" });

        particleSetting.startSize = new DataAgent(particle.startSize.value,{ label: "起始尺寸",inputType: "vec2" });
        particleSetting.startSpeed = new DataAgent(particle.startSpeed.value,{ label: "起始速度",inputType: "vec2" });

        const color = particle.startColor;
        const startColor = {
            label: '起始颜色',
            inputType: 'relate',
        };
        if (color.type === "RandomColor") {
            startColor.type = new DataAgent(color.type,{ label: "类型",inputType: "select",options: colorOptions });
            startColor.a = new DataAgent(color.value[0],{ label: "颜色A",inputType: "vec3" });
            startColor.b = new DataAgent(color.value[1],{ label: "颜色B",inputType: "vec3" });
        }
        if (color.type === "ConstantColor") {
            startColor.type = new DataAgent(color.type,{ label: "类型",inputType: "select",options: colorOptions });
            startColor.a = new DataAgent(color.value,{ label: "颜色",inputType: "vec3" });
        }
        particleSetting.startColor = startColor;

        // 起始旋转
        const rotation = particle.startRotation;
        particleSetting.startRotation = new DataAgent(rotation.type,{ label: "起始角度",inputType: "select",options: rotationOptions });


        particleSetting.emissionOverTime = new DataAgent(particle.emissionOverTime.value,{ label: "粒子数量",inputType: "input" });
        particleSetting.renderMode = new DataAgent(particle.renderMode,{ label: "渲染模式",inputType: "select",options: renderModeOptions });
        particleSetting.renderOrder = new DataAgent(particle._renderOrder,{ label: "渲染顺序",inputType: "input" });
        particleSetting.model = new DataAgent(particle.uuid,{ label: "粒子实例",inputType: "particle" });

        // 发射器shape
        const shape = particle.shape;
        const emitterShape = {
            label: '形状',
            inputType: 'relate'
        };


        particleSetting.emitterShape = emitterShape;
        // console.log(particle);

        if (shape.type === 'grid') {
            emitterShape.type = new DataAgent(shape.type,{ label: "类型",inputType: "select",options: shapeOptions });
            emitterShape.width = new DataAgent(shape.width,{ label: "宽度",inputType: "input" });
            emitterShape.height = new DataAgent(shape.height,{ label: "高度",inputType: "input" });
            emitterShape.row = new DataAgent(shape.row,{ label: "横列",inputType: "input" });
            emitterShape.column = new DataAgent(shape.column,{ label: "纵列",inputType: "input" });

        }
        if (shape.type === 'cone') {
            emitterShape.type = new DataAgent(shape.type,{ label: "类型",inputType: "select",options: shapeOptions });
            emitterShape.angle = new DataAgent(shape.angle,{ label: "锥体张角",inputType: "radian" });
            emitterShape.arc = new DataAgent(shape.arc,{ label: "锥底角度",inputType: "radian" });
            emitterShape.radius = new DataAgent(shape.radius,{ label: "半径",inputType: "input" });
            emitterShape.thickness = new DataAgent(shape.thickness,{ label: "厚度",inputType: "input" });
        }
        if (shape.type === 'circle') {
            emitterShape.type = new DataAgent(shape.type,{ label: "类型",inputType: "select",options: shapeOptions });
            emitterShape.arc = new DataAgent(shape.arc,{ label: "角度",inputType: "radian" });
            emitterShape.radius = new DataAgent(shape.radius,{ label: "半径",inputType: "input" });
            emitterShape.thickness = new DataAgent(shape.thickness,{ label: "厚度",inputType: "input" });
        }
        if (shape.type === 'donut') {
            emitterShape.type = new DataAgent(shape.type,{ label: "类型",inputType: "select",options: shapeOptions });
            emitterShape.arc = new DataAgent(shape.arc,{ label: "角度",inputType: "radian" });
            emitterShape.radius = new DataAgent(shape.radius,{ label: "外圈半径",inputType: "input" });
            emitterShape.donutRadius = new DataAgent(shape.donutRadius,{ label: "内圈半径",inputType: "input" });
            emitterShape.thickness = new DataAgent(shape.thickness,{ label: "厚度",inputType: "input" });
        }
        if (shape.type === 'sphere') {
            emitterShape.type = new DataAgent(shape.type,{ label: "类型",inputType: "select",options: shapeOptions });
            emitterShape.arc = new DataAgent(shape.arc,{ label: "角度",inputType: "radian" });
            emitterShape.radius = new DataAgent(shape.radius,{ label: "外圈半径",inputType: "input" });
            emitterShape.thickness = new DataAgent(shape.thickness,{ label: "厚度",inputType: "input" });
        }
        if (shape.type === 'point') {
            emitterShape.type = new DataAgent(shape.type,{ label: "类型",inputType: "select",options: shapeOptions });

        }


        // 行为 behave
        const behaviorSetting = {
            inputType: 'group'
        };

        particleSetting.behaviors = behaviorSetting;

        const behaviors = particle.behaviors;

        if (behaviors && behaviors.length > 0) {
            let name = '';
            behaviors.forEach((behave,index) => {

                const setting = {
                    label: `行为${index + 1}`,
                    inputType: "relate"
                };
                switch (behave.type) {
                    case "ApplyForce":
                        name = `behavior${index}`;
                        behaviorSetting[name] = setting;
                        setting.type = new DataAgent("方向力",{ label: "类型",writable: false });
                        setting.magnitude = new DataAgent(behave.magnitude.value,{ label: "力度",inputType: "input" });
                        setting.direction = new DataAgent(behave.direction,{ label: "方向",inputType: "vec3" });
                        break;
                    case "Noise":
                        name = `behavior${index}`;
                        behaviorSetting[name] = setting;
                        setting.type = new DataAgent("随机行为",{ label: "类型",writable: false });
                        setting.frequency = new DataAgent(behave.frequency,{ label: "频率",inputType: "vec2" });
                        setting.power = new DataAgent(behave.power,{ label: "力度",inputType: "vec2" });
                        setting.positionAmount = new DataAgent(behave.positionAmount,{ label: "位移量",inputType: "vec2" });
                        setting.rotationAmount = new DataAgent(behave.rotationAmount,{ label: "旋转量",inputType: 'slider_input',range: [0,1] });

                        break;
                    case "GravityForce":
                        name = `behavior${index}`;
                        behaviorSetting[name] = setting;
                        setting.type = new DataAgent("引力",{ label: "类型",writable: false });
                        setting.magnitude = new DataAgent(behave.magnitude,{ label: "力度",inputType: "input" });
                        setting.center = new DataAgent(behave.center,{ label: "中心点",inputType: "vec3" });
                        break;
                    case "Rotation3DOverLife":
                        name = `behavior${index}`;
                        behaviorSetting[name] = setting;
                        setting.type = new DataAgent("旋转",{ label: "类型",writable: false });

                        setting.angularVelocity_angle = new DataAgent(behave.angularVelocity.angle,{ label: "角度",inputType: "vec2_radian" });
                        setting.angularVelocity_axis = new DataAgent(behave.angularVelocity.axis,{ label: "旋转轴",inputType: "vec3" });
                        break;

                }
            });
        }

        attribute.particleSetting = particleSetting;
        data.attribute = attribute;

        // data.state = userData.state || {};

        // data.eventList = userData.eventList || [];



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
        // 获取事件的所有相关列表

        const list = [];

        const attrs = [
            { label: "坐标X轴",value: "position_x" },
            { label: "坐标Y轴",value: "position_y" },
            { label: "坐标Z轴",value: "position_z" },
        ];
        list.push(...attrs);


        return list;
    }


}