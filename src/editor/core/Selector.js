import * as THREE from 'three';
import { Editor } from './Editor';

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
raycaster.layers.set(0);

class Selector {

    /**@type {Editor} 编辑器 */
    editor;

    /**
     * @param {Editor} editor 
     */
    constructor(editor) {



        this.editor = editor;
        this.editorEM = editor.editorEM;
        this.detectTarget = this.editor.scene;

        this.active = true;
        this.editorEM.selectorDetected.add((intersects) => {

            if (intersects.length > 0) {

                // 某些无法被选中的目标


                const object = intersects[0].object;

                if (object.userData.object !== undefined) {

                    // helper

                    this.select(object.userData.object);

                } else {

                    this.select(object);

                }


            } else {

                this.select(null);


            }

        });


    }

    getIntersects(raycaster) {

        const objects = [];

        this.detectTarget.traverseVisible(function (child) {

            // todo 判定模型是否被锁定，被锁定的模型不可拾取

            if (child.isLocked) return;
            if (child.isLine) return;
            objects.push(child);


        });
        this.editor.sceneHelpers.traverseVisible(function (child) {
            // "lightHelper.name = picker"
            if (child.name === 'picker') objects.push(child);

        });
        this.editor.sceneMarks.traverseVisible(function (child) {
            objects.push(child);
        });

        return raycaster.intersectObjects(objects,false);

    }

    getPointerIntersects(point,camera) {

        mouse.set((point.x * 2) - 1,- (point.y * 2) + 1);

        raycaster.setFromCamera(mouse,camera);

        return this.getIntersects(raycaster);

    }

    /**@param {THREE.Object3D} object  */
    select(object) {

        // object 为null时一般为执行了deselect, 前端页面取消对象选中和材质选中都走该流程

        if (this.editor.selected === object && object !== null) return;

        let uuid = null;

        let node = null;

        if (object !== null) {

            uuid = object.uuid;

            node = this.editor.format.getNodeModifyJSON(object.uuid);


        }

        this.editor.selected = object;

        this.editorEM.objectSelected.dispatch(object);

        // 选择目标后返回目标自身属性给前端

        this.editor.callbackList.selected(node);

    }


    deselect() {

        this.select(null);

    }

    setDetectTarget(target) {
        if (target && typeof target === THREE.Object3D) {
            this.detectTarget = target;
        } else {
            this.detectTarget = this.editor.scene;
        }
    }

}


export { Selector };
