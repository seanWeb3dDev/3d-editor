import * as THREE from "three";

const ADD_LIGHT_LIST = [
    { label: '组',key: "group" },
    { label: '环境光',key: "AmbientLight" },
    { label: '直线光',key: "DirectionalLight" },
    { label: '聚光灯',key: "SpotLight" },
    { label: '点光源',key: "PointLight" },
    // { label: '半球光',key: "HemisphereLight" }
];

/**
 * 灯光特殊处理
 */
class GLTFLightExtraExtension {

    constructor(writer) {

        this.writer = writer;
        this.name = 'BL_lights_extension';
    }

    writeNode(input,nodeDef) {

        //nodeDef的extras为3D对象的userData
        if (input.isLight) {
            const userData = this.lightExporterProcess(input);
            nodeDef.extras = JSON.parse(JSON.stringify(userData));
        }

    }
    // beforeParse(input) {

    // if (input[0].parent.name !== "灯光组") return;

    // for (let i = 0; i < input.length; i++) {

    //     const child = input[i];

    //     child.traverse((l) => {
    //         if (l.isLight) {
    //             this.lightExporterProcess(l);
    //         }
    //     });

    // }

    // }

    lightExporterProcess(obj) {
        obj.userData = obj.userData || {};
        obj.userData.name = obj.name;
        obj.userData.intensity = obj.intensity;
        obj.userData.color = obj.color;
        obj.userData.isLight = true;


        if (obj instanceof THREE.AmbientLight) {

            obj.userData.type = "AmbientLight";
        } else if (obj instanceof THREE.DirectionalLight) {

            obj.userData.type = "DirectionalLight";
            obj.userData.target = [...obj.target.position];
            obj.userData.position = [...obj.position];
            obj.userData.castShadow = obj.castShadow;

            const _shadow = obj.userData.shadow = {};
            const shadow = obj.shadow;

            _shadow.mapSize = [shadow.mapSize.x,shadow.mapSize.y];
            _shadow.bias = shadow.bias;
            _shadow.blurSamples = shadow.blurSamples;
            _shadow.radius = shadow.radius;
            _shadow.normalBias = shadow.normalBias;

            const _camera = _shadow.camera = {};
            const camera = shadow.camera;

            _camera.near = camera.near;
            _camera.far = camera.far;
            _camera.top = camera.top;
            _camera.bottom = camera.bottom;
            _camera.left = camera.left;
            _camera.right = camera.right;


        } else if (obj instanceof THREE.SpotLight) {
            obj.userData.type = "SpotLight";
            obj.userData.target = [...obj.target.position];
            obj.userData.position = [...obj.position];
            obj.userData.rotation = [...obj.rotation];
            obj.userData.castShadow = obj.castShadow;
            obj.userData.distance = obj.distance;
            obj.userData.decay = obj.decay;
            obj.userData.angle = obj.angle;
            obj.userData.penumbra = obj.penumbra;


            const _shadow = obj.userData.shadow = {};
            const shadow = obj.shadow;

            _shadow.mapSize = [shadow.mapSize.x,shadow.mapSize.y];
            _shadow.bias = shadow.bias;
            _shadow.blurSamples = shadow.blurSamples;
            _shadow.radius = shadow.radius;


        } else if (obj instanceof THREE.PointLight) {
            obj.userData.type = "PointLight";
            obj.userData.position = [...obj.position];
            obj.userData.castShadow = obj.castShadow;
            obj.userData.decay = obj.decay;
            obj.userData.distance = obj.distance;

            const _shadow = obj.userData.shadow = {};
            const shadow = obj.shadow;

            _shadow.mapSize = [shadow.mapSize.x,shadow.mapSize.y];
            _shadow.bias = shadow.bias;
            _shadow.blurSamples = shadow.blurSamples;
            _shadow.radius = shadow.radius;
        }


        return obj.userData;
    }

}

(function () {

    THREE.SpotLight.prototype.targetProcess = function (target) {
        if (this.target !== target) this.target = target;
        target.lightId = this.id;
        target.isLightTarget = true;
        target.name = '聚光灯目标';
        this.add(target);
    };
})();

export { GLTFLightExtraExtension,ADD_LIGHT_LIST };