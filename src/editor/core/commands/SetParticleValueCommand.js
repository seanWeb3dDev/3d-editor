import { Command } from '../../library';
import { Editor } from "../Editor";
import * as QUARKS from "three.quarks";


/**
 * 属性设置
 */
export class SetParticleValueCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {T} object 
     * @param {keyof T} attributeName 
     * @param {any} newValue 
     * @constructor
     */
    constructor(editor,object,attributeName,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetParticleValueCommand';

        this.name = `Set ${attributeName}`;

        this.updatable = false;

        this.reuseable = false;

        this.object = object;

        this.particleSystem = object.particleSystem;

        this.setting = (this.object !== undefined) ? this.object[attributeName] : undefined;

        this.type = (this.setting !== undefined) ? this.setting.type : undefined;

        this.oldValue = this.particleSystem[attributeName];

        const data = Array.isArray(newValue) ? newValue : [newValue];

        this.newValue = new QUARKS[this.type](...data);

        this.attributeName = attributeName;

    }

    execute() {
        this.particleSystem[this.attributeName] = this.newValue;

        this.editorEM.objectChanged.dispatch(this.object);

    }

    undo() {

        this.particleSystem[this.attributeName] = this.oldValue;

        this.editorEM.objectChanged.dispatch(this.object);

    }

    update(cmd) {


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

