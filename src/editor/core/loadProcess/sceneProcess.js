import * as THREE from "three";





/**
 * 用于处理scene.userData中保存的常规属性
 * 如position，scale,rotation等
 */


class SceneProcessPlugin {

    constructor(executor) {

        this.executor = executor;
        this.scene = null;
        this.originAttr = null;

    }

    process(object) {

        const userData = object.userData;

        if (!object instanceof THREE.Group || !object instanceof THREE.Scene) return;

        if (!userData['originAttr']) return;

        this.originAttr = userData['originAttr'];

        this.scene = object;

        delete userData.originAttr;
    }



    afterProcess() {

        if (!this.originAttr) return;

        const p = this.originAttr.position;
        const r = this.originAttr.rotation;
        const s = this.originAttr.scale;

        if (p) {
            this.scene.position.set(p.x,p.y,p.z);
        }
        if (r) {
            this.scene.rotation.x = r._x;
            this.scene.rotation.y = r._y;
            this.scene.rotation.z = r._z;
        }

        if (s) {

            this.scene.scale.set(s.x,s.y,s.z);
        }



        this.scene = null;
        this.originAttr = null;
    }
}


export { SceneProcessPlugin };