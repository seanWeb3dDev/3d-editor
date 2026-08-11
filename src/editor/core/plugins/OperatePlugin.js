import { exportGLTF } from "@/editor/library/Exporter";
import { checkObjectType,inModelGroup } from "../Util";
import { AddObjectCommand,RemoveObjectCommand } from "../commands";
import { createHelperDot } from "../HelperLine";
import { PipeGeometry } from "../geometry/PipeGeometry";
import { createMesh } from "../GeometryManager";
import { createText } from "../Text";
import { ParticleEmitter } from "../Particle";
import * as THREE from "three";


/**
 * 右键快捷操作插件
 */
export class OperatePlugin {

    constructor(editor) {

        this.editor = editor;
        this.editorEM = editor.editorEM;
        this.format = editor.format;
        this.name = "OperatePlugin";

        this.map = new Map();

        this.addChild = new AddChild(this);
        this.map.set('addChild',this.addChild);
        this.batchOperate = new BatchOperate(this);
        this.map.set('batchOperate',this.batchOperate);
        this.duplicate = new Duplicate(this);
        this.map.set('duplicate',this.duplicate);
        this.delete = new Delete(this);
        this.map.set('delete',this.delete);
        this.generate = new Generate(this);
        this.map.set('generate',this.generate);
        // this.eventPlugin = new EventPlugin(this);
        // this.map.set('eventPlugin',this.eventPlugin);
        this.export = new ExportGLB(this);
        this.map.set('export',this.export);




    }

    /**右键选择某个资源获取可操作的功能列表 */
    getOperateList(uuid) {
        const list = [];
        this.map.forEach((plugin) => {
            const item = plugin.getOperateList(uuid);


            if (item) {
                list.push(...item);
            }
        });

        return list;
    }

    getOperation(name) {
        return this.map.get(name);
    }

    execute(...args) {

        // 定位 
        const name = args[0].split("_")[0];

        // 执行
        const operation = this.getOperation(name);
        operation.execute(...args);
    };
}

class BatchOperate {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.name = 'batchOperate';
    }

    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;

        return node.toOperateList(this.name);
    }

    execute(...args) {

        const [index,...param] = args;

        const seq = index.split("_");

        if (seq.includes("castShadow") || seq.includes("receiveShadow")) {
            const attr = seq[1];
            const value = param[0];
            const object = this.node.object;
            const target = this.editor.selected;

            object.traverse(child => {

                child[attr] = value;

                if (target && target.uuid === child.uuid) {

                    const node = this.format.getNodeModifyJSON(target.uuid);

                    this.editor.callbackList.selected(node);

                }
            });

            return;

        }




        if (param.includes("pipe")) {

            const object = this.node.object;

            const points = object.getPointList();

            const pipe = createMesh('PipeGeometry',[points]);

            object.getWorldPosition(pipe.position);

            this.editor.execute(new AddObjectCommand(this.editor,pipe));


        }

    }

    setCastShadow(value) {
    }
    setReceiveShadow(value) {
    }
}

class Delete {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.name = 'delete';

    }

    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;
        const deleteOperate = {
            label: '删除',
            value: 'delete'
        };
        return [deleteOperate];
    }
    execute(...args) {

        const target = this.node.object;
        this.node = null;

        this.editor.execute(new RemoveObjectCommand(this.editor,target));


    }
}
class Duplicate {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.name = 'duplicate';
    }
    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;

        const object = this.node.object;

        //点不可复制只能插入

        if (checkObjectType(object,["isHelperDot"])) return [];
        if (checkObjectType(object,["isReflector"])) return [];

        // 此处区分mesh mesh新增绝对复制

        if (checkObjectType(object,["isMesh","isGroup"]) && inModelGroup(object)) {

            const arr = [
                {
                    label: '复制',
                    value: 'duplicate',
                    list: [
                        {
                            label: '复制',
                            value: 'duplicate',
                        },
                        {
                            label: '深度复制',
                            value: 'duplicate_deep',
                        },
                    ]
                }
            ];
            return arr;
        }

        const duplicateOperate = {
            label: '复制',
            value: 'duplicate'
        };
        return [duplicateOperate];
    }
    execute(...args) {

        const target = this.node.object;
        const uuid = target.uuid;
        this.node = null;

        if (args[1] === "duplicate_deep") {
            //深度复制 也就是对材质进行复制
            this.editorEM.duplicate.dispatch(uuid,0,true);
        } else {
            this.editorEM.duplicate.dispatch(uuid);
        }





    }
}
class ExportGLB {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.sceneUuid = this.editor.scene.uuid;
        this.target = null;
        this.name = 'exportGLB';

    }
    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;


        const object = this.node.object;

        let operate = null;
        if (object.parent.uuid === this.sceneUuid) {

            operate = {
                label: '导出glb',
                value: 'export'
            };
            this.target = object;
        }

        if (checkObjectType(object,["isText"])) {
            operate = {
                label: '导出文本组',
                value: 'export'
            };

            this.target = this.editor.textGroup;

        }
        if (checkObjectType(object,["isLight"])) {
            operate = {
                label: '导出灯光组',
                value: 'export'
            };
            this.target = this.editor.lightGroup;

        }
        if (checkObjectType(object,["isParticle"])) {
            operate = {
                label: '导出粒子组',
                value: 'export'
            };
            this.target = this.editor.particleGroup;

        }
        if (checkObjectType(object,["isHelperLine"])) {
            operate = {
                label: '导出辅助线',
                value: 'export'
            };
            this.target = this.editor.helperLineGroup;

        }

        return operate ? [operate] : null;
    }
    execute() {
        exportGLTF(this.target);
        this.target = null;
        this.node = null;

    }
}

/**
 * 新增子资源
 */
class AddChild {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.target = null;
        this.name = 'addChild';

    }

    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;
        this.target = this.node.object;

        if (this.target.name.includes("孪生体制作专用")) {
            return [
                {
                    label: '添加文本',
                    value: 'addChild'
                }
            ];
        }
        return node.toOperateList(this.name);
    }
    execute(...args) {

        const object = this.target;
        if (checkObjectType(object,["isHelperLine"])) {
            const object = this.target;
            const dot = createHelperDot(object);

            const group = object.dotGroup;
            const index = object.getDotsLength();
            this.editor.execute(new AddObjectCommand(this.editor,dot,group,index));
        }

        if (checkObjectType(object,["isHelperDot"])) {
            const dot = object.clone();
            const group = object.parent;


            object.position.clone(dot.position);

            const index = group.children.indexOf(object);
            this.editor.execute(new AddObjectCommand(this.editor,dot,group,index + 1));

        }

        if (object.name.includes("孪生体制作专用")) {
            this.editor.execute(new AddObjectCommand(this.editor,createText(),object));
        }

    }
}

class Generate {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.name = 'generate';
    }

    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;
        return node.toOperateList(this.name);
    }

    execute(...args) {

        const [index,type] = args;

        const object = this.node.object;

        if (checkObjectType(object,["isHelperLine"])) {

            this.generateByHelperLine(object,type);

            return;
        }

        if (checkObjectType(object,["isLight"])) {
            const lightType = index.split("_")[1];

            let light;

            if (lightType === "DirectionalLight") {
                light = new THREE.DirectionalLight(0xffffff,1.5);
                light.castShadow = true;
                light.position.set(15,30,-30);
                const shadow = light.shadow;

                if (type === 'high') {
                    light.name = "高精直线光";
                    shadow.camera.near = 1;
                    shadow.camera.far = 500;
                    shadow.camera.right = 500;
                    shadow.camera.left = -500;
                    shadow.camera.top = 500;
                    shadow.camera.bottom = -500;
                    shadow.mapSize.width = 4096;
                    shadow.mapSize.height = 4096;
                    shadow.blurSamples = 16;
                    shadow.normalBias = 0.1;
                    shadow.bias = -0.0011;
                    shadow.radius = 0.25;
                }
                if (type === 'medium') {
                    light.name = "标准直线光";
                    shadow.camera.near = 1;
                    shadow.camera.far = 500;
                    shadow.camera.right = 500;
                    shadow.camera.left = -500;
                    shadow.camera.top = 500;
                    shadow.camera.bottom = -500;
                    shadow.mapSize.width = 1024;
                    shadow.mapSize.height = 1024;
                    shadow.blurSamples = 8;
                    shadow.normalBias = 0;
                    shadow.bias = -0.003;
                    shadow.radius = 1;
                }
                if (type === 'room') {
                    light.name = "小场景直线光";
                    shadow.camera.near = 1;
                    shadow.camera.far = 200;
                    shadow.camera.right = 50;
                    shadow.camera.left = -50;
                    shadow.camera.top = 50;
                    shadow.camera.bottom = -50;
                    shadow.mapSize.width = 512;
                    shadow.mapSize.height = 512;
                    shadow.blurSamples = 8;
                    shadow.normalBias = 0;
                    shadow.bias = -0.002;
                    shadow.radius = 0.65;
                }

            }

            if (lightType === "SpotLight") {
                light = new THREE.SpotLight(0xffffff,30);
                light.castShadow = true;
                const shadow = light.shadow;
                light.distance = 100;

                if (type === 'normal') {
                    light.name = "范围光";
                    light.position.set(-30,40,10);
                    const target = light.target;
                    target.position.set(1,-1,-0.2);
                    light.targetProcess(target);

                    light.penumbra = 0.745;
                    light.decay = 0.5;
                    shadow.blurSamples = 8;
                    shadow.bias = -0.00011;
                    shadow.radius = 0.75;

                }

                if (type === 'spot') {
                    light.name = "射灯";
                    light.position.set(0,40,0);
                    light.angle = 0.84;
                    const target = light.target;
                    target.position.y = -1;
                    light.targetProcess(target);

                    light.penumbra = 0;
                    light.decay = 0.3;
                    shadow.blurSamples = 8;
                    shadow.bias = -0.00011;
                    shadow.radius = 0.75;
                }

            }

            this.editor.execute(new AddObjectCommand(this.editor,light,this.editor.lightGroup));

            return;

        }


    }

    generateByHelperLine(object,type) {
        if (type === 'pipe') {


            const points = object.getPointList();

            const pipe = createMesh('PipeGeometry',[points]);

            object.getWorldPosition(pipe.position);

            this.editor.execute(new AddObjectCommand(this.editor,pipe));


        }

        if (type === 'path') {

            const points = object.getPointList();

            const path = createMesh('ArrowPathGeometry',[points]);

            object.getWorldPosition(path.position);

            path.name = "路径";

            this.editor.execute(new AddObjectCommand(this.editor,path));
        }

        if (type === 'arrow') {


            const points = object.getPointList();

            const arrow = createMesh('ArrowPathGeometry',[points,true,'both']);

            arrow.name = "箭头";

            object.getWorldPosition(arrow.position);

            this.editor.execute(new AddObjectCommand(this.editor,arrow));
        }

        if (type === 'particle') {

            const particle = new ParticleEmitter();

            const position = object.getFirstDotWorldPosition();
            particle.position.copy(position);

            const dotList = object.getDots();
            if (dotList.length > 1) {
                const target = dotList[dotList.length - 1].getWorldPosition(new THREE.Vector3());
                particle.lookAt(target);
            }





            this.editor.execute(new AddObjectCommand(this.editor,particle,this.editor.particleGroup));
        }
    }

}

class EventPlugin {
    constructor(manager) {
        this.manager = manager;
        this.editor = manager.editor;
        this.editorEM = manager.editorEM;
        this.format = manager.format;
        this.node = null;
        this.target = null;
        this.name = 'eventPlugin';
        this.copyEvents = [];
        this.copyState = {};

    }

    getOperateList(uuid) {
        const node = this.format.get(uuid);
        this.node = node;
        this.target = this.node.object;

        return node.toOperateList(this.name);
    }
    execute(...args) {

        const object = this.target;

        if (!object.userData.hasOwnProperty('eventList')) {

            object.userData.eventList = [];

        }

        const eventList = object.userData.eventList;

        const [index,...param] = args;



        if (index.includes("addEvent")) {
            const data = param[0].split("_");

            const trigger = data[0];

            const action = data[1];

            const followingEvent = data[2];

            const setting = {
                trigger: trigger,
                action: action
            };

            if (trigger === "socket") {
                setting.cmd = "请输入关键字";
            }

            if (action === "stateChange") {
                setting.state = "";
                setting.value = "";
            }
            if (action === "postMessage") {
                setting.actionCmd = "请输入关键字";
                setting.postState = "";
            }

            if (followingEvent === "attributeChange") {
                setting.follow = [
                    {
                        trigger: "followingEvent",
                        action: "attributeChange",
                        attribute: "",
                        rule: {}
                    }
                ];

            }

            eventList.push(setting);

            const selected = this.editor.selected;

            if (selected !== object) {

                this.editor.select(object);
            } else {

                this.editorEM.attributeChanged.dispatch(object.uuid);
            }

            this.editor.callbackList.updateSceneData({
                uuid: object.uuid,
                key: "hasEvent",
                value: true
            });



        }

        if (param[0] === "copyEvent") {
            this.copyEvents = JSON.parse(JSON.stringify(eventList));

        }
        if (param[0] === "pasteEvent") {

            if (this.copyEvents.length === 0) return;

            this.copyEvents.forEach((e) => {
                const event = JSON.parse(JSON.stringify(e));
                eventList.push(event);
            });

            const selected = this.editor.selected;

            if (selected !== object) {

                this.editor.select(object);
            } else {

                this.editorEM.attributeChanged.dispatch(object.uuid);
            }

            this.editor.callbackList.updateSceneData({
                uuid: object.uuid,
                key: "hasEvent",
                value: true
            });
        }

        if (param[0] === "copyState") {
            const stateList = object.userData.state;
            if (stateList) {
                this.copyState = JSON.parse(JSON.stringify(stateList));
            }

        }
        if (param[0] === "pasteState") {
            if (Object.keys(this.copyState).length === 0) return;


            object.userData.state = JSON.parse(JSON.stringify(this.copyState));

            const selected = this.editor.selected;

            if (selected !== object) {

                this.editor.select(object);
            } else {

                this.editorEM.attributeChanged.dispatch(object.uuid);
            }





        }



    }
}