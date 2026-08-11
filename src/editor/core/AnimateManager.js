import * as THREE from "three";
import { Editor } from "./Editor";

export class AnimateManager {
    constructor(editor) {

        this.mixer = new THREE.AnimationMixer(editor.scene);

        this.editorEM = editor.editorEM;

        this.actions = new Map(); // 全局的所有动画action

        // 绑定动画;
        this.editorEM.addObject.add((object) => {

            if (object.animations.length > 0) {
                const actions = {};
                object.actions = actions;

                object.userData.state = object.userData.state || {};

                const state = object.userData.state;

                object.animations.forEach((clip) => {

                    //clip加载时会生成uuid，action不会生成uuid

                    const action = this.mixer.clipAction(clip,object);
                    action.name = clip.name;

                    // action使用对应clip的uuid
                    actions[clip.uuid] = action;
                    this.actions.set(clip.uuid,action);

                    // 在userData中存入动画指定状态
                    if (!state[clip.name]) {
                        state[clip.name] = {
                            type: "boolean",
                            value: false,
                            relate: "动画_" + clip.name
                        };
                    }

                });


            }


        });

        this.editorEM.removeObject.add((object) => {

            // 移除动画
            if (object !== null && object.animations.length > 0) {

                object.animations.forEach((clip) => {
                    this.actions.delete(clip.uuid);
                });

                this.mixer.uncacheRoot(object);
            }
        },editor,1);

        this.editorEM.animationPlay.add((uuid) => {

            const action = editor.selected.actions[uuid];

            action.isRunning() ? action.stop() : action.play();

        });

        // 全场景动画控制
        this.editorEM.allAnimation.add((boolean) => {

            if (boolean === true) {
                const actions = this.mixer._actions;
                actions.forEach((action) => {
                    action.play();
                });
            } else {
                this.mixer.stopAllAction();
            }


            const selected = editor.selected;
            if (selected) {
                this.editorEM.attributeChanged.dispatch(selected.uuid);
            }
        });
    }

    getAction(uuid) {
        const action = this.actions.get(uuid);
        return action;
    }
}