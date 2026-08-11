import * as THREE from "three";
import { Memory } from "../library";


const ADD_HELPER_LINE_LIST = [
    { label: '组',key: "group" },
    { label: '线',key: "helperLine" },
];

const dotGeometry = new THREE.SphereGeometry(0.05);
const dotMaterial = new THREE.MeshBasicMaterial({ name: '点材质',color: '#f59211' });
const lineMaterial = new THREE.LineBasicMaterial({
    name: "线材质",
    color: "#f7fcbd"
});
class HelperLine extends THREE.Object3D {
    constructor(setting = {}) {
        super();
        this.isHelperLine = true;
        this.type = 'helperLine';
        this.name = '线';

        this.dotGroup = new THREE.Object3D();
        this.dotGroup.name = '辅助点组';
        this.lineSegGroup = new THREE.Group();
        this.lineSegGroup.name = '线段组';
        this.add(this.dotGroup,this.lineSegGroup);

        const points = setting.points || [];

        if (points.length > 0) {

            points.forEach((item) => {
                const position = new THREE.Vector3(...item.position);

                const dot = createHelperDot(this,position);

                dot.name = item.name;

                this.dotGroup.add(dot);

            });

            this.refreshSegment();
        }





    }

    updateSegment(dot) {

        const index = this.getDotIndex(dot);

        const dots = this.dotGroup.children;

        if (dots.length <= 1) return;

        const list = [];

        const lines = this.lineSegGroup.children;

        let previousDot = dots[index - 1];

        let nextDot = dots[index + 1];;

        if (previousDot) {
            list.push({
                dot: previousDot,
                line: lines[index - 1]
            });
        }

        if (nextDot) {
            list.push({
                dot: nextDot,
                line: lines[index]
            });
        }


        list.forEach((item) => {
            const p = item.dot.position;
            const line = item.line;

            const points = [
                dot.position,
                p
            ];
            line.geometry.dispose();
            line.geometry = new THREE.BufferGeometry().setFromPoints(points);

        });

    }

    refreshSegment() {


        this.lineSegGroup.traverse((child) => {
            if (child.isLine) {
                child.geometry.dispose();
            }
        });
        this.lineSegGroup.children = [];

        const dots = this.dotGroup.children;

        if (dots.length <= 1) return;

        // 重新绘制所有线段
        for (let i = 0; i < dots.length - 1; i++) {

            const firstP = dots[i].position;
            const nextP = dots[i + 1].position;


            const geometry = new THREE.BufferGeometry().setFromPoints([firstP,nextP]);
            const line = new THREE.LineSegments(geometry,lineMaterial);


            this.lineSegGroup.add(line);

        }

    }

    getLastDotPosition() {

        const dots = this.dotGroup.children;

        if (dots.length === 0) return this.dotGroup.position.clone();
        const dot = dots[dots.length - 1];

        const position = dot.position.clone();

        return position;
    }

    getFirstDotWorldPosition() {
        const dots = this.dotGroup.children;

        if (dots.length === 0) return this.dotGroup.position.clone();
        const dot = dots[0];


        const position = dot.getWorldPosition(new THREE.Vector3());

        return position;
    }

    getDotIndex(dot) {
        const list = this.dotGroup.children;
        const index = list.indexOf(dot);
        return index;
    }


    getDotsLength() {
        return this.dotGroup.children.length;
    }
    getDots() {
        return this.dotGroup.children;
    }

    getPointList() {
        const list = [];

        this.dotGroup.children.forEach((dot) => {

            const position = [...dot.position];
            list.push(position);
        });

        return list;
    }

    /**
     * 获取路径最后一个点的坐标与第一个点的坐标相减获得的方向向量
     * 如果路径点的数量小于等于1，则直接使用dotGroup的方向
     */
    getDirection() {
        const vec3 = new THREE.Vector3();
        const dots = this.dotGroup.children;

        if (dots.length <= 1) {
            return this.dotGroup.position.clone();
        }
        const dotA = dots[dots.length - 1].getWorldPosition(new THREE.Vector3());
        const dotB = dots[0].getWorldPosition(new THREE.Vector3());


        vec3.subVectors(dotA,dotB);

        return dotA;

    }
    clone() {
        const json = this.toJSON();

        const newLine = HelperLine.fromJSON(json);
        newLine.name = this.name;
        this.matrix.decompose(newLine.position,newLine.quaternion,newLine.scale);
        return newLine;
    }

    toJSON() {

        const json = {};
        const points = [];


        this.dotGroup.children.forEach((dot) => {
            const name = dot.name;
            const position = [...dot.position];
            points.push({
                name,position
            });
        });

        json.points = points;
        return json;
    }
    static fromJSON(json) {

        return new HelperLine(json);

    }
}

class HelperDot extends THREE.Mesh {
    constructor(geometry,material) {
        super(geometry,material);
        this.isHelperDot = true;
        this.type = 'helperDot';

        this.name = '点';

        this.dotIndex = null;

        this.changeEvents = new Map();


        // 对于dot的position修改 需要使用copy方法

        this.position.copy = (v) => {

            this.position.x = v.x;
            this.position.y = v.y;
            this.position.z = v.z;

            const fn = this.changeEvents.get('change');
            fn(this);

            return this.position;

        };

    }

    addChangeEvent(key,callback) {
        if (this.changeEvents.has(key)) {
            console.warn('已存在相同key的监听事件');
            return;
        }
        this.changeEvents.set(key,callback);

    }

    clone() {
        const newDot = new HelperDot(this.geometry,this.material);

        const p = this.position;

        newDot.position.set(p.x,p.y,p.z);


        this.changeEvents.forEach((e,key) => {
            newDot.addChangeEvent(key,(dot) => {
                e(dot);
            });

        });

        return newDot;

    }
}

/**
 * exporter文本导出插件
 */
class GLTFHelperLineExtension {
    constructor(writer) {

        this.writer = writer;
        this.name = 'BL_helperLine_extension';
    }

    writeNode(input,nodeDef) {
        const userData = input.userData = input.userData || {};
        if (input instanceof HelperLine) {
            userData.lineSetting = input.toJSON();
            userData.isHelperLine = true;
            nodeDef.extras = JSON.parse(JSON.stringify(userData));

        }

    }


}


function createHelperLine() {

    const line = new HelperLine();


    return line;

}

function createHelperDot(line,position) {
    const dot = new HelperDot(dotGeometry,dotMaterial);

    if (!position) {
        position = line.getLastDotPosition();
        position.y += 0.5;
        position.x += 0.5;
    }

    dot.position.set(position.x,position.y,position.z);

    dot.addChangeEvent('change',(dot) => {
        line.updateSegment(dot);
    });

    dot.addChangeEvent('delete',() => {
        line.refreshSegment();
    });
    return dot;

}
export { HelperDot,HelperLine,createHelperLine,createHelperDot,ADD_HELPER_LINE_LIST,GLTFHelperLineExtension };