import * as THREE from "three";
import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";


const EXAMPLE = {
    fresnel: {
        type: 'fresnel',
        strength: 2.5
    },
    brighten: {
        type: 'brighten',
        strength: 2.5
    },
    water1: {
        type: 'water1',

    }
};

const map = {
    strength: {
        label: '强度',
        inputType: 'input'
    },
    uColor: {
        label: '颜色',
        inputType: 'color'
    }
};

export class ShaderNode extends BaseNode {

    constructor(object) {
        super(object);
    }

    toModifyJSON() {

        const shader = this.object;


        let data = {};

        if (!shader) return data;

        data.type = new DataAgent(shader.type,{ label: '类型' });

        const keys = Object.keys(shader.uniforms);
        keys.forEach((key) => {
            data[key] = this.createDataAgent(key,shader.uniforms[key]);
        });

        return data;
    }
    createDataAgent(key,obj) {

        const value = obj.value;

        const data = new DataAgent(value,map[key]);

        return data;
    }


}

