import { BoxGeometry,CylinderGeometry,PlaneGeometry,SphereGeometry } from "three";
import { DataAgent } from "../nodes/agent/DataAgent";




(function () {
    BoxGeometry.prototype.toModifyJSON = function () {
        const param = this.parameters;
        const data = {};

        data.width = new DataAgent(param.width,{ label: "宽度",inputType: 'number' });
        data.height = new DataAgent(param.height,{ label: "长度",inputType: 'number' });
        data.depth = new DataAgent(param.depth,{ label: "高度",inputType: 'number' });
        return data;
    };

    BoxGeometry.prototype.toParam = function () {
        const param = this.parameters;
        return {
            type: "BoxGeometry",
            param: [
                param.width,
                param.height,
                param.depth
            ]
        };
    };

    PlaneGeometry.prototype.toModifyJSON = function () {
        const param = this.parameters;
        const data = {};
        data.width = new DataAgent(param.width,{ label: "宽度",inputType: 'number' });
        data.height = new DataAgent(param.height,{ label: "长度",inputType: 'number' });
        return data;
    };
    PlaneGeometry.prototype.toParam = function () {
        const param = this.parameters;
        return {
            type: "PlaneGeometry",
            param: [
                param.width,
                param.height,
            ]
        };
    };

    SphereGeometry.prototype.toModifyJSON = function () {
        const param = this.parameters;
        const data = {};
        data.radius = new DataAgent(param.radius,{ label: "半径",inputType: 'number' });
        data.widthSegments = new DataAgent(param.widthSegments,{ label: "宽度分段",inputType: 'number' });
        data.heightSegments = new DataAgent(param.heightSegments,{ label: "高度分段",inputType: 'number' });
        return data;
    };
    SphereGeometry.prototype.toParam = function () {
        const param = this.parameters;
        return {
            type: "SphereGeometry",
            param: [
                param.radius,
                param.widthSegments,
                param.heightSegments
            ]
        };
    };

    CylinderGeometry.prototype.toModifyJSON = function () {
        const param = this.parameters;
        const data = {};
        data.radiusTop = new DataAgent(param.radiusTop,{ label: "顶部半径",inputType: 'number' });
        data.radiusBottom = new DataAgent(param.radiusBottom,{ label: "底部半径",inputType: 'number' });
        data.height = new DataAgent(param.height,{ label: "高度",inputType: 'number' });
        data.radialSegments = new DataAgent(param.radialSegments,{ label: "分段数",inputType: 'number' });
        data.openEnded = new DataAgent(param.openEnded,{ label: "顶底开放",inputType: 'switch' });
        data.thetaStart = new DataAgent(param.thetaStart,{ label: "起始角度",inputType: 'slider_input',range: [0,3.14159] },);
        return data;
    };
    CylinderGeometry.prototype.toParam = function () {
        const param = this.parameters;
        return {
            type: "CylinderGeometry",
            param: [
                param.radiusTop,
                param.radiusBottom,
                param.height,
                param.radialSegments,
                param.heightSegments,
                param.openEnded,
                param.thetaStart
            ]
        };
    };
})();



export { BoxGeometry,PlaneGeometry,SphereGeometry,CylinderGeometry };