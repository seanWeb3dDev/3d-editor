import { Command } from '../../library';
import { Object3D,ObjectLoader } from 'three';
import { Editor } from "../Editor";

/**添加3D对象进scene，不包含line和mark */
export class AddObjectCommand extends Command {
    /**
 * @param {Editor} editor Editor
 * @param {Object3D} object THREE.Object3D
 * @constructor
 */
    constructor(editor,object,parent = undefined,index) {
        super(editor);

        this.type = 'AddObjectCommand';
        this.name = 'add Object';

        this.object = object;

        this.parent = parent;

        this.index = index;

        if (object !== undefined) {

            this.name = `Add Object: ${object.name}`;

        }

    }
    execute() {

        this.editor.addObject(this.object,this.parent,this.index);


    }
    undo() {

        this.editor.removeObject(this.object);


    }
    toJSON() {

    }

}