import { Command } from '../../library';
import { Editor } from "../Editor";
import * as QUARKS from "three.quarks";
import { ParticleEmitter } from '../Particle';



/**
 * 属性设置
 */
export class SetParticleInstanceCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {ParticleEmitter} object 
     * @param {Mesh} mesh 
     * @constructor
     */
    constructor(editor,object,mesh) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetParticleInstanceCommand';

        this.name = `Set instance`;

        this.updatable = false;

        this.reuseable = false;

        this.object = object;

        this.particleSystem = object.particleSystem;

        this.batchRenderer = this.particleSystem._renderer;

        this.json = this.object.toJSON();

        this.json.instancingGeometry = mesh.geometry;

        this.json.material = mesh.material;

        this.setting = ParticleEmitter.jsonToSetting(this.json);

        this.newParticleSystem = new QUARKS.ParticleSystem(this.setting);

        const emitter = this.newParticleSystem.emitter;

        emitter.userData.isEmitter = true;

        emitter.rotation.z = Math.PI / 2;



    }

    execute() {


        this.batchRenderer.deleteSystem(this.particleSystem);

        this.object.remove(this.particleSystem.emitter);

        this.object.particleSystem = this.newParticleSystem;

        this.object.emitter = this.newParticleSystem.emitter;

        this.object.add(this.newParticleSystem.emitter);

        this.batchRenderer.addSystem(this.newParticleSystem);

        const batches = this.batchRenderer.batches;

        const batchMap = this.batchRenderer.systemToBatchIndex;

        const batchIndex = batchMap.get(this.newParticleSystem);

        const batch = batches[batchIndex];

        batch.isLocked = true;

        this.object.instancedUuid = batch.uuid;

        batch.userData.uuid = batch.uuid;

        batch.userData.isBatch = true;



    }

    undo() {

        this.batchRenderer.deleteSystem(this.newParticleSystem);

        this.object.remove(this.newParticleSystem.emitter);

        this.object.particleSystem = this.particleSystem;

        this.object.emitter = this.particleSystem.emitter;

        this.object.add(this.particleSystem.emitter);

        this.batchRenderer.addSystem(this.particleSystem);

        const batches = this.batchRenderer.batches;

        const batchMap = this.batchRenderer.systemToBatchIndex;

        const batchIndex = batchMap.get(this.particleSystem);

        const batch = batches[batchIndex];

        this.object.instancedUuid = batch.uuid;

    }

    update(cmd) {


    }


    toJSON() {



        return output;

    }

    fromJSON(json) {


    }

}

