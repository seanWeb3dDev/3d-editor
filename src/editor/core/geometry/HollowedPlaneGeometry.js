import { Vector2,BufferAttribute,BufferGeometry } from "three";
import { Vector3 } from "three";
import { Earcut } from "three/src/extras/Earcut";
import { DataAgent } from "../nodes/agent/DataAgent";


const out = [
    [5,5],
    [-5,5],
    [-5,-5],
    [5,-5],
];
const inn = [
    [3,3],
    [3,-3],
    [-3,-3],
    [-3,3],
];

export class HollowedPlaneGeometry extends BufferGeometry {
    constructor(outer = out,inner = inn) {
        super();
        this.type = "HollowedPlaneGeometry";

        this.outerData = outer;
        this.innerData = inner;

        this.parameters = {
            outer_0: outer[0],
            outer_1: outer[1],
            outer_2: outer[2],
            outer_3: outer[3],
            inner_0: inner[0],
            inner_1: inner[1],
            inner_2: inner[2],
            inner_3: inner[3]
        };

        this.setFromArray();
    }

    /**
     * @description 输入描述轮廓信息的点，将连续的两点连成一条线，不要有相交线，这可能会导致生成结果错误
     * @param {Vector2[]} points 轮廓坐标信息
     * @param {Vector2[][]} holes 洞洞坐标信息
     * @returns {this}
     */

    setFromArray() {

        const points = this.outerData;
        const holes = this.innerData;
        const positions = [];
        const v2s = [];

        for (let i = 0; i < points.length; i++) {
            positions.push(points[i][0],points[i][1],0);
            v2s.push(points[i][0],points[i][1]);
        }

        const holeIndices = [];
        let holeIndex = 4;

        if (holes && holes.length) {

            for (let j = 0; j < holes.length; j++) {
                positions.push(holes[j][0],holes[j][1],0);
                v2s.push(holes[j][0],holes[j][1]);
            }

            holeIndices.push(holeIndex);

        }

        const indices = Earcut.triangulate(v2s,holeIndices);


        const outer_x_length = new Vector2(...this.outerData[0]).distanceTo(new Vector2(...this.outerData[1]));
        const outer_y_length = new Vector2(...this.outerData[1]).distanceTo(new Vector2(...this.outerData[2]));
        const inner_y_length = new Vector2(...this.innerData[0]).distanceTo(new Vector2(...this.innerData[1]));
        const inner_x_length = new Vector2(...this.innerData[1]).distanceTo(new Vector2(...this.innerData[2]));



        const inner_1 = [
            new Vector2(...this.innerData[0]).distanceTo(new Vector2(v2s[2],v2s[9])),
            new Vector2(...this.innerData[0]).distanceTo(new Vector2(v2s[8],v2s[5]))
        ]; // 内圈右上角uv坐标 未归一化

        const uvs = new Float32Array([
            // ...v2s,
            1,
            1,
            0,
            1,
            0,
            0,
            1,
            0,
            inner_1[0] / outer_x_length,
            inner_1[1] / outer_y_length,
            inner_1[0] / outer_x_length,
            (inner_1[1] - inner_y_length) / outer_y_length,
            (inner_1[0] - inner_x_length) / outer_x_length,
            (inner_1[1] - inner_y_length) / outer_y_length,
            (inner_1[0] - inner_x_length) / outer_x_length,
            inner_1[1] / outer_y_length,

        ]);

        this.setAttribute("position",new BufferAttribute(new Float32Array(positions),3));
        this.setAttribute("uv",new BufferAttribute(uvs,2));
        this.setIndex(new BufferAttribute(new Uint16Array(indices),1));
        this.computeVertexNormals();

        return this;
    }
    toModifyJSON() {
        const outer = this.outerData;
        const inner = this.innerData;
        const data = {};
        data.outer_0 = new DataAgent(outer[0],{ label: '平面右上',inputType: 'vec2' });
        data.outer_1 = new DataAgent(outer[1],{ label: '平面左上',inputType: 'vec2' });
        data.outer_2 = new DataAgent(outer[2],{ label: '平面左下',inputType: 'vec2' });
        data.outer_3 = new DataAgent(outer[3],{ label: '平面右下',inputType: 'vec2' });


        data.inner_0 = new DataAgent(inner[0],{ label: '内圈右上',inputType: 'vec2' });
        data.inner_1 = new DataAgent(inner[1],{ label: '内圈右下',inputType: 'vec2' });
        data.inner_2 = new DataAgent(inner[2],{ label: '内圈左下',inputType: 'vec2' });
        data.inner_3 = new DataAgent(inner[3],{ label: '内圈左上',inputType: 'vec2' });

        return data;

    }

    toParam() {
        const param = this.parameters;
        return {
            type: "HollowedPlaneGeometry",
            param: [
                [param.outer_0,param.outer_1,param.outer_2,param.outer_3],
                [param.inner_0,param.inner_1,param.inner_2,param.inner_3]
            ]
        };
    }
}
