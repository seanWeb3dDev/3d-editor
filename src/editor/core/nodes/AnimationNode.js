import * as THREE from "three";
import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";


export class AnimationNode extends BaseNode {

    constructor(object) {
        super(object);
    }

    toModifyJSON() {

        const animations = this.object.animations;
        const actions = this.object.actions;

        const data = {};

        data.type = 'animations';
        data.value = [];
        animations.forEach((clip) => {
            const action = actions[clip.uuid];
            const obj = {
                uuid: clip.uuid,
                name: clip.name,
                play: action.isRunning()
                // 返还动画运行状态
            };
            data.value.push(obj);
        });



        return data;
    }


}

