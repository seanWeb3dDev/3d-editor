
import { checkObjectType } from "../Util";

import * as THREE from "three";
import * as QUARKS from "three.quarks";
import { particleBehaviorJSON } from "../Particle";

const BEHAVIOR_LIST = [
    { label: '方向力',value: 'ApplyForce' },
    { label: '引力',value: 'GravityForce' },
    { label: '随机行为',value: 'Noise' },
    { label: '旋转',value: 'Rotation3DOverLife' },

];
class ParticleBehaviorPlugin {

    constructor(editor) {

        this.editor = editor;
        this.editorEM = editor.editorEM;
        this.materialManager = editor.materialManager;
        this.name = "ParticleBehaviorPlugin";

        this.map = [
        ];



    }

    /**获取列表 */
    getList() {

        return this.map;
    }

    getAddList() {
        return BEHAVIOR_LIST;
    }



    removeFromList(index) {

        this.map.splice(index,1);

    }

    /**添加行为 */
    add(value) {
        if (typeof value === "string") {
            const json = particleBehaviorJSON(value);
            this.map.push(json);
        }
        if (Array.isArray(value)) {
            value.forEach((j) => {
                const json = particleBehaviorJSON(j);
                this.map.push(json);
            });
        }
        return this.map;
    }

    /**提取行为 */
    absorb() {
        const target = this.editor.selected;
        if (checkObjectType(target,['isParticle'])) {
            this.map = [];

            const behaviors = target.particleSystem.behaviors;

            behaviors.forEach((behave) => {
                this.map.push(behave.toJSON());
            });

            return this.map;
        } else return false;



    }

    /**点击材质列表 */
    select(index) {

    }





    /**设置材质 */
    set() {

        const target = this.editor.selected;

        if (checkObjectType(target,['isParticle'])) {

            target.clearBehavior();

            this.map.forEach((json) => {
                target.addBehaviorFromJSON(json);
            });
            this.editorEM.attributeChanged.dispatch(target.uuid);

            return true;
        } else return false;

    }



}



export { ParticleBehaviorPlugin };