import { Command } from '../../library';
import { Object3D,ObjectLoader } from 'three';
import { Editor } from "../Editor";

/**移动三维对象*/
export class LockObjectCommand extends Command {
    /**
 * @param {Editor} editor Editor
 * @param {Object3D} object THREE.Object3D
 * @constructor
 */

    constructor(editor,node,value) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'LockObjectCommand';

        this.name = 'lock Object';

        this.node = node;

        this.oldValue = node.object.isLocked;

        this.newValue = value;


    }
    execute() {

        this.editorEM.lockObject.dispatch(this.node,this.newValue);

    }
    undo() {

        this.editorEM.lockObject.dispatch(this.node,this.oldValue);

    }
    toJSON() {

    }

}