import { Command } from '../../library';
import { Object3D } from 'three';
import { Editor } from "../Editor";



export class SetConfigCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {T} setting 
     * @param {keyof T} attributeName 
     * @param {any} newValue 
     * @constructor
     */
    constructor(editor,setting,attributeName,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetConfigCommand';

        this.name = `Set ${attributeName}`;

        this.updatable = true;

        this.reuseable = false;

        this.setting = setting;

        this.oldValue = (this.object !== undefined) ? this.setting[attributeName] : undefined;
        this.newValue = newValue;

        this.attributeName = attributeName;



    }

    execute() {
        this.setting[this.attributeName] = this.newValue;

        this.editorEM.configChanged.dispatch(this.attributeName,this.newValue);
        this.editorEM.sceneGraphChanged.dispatch();

    }

    undo() {

        this.setting[this.attributeName] = this.oldValue;

        this.editorEM.objectChanged.dispatch(this.object);

    }

    update(cmd) {

        this.newValue = cmd.newValue;

    }


    toJSON() {

        const output = super.toJSON(this);

        output.attributeName = this.attributeName;
        output.newValue = this.newValue;

        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);

        this.attributeName = json.attributeName;
        this.newValue = json.newValue;

    }

}

