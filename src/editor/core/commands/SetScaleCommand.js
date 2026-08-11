
import { Command } from '../../library';
import { Vector3,Object3D } from 'three';
import { Editor } from "../Editor";

/**
 * @param {Editor} editor 
 * @param {Object3D} object 
 * @param {Vector3} newScale THREE.Vector3
 * @param {Vector3} optionalOldScale THREE.Vector3
 * @constructor
 */
export class SetScaleCommand extends Command {
    constructor(editor,object,newScale,optionalOldScale) {
        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetScaleCommand';

        this.object = object;

        this.name = `set scale`;

        this.updatable = true;

        this.reuseable = true;

        this.oldScale = object !== undefined ? object.scale.clone() : undefined;

        if (object !== undefined && newScale !== undefined) {
            this.newScale = newScale.clone();

        }

        if (optionalOldScale !== undefined) {

            this.oldScale = optionalOldScale.clone();

        }

    }
    execute() {
        this.object.scale.copy(this.newScale);
        this.object.updateMatrixWorld(true);
        this.editorEM.objectChanged.dispatch(this.object);


    }
    undo() {
        this.object.scale.copy(this.oldScale);
        this.object.updateMatrixWorld(true);
        this.editorEM.objectChanged.dispatch(this.object);


    }
    update(command) {

        this.newScale.copy(command.newScale);

    }
    toJSON() {

        const output = super.toJSON(this);
        output.newScale = this.newScale.toArray();

        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);

        this.newScale = new Vector3().fromArray(json.newScale);

    }

}