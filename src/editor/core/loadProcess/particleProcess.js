import { AddObjectCommand } from "../commands";
import { Memory } from "../../library";
import * as THREE from "three";
import *as QUARKS from "three.quarks";
import { ParticleEmitter } from "../Particle";

class ParticleProcessPlugin {


    constructor(executor) {
        this.executor = executor;
        this.particles = [];
        this.batches = {};
        this.batchRenderer = null;
    }

    process(object) {
        const userData = object.userData;

        if (userData.isParticle) {
            this.particles.push(object);
        }
        if (userData.isBatch) {
            this.batches[userData.uuid] = object;
        }
        if (userData.isBatchRenderer) {
            this.batchRenderer = object;
        }


    }

    afterProcess(scene) {
        if (this.particles.length === 0) return;



        if (this.batchRenderer) {
            const parent = this.batchRenderer.parent;
            parent.remove(this.batchRenderer);
        }


        this.particles.forEach((particle) => {

            // 移除glb中原有的粒子
            const parent = particle.parent;
            parent.remove(particle);

            const setting = particle.userData.particleSetting;

            // 从glb中获取对应几何和材质数据
            const mesh = this.batches[setting.instancedUuid];
            setting.instancingGeometry = mesh.geometry;
            setting.material = mesh.material;

            const newParticle = ParticleEmitter.fromJSON(setting);

            newParticle.name = particle.name;

            particle.matrix.decompose(newParticle.position,newParticle.quaternion,newParticle.scale);

            parent.add(newParticle);
        });


        const editor = this.executor.editor;


        this.executor.setAction(
            function () {
                editor.loadLength += scene.children.length;

                for (let i = scene.children.length - 1; i >= 0; i--) {

                    editor.loadLength--;

                    const target = scene.children[i];

                    editor.execute(new AddObjectCommand(editor,target,editor.particleGroup));

                }


            }
        );



    }

}



export { ParticleProcessPlugin };