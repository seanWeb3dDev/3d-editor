import { Command } from '../../library';
import { Object3D,ObjectLoader } from 'three';
import { Editor } from "../Editor";

/**移动三维对象*/
export class MoveObjectCommand extends Command {
    /**
 * @param {Editor} editor Editor
 * @param {Object3D} object THREE.Object3D
 * @constructor
 */

    constructor(editor,object,newParent,newIndex) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'MoveObjectCommand';

        this.name = 'move Object';

        this.object = object;

        this.oldParent = (object !== undefined) ? object.parent : undefined;

        this.oldIndex = (this.oldParent !== undefined) ? this.oldParent.children.indexOf(this.object) : undefined;

        this.newParent = newParent;

        this.newIndex = newIndex;


    }
    execute() {
        this.oldParent.remove(this.object);

        const children = this.newParent.children;
        children.splice(this.newIndex,0,this.object);
        this.object.parent = this.newParent;

        this.editorEM.sceneGraphChanged.dispatch();

    }
    undo() {

        this.newParent.remove(this.object);

        const children = this.oldParent.children;
        children.splice(this.oldIndex,0,this.object);
        this.object.parent = this.oldParent;

        const uuid = this.object.uuid;

        // 通知前端更新树结构 先通知删除然后再通知增加
        this.editor.callbackList.delete(uuid);
        const node = this.editor.getNodeByUuid(uuid);
        const json = node.toJSON();
        // 保证 parent 字段是 UUID 字符串（Three.js toJSON 已序列化），与前端 loadInfo 约定一致
        json.parent = this.object.parent ? this.object.parent.uuid : null;
        this.editor.callbackList.modelData(json,this.oldIndex);


        this.editorEM.sceneGraphChanged.dispatch();

    }
    toJSON() {

    }

}