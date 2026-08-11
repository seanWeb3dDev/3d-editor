
import { Command } from '../../library';
import { Object3D,Euler } from 'three';
import { Editor } from "../Editor";

/**
 * @param {Editor} editor 
 * @param {Object3D} object 
 * @param {Euler} newRotation THREE.Euler
 * @param {Euler} optionalOldRotation THREE.Euler
 * @constructor
 */
export class SetRotationCommand extends Command {
    constructor(editor,object,newRotation,optionalOldRotation) {
        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetRotationCommand';

        this.object = object;

        this.name = `set rotation`;

        this.updatable = true;

        this.reuseable = true;

        this.oldRotation = object !== undefined ? object.rotation.clone() : undefined;

        if (object !== undefined && newRotation !== undefined) {

            this.newRotation = newRotation.clone();

        }

        if (optionalOldRotation !== undefined) {

            this.oldRotation = optionalOldRotation.clone();

        }

    }
    execute() {

        this.object.rotation.copy(this.newRotation);
        this.object.updateMatrixWorld(true);
        this.editorEM.objectChanged.dispatch(this.object);


    }
    undo() {
        this.object.rotation.copy(this.oldRotation);
        this.object.updateMatrixWorld(true);
        this.editorEM.objectChanged.dispatch(this.object);


    }
    update(command) {

        this.newRotation.copy(command.newRotation);

    }
    toJSON() {
        const output = super.toJSON(this);
        output.newRotation = this.newRotation.toArray();

        return output;
    }

    fromJSON(json) {

        super.fromJSON(json);
        this.newRotation = new Euler().fromArray(json.newRotation);
    }

}