import * as THREE from "three";
import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";

export class UserDataNode extends BaseNode {

    /**
     * @param {{}} userData
     */
    constructor(userData) {
        super(userData);
        this.type = 'userDataNode';

    }

    toJSON() {
        const userData = this.object;


        return userData;
    }

    //todo 节点可修改项，包含状态state和事件eventList
    // 带动画的模型本身userData包含某些数据
    //后续等事件绑定功能完善后再补充
    toModifyJSON() {
        const userData = this.object;

        //eventList
        //state
        //shader

        return userData;
    }
}
