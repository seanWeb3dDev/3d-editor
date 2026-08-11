import { Command } from '../../library';
import { Object3D,ObjectLoader } from 'three';
import { Editor } from "../Editor";

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
export class RemoveObjectCommand extends Command {

    constructor(editor,object) {

        super(editor);

        this.type = 'RemoveObjectCommand';
        this.name = 'Remove Object';

        this.object = object;
        this.parent = (object !== undefined) ? object.parent : undefined;
        if (this.parent !== undefined) {

            this.index = this.parent.children.indexOf(this.object);

        }

    }

    execute() {

        this.editor.removeObject(this.object);


    }

    undo() {

        this.editor.addObject(this.object,this.parent,this.index);


    }

    toJSON() {



    }

    fromJSON(json) {


    }

}

