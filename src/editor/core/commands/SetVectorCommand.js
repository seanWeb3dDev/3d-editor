import * as THREE from "three";
import { Editor } from '../Editor.js';
import { Command } from '../../library';

export class SetVectorCommand extends Command {
    /**
     * @param {Editor} editor 
     * @param {THREE.Object3D} object 
     * @param {THREE.Vector3} target 
     * @param {THREE.Vector3} newValue
     * @param {THREE.Vector3} oldValue 
     * @constructor
     */
    constructor(editor,object,target,newValue,oldValue) {

        super(editor);

        this.editorEM = editor.editorEM;
        this.type = 'SetVectorCommand';
        this.name = `Set Vector3`;
        this.updatable = true;

        this.reuseable = false;

        this.object = object;
        this.target = target;
        this.oldValue = oldValue !== undefined ? oldValue.clone() : undefined;

        this.newValue = newValue !== undefined ? newValue.clone() : undefined;
    }

    execute() {

        this.target.copy(this.newValue);

        if (this.object) {
            this.object.updateMatrixWorld(true);
            this.editorEM.objectChanged.dispatch(this.object);
        }

    }

    undo() {

        this.target.copy(this.oldValue);

        if (this.object) {
            this.object.updateMatrixWorld(true);
            this.editorEM.objectChanged.dispatch(this.object);
        }

    }

    update(cmd) {

        this.newValue.copy(cmd.newValue);

    }

    toJSON() {

        const output = super.toJSON(this);

        output.oldValue = this.oldValue;
        output.newValue = this.newValue;

        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);

        this.oldValue = json.oldValue;
        this.newValue = json.newValue;

    }

}


