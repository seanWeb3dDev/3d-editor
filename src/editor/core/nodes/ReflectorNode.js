import { BaseNode,MaterialNode } from ".";
import { DataAgent } from "./agent/DataAgent";


export class ReflectorNode extends BaseNode {
    constructor(Reflector) {
        super(Reflector);
        this.type = "reflectorNode";
    }

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

    }
    toModifyJSON() {


        const object3d = this.object;

        const data = {};

        if (!object3d) return data;

        const attribute = {
            uuid: new DataAgent(object3d.uuid,{ writable: false }),
            name: new DataAgent(object3d.name,{ label: "名称" }),
            type: new DataAgent(object3d.type,{ label: "类型",writable: false }),
        };

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

        data.attribute = attribute;

        data.material = new MaterialNode(object3d.material).toModifyJSON();

        const userData = object3d.userData;

        data.state = userData.state || {}; // 节点的状态数据

        data.eventList = userData.eventList || []; // 节点的事件数据

    }

}