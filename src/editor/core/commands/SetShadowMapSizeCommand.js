import * as THREE from "three";
import { Editor } from '../Editor.js';
import { Command } from '../../library';

export class SetShadowMapSizeCommand extends Command {
    /**
     * @param {Editor} editor 
     * @param {THREE.LightShadow} shadow 
     * @param {THREE.Vector3} newValue
     * @param {THREE.Vector3} oldValue 
     * @constructor
     */
    constructor(editor,shadow,newValue,oldValue) {

        super(editor);

        this.editorEM = editor.editorEM;
        this.type = 'SetShadowMapSizeCommand';
        this.name = `Set Vector3`;
        this.updatable = true;

        this.reuseable = false;

        this.shadow = shadow;

        this.oldValue = oldValue !== undefined ? oldValue.clone() : undefined;

        this.newValue = newValue !== undefined ? newValue.clone() : undefined;
    }

    execute() {

        this.shadow.mapSize.copy(this.newValue);
        this.shadow.map.setSize(this.newValue.x,this.newValue.y);
        this.editorEM.sceneGraphChanged.dispatch();


    }

    undo() {

        this.shadow.mapSize.copy(this.oldValue);
        this.shadow.map.setSize(this.oldValue.x,this.oldValue.y);
        this.editorEM.sceneGraphChanged.dispatch();


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


