import * as THREE from "three";
import { Editor } from "./Editor";
import { LightNode,MaterialNode,Object3DNode,MarkPointNode,MarkGroupNode,MarkLineNode,TextNode,ParticleNode,HelperLineNode,HelperDotNode } from "./nodes";

export class Format {

    /** 返回全场景索引信息和类型 */
    get sceneData() {
        const scene = this.editor.scene;
        return this.addObject(scene).toJSON();
    }

    /** 返回编辑器选中对象的可修改属性和值 */
    get selectData() {
        const selected = this.editor.selected;
        if (selected) {
            return this.objectMap.get(selected.uuid).toModifyJSON();
        }
    }


    /**
     * @param {Editor} editor 
     */
    constructor(editor) {

        this.editor = editor;
        this.editorEM = editor.editorEM;
        this.scene = editor.scene;
        this.camera = editor.camera;
        this.renderer = editor.renderer;
        this.callbackList = editor.callbackList;


        /** @type {Map<string,Object3DNode>} */
        this.objectMap = new Map();
        this.objectMap.set(this.scene.uuid,new Object3DNode(this.scene));


        this.editorEM.addObject.add((object,parent,index) => {

            const node = this.addObject(object);
            const json = node.toJSON();
            // 统一 parent 字段为 UUID 字符串，与 moveObject/undo 回调以及前端 loadInfo 约定保持一致
            json.parent = object.parent ? object.parent.uuid : null;

            this.callbackList.modelData(json,index);

        });

        this.editorEM.removeObject.add((object) => {

            const id = object.uuid;

            this.removeObject(object);

            this.callbackList.delete(id);

        },editor,1);

    }

    /**
     * 场景新增对象，记录全场景对象和材质索引
     * @param {THREE.Object3D} object 
     */
    addObject(object) {
        object.traverse(child => {
            const node = this.createNode(child);
            this.#_set(this.objectMap,child.uuid,node);


        });

        return this.createNode(object);

    }

    createNode(object) {
        let node;
        if (object instanceof THREE.Light) {
            node = new LightNode(object);
        } else if (object.isMarkPoint) {
            node = new MarkPointNode(object);
        } else if (object.isMarkLine) {
            node = new MarkLineNode(object);
        } else if (object.isMarkGroup) {
            node = new MarkGroupNode(object);
        } else if (object.isText) {
            node = new TextNode(object);
        } else if (object.isMaterial) {
            node = new MaterialNode(object);
        } else if (object.isParticle) {
            node = new ParticleNode(object);
        } else if (object.isHelperLine) {
            node = new HelperLineNode(object);
        } else if (object.isHelperDot) {
            node = new HelperDotNode(object);
        } else {
            node = new Object3DNode(object);
        }
        return node;
    }

    #_set(map,key,value) {
        if (!map.has(key)) {
            map.set(key,value);
        }
    }

    get(uuid) {
        if (this.objectMap.has(uuid)) {
            return this.objectMap.get(uuid);
        }

        return null;
    }

    getNodeModifyJSON(uuid) {

        if (this.objectMap.has(uuid)) {
            return this.objectMap.get(uuid).toModifyJSON();
        }



        return {};
    }

    /**
     * 场景移除对象，删除对象和材质索引
     * @param {THREE.Object3D} object 
     */
    removeObject(object) {

        object.traverse(child => {

            this.objectMap.delete(child.uuid);


        });
    }

    /**
     * 根据uuid获得格式化后的材质信息数据
     * @param {string} uuid 
     */
    getMaterialDataByUuid(uuid) {


    }

    /**
     * 获得场景格式化后的数据
     */
    getSceneData() {

        const scene = this.scene;

        return new Object3DNode(scene).toModifyJSON();

    }

    getCameraData() {

    }

    getRendererData() {

    }

}