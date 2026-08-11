import { Command } from '../../library';
import { Object3D } from 'three';
import { Editor } from "../Editor";

/**
 * 插入mark时，要关注是用来做单一标记，还是路径上的其中一个节点
 * 还有该mark会存入哪个group中，存入的group取决于当前激活了哪个插入功能
 */
export class AddMarkCommand extends Command {
    /**
 * @param {Editor} editor Editor
 * @param {Object3D} object THREE.Object3D
 * @constructor
 */
    constructor(editor,object,parent) {
        super(editor);

        this.type = 'AddMarkerCommand';
        this.name = 'add Marker';

        this.object = object;
        this.parent = parent || editor.sceneMarks;

        if (object !== undefined) {

            this.name = `Add Object: ${object.name}`;

        }

    }
    execute() {

        this.editor.addObject(this.object,this.parent);

    }
    undo() {

        this.editor.removeObject(this.object);
        this.editor.deselect();
    }
    toJSON() {

    }

}