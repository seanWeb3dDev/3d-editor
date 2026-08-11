
import { Command } from '../../library';
import { Vector3,Object3D } from 'three';
import { Editor } from "../Editor";

/**
 * @param {Editor} editor 
 * @param {Object3D} object 
 * @param {Vector3} newPosition 
 * @param {Vector3} optionalOldPosition 
 * @constructor
 */
export class SetPositionCommand extends Command {
    constructor(editor,object,newPosition,optionalOldPosition) {
        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetPositionCommand';

        this.object = object;

        this.name = `set position`;

        this.updatable = true;

        this.reuseable = true;

        this.oldPosition = object !== undefined ? object.position.clone() : undefined;


        if (object !== undefined && newPosition !== undefined) {
            this.newPosition = newPosition.clone();

        }

        if (optionalOldPosition !== undefined) {

            this.oldPosition = optionalOldPosition.clone();

        }

    }
    execute() {
        this.object.position.copy(this.newPosition);
        this.object.updateMatrixWorld(true);
        this.editorEM.objectChanged.dispatch(this.object);


    }
    undo() {
        this.object.position.copy(this.oldPosition);
        this.object.updateMatrixWorld(true);
        this.editorEM.objectChanged.dispatch(this.object);


    }
    update(command) {

        this.newPosition.copy(command.newPosition);

    }
    toJSON() {
        const output = super.toJSON(this);
        output.newPosition = this.newPosition.toArray();

        return output;
    }

    fromJSON(json) {
        super.fromJSON(json);
        this.newPosition = new Vector3().fromArray(json.newPosition);

    }

}