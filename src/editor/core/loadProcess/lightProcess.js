import { AddObjectCommand } from "../commands";
import { Memory } from "../../library";
import * as THREE from "three";


class LightProcessPlugin {

    constructor(executor) {
        this.executor = executor;
        this.lights = [];

    }

    process(object) {

        const userData = object.userData;

        if (userData.isLight) {

            this.lights.push(object);

        }
    }

    afterProcess(scene) {

        if (this.lights.length === 0) return;

        const list = lightProcess(this.lights);

        this.lights = null;

        const editor = this.executor.editor;

        this.executor.setAction(

            function () {

                // list.forEach((obj) => {

                //     editor.execute(new AddObjectCommand(editor,obj,editor.lightGroup));

                // });

                for (let i = scene.children.length - 1; i >= 0; i--) {

                    const target = scene.children[i];

                    editor.execute(new AddObjectCommand(editor,target,editor.lightGroup));

                }

            }

        );



    }


}
function lightProcess(lights) {

    const list = [];

    lights.forEach((l) => {
        const userData = l.userData;

        const type = userData.type;

        let light;

        switch (type) {
            case "AmbientLight":
                light = ambientLight(userData);
                break;
            case "DirectionalLight":
                light = directionalLight(userData);
                break;
            case "SpotLight":
                light = spotLight(userData);
                break;
            case "PointLight":
                light = pointLight(userData);
                break;

            default:
                break;

        }



        light.name = userData.name;


        list.push(light);

        l.parent.add(light);

        // 替换原始灯光对象 然后删除原有灯光对象
        Memory.dispose(l,true);
    });

    return list;

}

function ambientLight(userData) {
    return new THREE.AmbientLight(userData.color,userData.intensity);

}

function directionalLight(userData) {
    const light = new THREE.DirectionalLight(userData.color,userData.intensity);

    light.target.position.set(...userData.target);
    light.castShadow = !!userData.castShadow;
    light.position.set(...userData.position);

    const _shadow = light.shadow;
    const shadow = userData.shadow;
    _shadow.mapSize.set(...shadow.mapSize);
    _shadow.bias = shadow.bias;
    _shadow.blurSamples = shadow.blurSamples;
    _shadow.radius = shadow.radius;
    _shadow.normalBias = shadow.normalBias;

    const _camera = _shadow.camera;
    const camera = shadow.camera;

    _camera.near = camera.near;
    _camera.far = camera.far;
    _camera.top = camera.top;
    _camera.bottom = camera.bottom;
    _camera.left = camera.left;
    _camera.right = camera.right;

    return light;
}
function spotLight(userData) {
    const light = new THREE.SpotLight(userData.color,userData.intensity);
    const target = light.target;
    ;
    light.targetProcess(target);

    light.target.position.set(...userData.target);

    light.castShadow = !!userData.castShadow;
    light.position.set(...userData.position);
    userData.rotation && light.rotation.set(...userData.rotation);
    light.decay = userData.decay;
    light.distance = userData.distance;
    light.angle = userData.angle;
    light.penumbra = userData.penumbra;

    const _shadow = light.shadow;
    const shadow = userData.shadow;

    _shadow.mapSize.set(...shadow.mapSize);
    _shadow.bias = shadow.bias;
    _shadow.blurSamples = shadow.blurSamples;
    _shadow.radius = shadow.radius;

    return light;
}

function pointLight(userData) {
    const light = new THREE.PointLight(userData.color,userData.intensity);

    light.castShadow = !!userData.castShadow;
    light.position.set(...userData.position);
    light.decay = userData.decay;
    light.distance = userData.distance;

    const _shadow = light.shadow;
    const shadow = userData.shadow;

    _shadow.mapSize.set(...shadow.mapSize);
    _shadow.bias = shadow.bias;
    _shadow.blurSamples = shadow.blurSamples;
    _shadow.radius = shadow.radius;

    return light;

}

export { LightProcessPlugin };