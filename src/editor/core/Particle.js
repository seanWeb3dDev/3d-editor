import * as THREE from "three";
import {
    BatchedParticleRenderer,
    ConstantColor,
    ConstantValue,
    IntervalValue,
    ParticleSystem,
    PointEmitter,
    RandomColor,
    RenderMode,
    SphereEmitter,
    ConeEmitter,
    HemisphereEmitter,
    CircleEmitter,
    DonutEmitter,
    SizeOverLife,
    PiecewiseBezier,
    Bezier,
    ColorOverLife,
    ColorRange,
    SpeedOverLife,
    RandomQuatGenerator,
    Rotation3DOverLife,
    AxisAngleGenerator,
    GridEmitter,
    Noise,
    Vector3,
    Vector4,
    ApplyForce,
    ApplyCollision,
    FrameOverLife,
    RotationOverLife,
    EmitterFromJSON
} from "three.quarks";

import * as QUARKS from "three.quarks";
import { GLTFLoader } from "../library/GLTFLoader";
import { getParticleValue,psValueFromJSON } from "./Util";
import { generateEdgeLine } from './../library/edgeLine';


/**
 * 粒子特效
 */
// 粒子系统设置


let particleMesh;
const loader = new GLTFLoader();
loader.load("./model/煤.glb",(gltf) => {
    const coal = gltf.scene.children[0];
    coal.material.roughness = 0.7;
    coal.material.metalness = 0.3;

    particleMesh = coal;

});


const createSet = () => {
    const shapeSet = { width: 0.5,height: 3.4,row: 20,column: 1 };
    return {

        duration: Infinity, // 粒子持续事件 如果duration不是永久的话，需要设置looping，否则时间过后粒子特效消失
        looping: false,
        startLife: new IntervalValue(12.5,12.5),
        startSpeed: new IntervalValue(1.65,1.65),
        startSize: new IntervalValue(0.2,0.45),

        startColor: new ConstantColor(
            new Vector3(0.75,0.71,0.51,1.0),
        ),
        // startColor: new RandomColor(
        //     new Vector3(1,0.91,0.51),
        //     new Vector3(1,0.44,0.16)
        // ),
        startRotation: new RandomQuatGenerator(),
        emissionOverTime: new ConstantValue(250), // 一个循环内的粒子数量
        worldSpace: true,

        instancingGeometry: particleMesh.geometry,
        material: particleMesh.material,


        shape: new GridEmitter(shapeSet), // 网格发射器
        renderMode: RenderMode.Mesh,
        renderOrder: 1,

    };
};


const ADD_PARTICLE_LIST = [
    { label: '组',key: "group" },
    { label: "粒子",key: "particle" },
];

function particleBehaviorJSON(behavior) {
    switch (behavior) {
        case "ApplyForce": {
            const obj = {
                direction: [0,-1,0],
                magnitude: { type: "ConstantValue",value: 0.2 },
                type: "ApplyForce"
            };
            return obj;

        }
        case "GravityForce": {
            const obj = {
                center: [0,5,0],
                magnitude: 10,
                type: "GravityForce"
            };
            return obj;
        }
        case "Noise": {
            const obj = {
                frequency: { type: 'IntervalValue',a: 3,b: 5 },
                power: { type: 'IntervalValue',a: 0.1,b: 0.5 },
                positionAmount: { type: 'IntervalValue',a: 0.02,b: 0.15 },
                rotationAmount: { type: 'ConstantValue',value: 0 },

                type: "Noise"
            };
            return obj;

        }
        case "Rotation3DOverLife": {
            const obj = {
                angularVelocity: {
                    angle: { type: 'IntervalValue',a: 3,b: 3 },
                    axis: { x: 0,y: 0.5,z: 1 },
                    type: "AxisAngle"
                },
                type: "Rotation3DOverLife"
            };
            return obj;
        }
        default: {
            console.log("无对应行为");
            break;
        }
    }
}




const helperGeo = new THREE.BoxGeometry(0.1,0.1,0.1);
const helperM = new THREE.MeshBasicMaterial({ wireframe: true });
const emitterHelper = new THREE.Mesh(helperGeo,helperM);
class ParticleEmitter extends THREE.Group {

    get shape() {
        return this.particleSystem.emitterShape;
    }
    get duration() {
        return this.particleSystem.duration;
    }
    get worldSpace() {
        return this.particleSystem.worldSpace;
    }

    get looping() {
        return this.particleSystem.looping;
    }
    get renderMode() {
        return this.particleSystem.renderMode;
    }
    get _renderOrder() {
        return this.particleSystem.renderOrder;
    }

    get emissionOverTime() {
        return getParticleValue(this.particleSystem.emissionOverTime);
    }
    get startLife() {
        return getParticleValue(this.particleSystem.startLife);
    }
    get startSpeed() {
        return getParticleValue(this.particleSystem.startSpeed);
    }
    get startSize() {
        return getParticleValue(this.particleSystem.startSize);
    }
    get startRotation() {
        return getParticleValue(this.particleSystem.startRotation);

    }
    get startColor() {
        return getParticleValue(this.particleSystem.startColor);
    }
    get behaviors() {
        return this.particleSystem.behaviors;
    }

    constructor(setting) {
        super();

        this.name = '粒子';
        this.type = 'Particle';
        this.isParticle = true;

        setting = setting ?? createSet();

        this.particleSystem = new QUARKS.ParticleSystem(setting);

        this.emitter = this.particleSystem.emitter;
        this.emitter.userData.isEmitter = true;
        this.emitter.rotation.z = Math.PI / 2;


        this.helper = generateEdgeLine(emitterHelper);
        this.helper.isLocked = true;
        this.helper.userData.isEmitterHelper = true;



        this.userData = setting.userData ? setting.userData :
            {
                state: {
                    "动画开关": {
                        type: "boolean",
                        value: true,
                    }
                }
            };



        this.add(this.emitter);
        this.add(this.helper);

    }
    clearBehavior() {
        this.particleSystem.behaviors = [];
    }
    addBehavior(behavior) {
        this.particleSystem.addBehavior(behavior);
    }
    addBehaviorFromJSON(json) {

        const behavior = QUARKS.BehaviorFromJSON(json);
        this.particleSystem.addBehavior(behavior);
        return this.particleSystem;

    }

    clone() {


        const json = this.toJSON();

        json.instancingGeometry = this.particleSystem.instancingGeometry;
        json.material = this.particleSystem.material;

        const clone = ParticleEmitter.fromJSON(json);

        this.matrix.decompose(clone.position,clone.quaternion,clone.scale);

        return clone;




    }
    dispose() {

        // 清除粒子发射器
        // helper由editor.dispose执行清除
        this.particleSystem.dispose();
        this.emitter = null;
    };


    toJSON() {
        const data = {
        };
        data.duration = this.duration === Infinity ? 'Infinity' : this.duration;
        data.looping = this.looping;
        data.startLife = this.startLife;
        data.startSpeed = this.startSpeed;
        data.startSize = this.startSize;
        data.startColor = this.startColor;
        data.startRotation = this.startRotation;
        data.emissionOverTime = this.emissionOverTime;
        data.worldSpace = this.worldSpace;
        data.renderMode = this.renderMode;
        data.renderOrder = this._renderOrder;
        data.shape = this.shape.toJSON();
        data.instancedUuid = this.instancedUuid;

        data.behaviors = this.behaviors.map((behavior) => behavior.toJSON());

        data.userData = JSON.stringify(this.userData);
        return data;
    }

    static jsonToSetting(json) {
        const data = {};
        data.duration = json.duration === 'Infinity' ? Infinity : json.duration;
        data.looping = json.looping;
        data.emissionOverTime = psValueFromJSON(json.emissionOverTime);

        data.shape = QUARKS.EmitterFromJSON(json.shape);

        data.startColor = psValueFromJSON(json.startColor);
        data.startLife = psValueFromJSON(json.startLife);
        data.startSpeed = psValueFromJSON(json.startSpeed);
        data.startSize = psValueFromJSON(json.startSize);
        data.startRotation = psValueFromJSON(json.startRotation);
        data.worldSpace = json.worldSpace;
        data.renderMode = json.renderMode;
        data.renderOrder = json.renderOrder;

        data.instancingGeometry = json.instancingGeometry || null;
        data.material = json.material || null;


        data.behaviors = json.behaviors ? json.behaviors.map((behaviorJSON) => QUARKS.BehaviorFromJSON(behaviorJSON)) : [];

        data.userData = json.userData ? JSON.parse(json.userData) : null;

        return data;
    }
    static fromJSON(json) {


        const data = this.jsonToSetting(json);


        return new ParticleEmitter(data);


    }

    reset() {
        this.particleSystem.restart();

    }

}

class ParticleManager {
    constructor(editor) {

        this.editor = editor;

        this.scene = editor.scene;

        this.group = editor.particleGroup;

        this.batchRenderer = null;

        this.particleMap = new Map();

        this.instanceMap = new Map();


    }

    addParticle(particle) {

        if (!particle) return;

        if (!this.batchRenderer) this.createRender();

        this.particleMap.set(particle.uuid,particle);

        this.batchRenderer.addSystem(particle.particleSystem);

        // 关联batch和particle
        this.batchProcess(this.batchRenderer,particle);


    }

    batchProcess(batchRenderer,particle) {

        const batches = batchRenderer.batches;

        const batchMap = batchRenderer.systemToBatchIndex;

        const batchIndex = batchMap.get(particle.particleSystem);

        const batch = batches[batchIndex]; // 该粒子的实例化网格

        batch.isLocked = true;

        particle.instancedUuid = batch.uuid;

        batch.userData.uuid = batch.uuid;

        batch.userData.isBatch = true;

    }

    removeParticle(particle) {
        // 移除粒子时，无需对粒子的emitter进行dispose，因为dispose行为无法被撤销
        // 所以正常的粒子移除流程是将particle移出父级，并且在batchRenderer中删除对应的system

        if (!particle) return;

        this.batchRenderer.deleteSystem(particle.particleSystem); // dispose行为中已经包含deleteSystem

        this.particleMap.delete(particle.uuid);

        // particle.dispose(); // emitter从group中移除 

        if (this.particleMap.size === 0) {

            this.editor.particleGroup.remove(this.batchRenderer);

            this.batchRenderer = null;
        }

    }

    createRender() {
        this.batchRenderer = new BatchedParticleRenderer();

        this.batchRenderer.isLocked = true; // 默认锁定

        this.batchRenderer.name = '粒子渲染器';

        this.batchRenderer.userData.isBatchRenderer = true;

        this.group.add(this.batchRenderer);
    }

    resetAllParticle() {
        this.particleMap.forEach((particle) => {

            particle.reset();
        });
    }
    update(time) {
        if (this.batchRenderer) {
            this.batchRenderer.update(time);
        }
    }
    setInstance(key,instance) {
        this.instanceMap.set(key,instance);
    }
    getInstance(key) {
        const instance = this.instanceMap.get(key);
        if (instance) return instance;
        else return null;
    }

}

/**
 * exporter粒子导出插件
 */

class GLTFParticleExtension {
    constructor(writer) {
        this.writer = writer;
        this.name = 'BL_particle_extension';
    }

    writeNode(input,nodeDef) {
        const userData = input.userData = input.userData || {};
        if (input.isParticle) {
            userData.particleSetting = input.toJSON();
            userData.isParticle = true;
            nodeDef.extras = JSON.parse(JSON.stringify(userData));
        }

    }
    beforeParse(input) {

    }

    afterParse(input) {

    }
}


export { ParticleEmitter,ParticleManager,GLTFParticleExtension,ADD_PARTICLE_LIST,particleBehaviorJSON };