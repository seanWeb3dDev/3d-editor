

import { PathPointList } from "@/editor/library/path/PathPointList";
import * as THREE from "three";
import { DataAgent } from "../nodes/agent/DataAgent";
import { PathGeometry } from "@/editor/library/path/PathGeometry";


export class ArrowPathGeometry extends PathGeometry {

    constructor(points = [],arrow = false,side = "right",width = 1,cornerRadius = 0.2,cornerSplit = 8,up = [0,1,0]) {
        const list = [];
        points.forEach((item) => {
            const vec3 = new THREE.Vector3(...item);
            list.push(vec3);
        });
        const pointList = new PathPointList();
        pointList.set(list,cornerRadius,cornerSplit,new THREE.Vector3(...up),false);


        super({
            pathPointList: pointList,
            options: {
                width: width,
                arrow: arrow,
                side: side,
            }
        });

        this.parameters = {
            points: points,
            arrow: arrow,
            side: side,
            width: width,
            cornerRadius: cornerRadius,
            cornerSplit: cornerSplit,
            up: up
        };


    }

    toModifyJSON() {
        const param = this.parameters;
        const data = {};
        data.width = new DataAgent(param.width,{ label: "宽度",inputType: 'number' });
        data.cornerRadius = new DataAgent(param.cornerRadius,{ label: "拐角半径",inputType: 'number' });
        data.cornerSplit = new DataAgent(param.cornerSplit,{ label: "拐角分段",inputType: 'number' });
        data.up = new DataAgent(param.up,{ label: "up",inputType: 'vec3' });
        return data;
    }
    toParam() {
        const param = this.parameters;

        return {
            type: "ArrowPathGeometry",
            param: [
                param.points,
                param.arrow,
                param.side,
                param.width,
                param.cornerRadius,
                param.cornerSplit,
                [...param.up]
            ]
        };
    }
}
