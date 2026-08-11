

import { PathPointList } from "@/editor/library/path/PathPointList";
import { PathTubeGeometry } from "@/editor/library/path/PathTubeGeometry";
import * as THREE from "three";
import { DataAgent } from "../nodes/agent/DataAgent";

export class PipeGeometry extends PathTubeGeometry {

    constructor(points = [],radius = 0.1,radialSegments = 16,cornerRadius = 0.2,cornerSplit = 8,up = [0,0,1]) {
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
                radius: radius, // default is 0.1
                radialSegments: radialSegments, // default is 8
                startRad: Math.PI / 2
            },
            usage: THREE.StaticDrawUsage,
        });

        this.parameters = {
            points: points,
            radius: radius,
            radialSegments: radialSegments,
            cornerRadius: cornerRadius,
            cornerSplit: cornerSplit,
            up: up
        };


    }

    toModifyJSON() {
        const param = this.parameters;
        const data = {};
        data.radius = new DataAgent(param.radius,{ label: "半径",inputType: 'number' });
        data.radialSegments = new DataAgent(param.radialSegments,{ label: "分段",inputType: 'number' });
        data.cornerRadius = new DataAgent(param.cornerRadius,{ label: "拐角半径",inputType: 'number' });
        data.cornerSplit = new DataAgent(param.cornerSplit,{ label: "拐角分段",inputType: 'number' });
        data.up = new DataAgent(param.up,{ label: "up",inputType: 'vec3' });
        return data;
    }
    toParam() {
        const param = this.parameters;

        return {
            type: "PipeGeometry",
            param: [
                param.points,
                param.radius,
                param.radialSegments,
                param.cornerRadius,
                param.cornerSplit,
                [...param.up]
            ]
        };
    }
}
