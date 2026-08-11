import { Command } from '../../library';
import { Editor } from "../Editor";
import * as QUARKS from "three.quarks";
import { getParticleValue } from '../Util';


/**
 * 属性设置
 */
export class SetParticleBehaviorValueCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {T} object 
     * @param {keyof T} index 
     * @param {Array} attributeName 
     * @param {any} newValue 
     * @constructor
     */
    constructor(editor,object,index,attributeName,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetParticleBehaviorValueCommand';

        this.updatable = false;

        this.reuseable = false;

        this.object = object;

        this.behaviors = object.behaviors;

        this.behavior = this.behaviors[index];

        this.target = this.behavior;

        this.name = `Set ${this.behavior.type}`;

        if (attributeName.length === 1) {
            this.attributeName = attributeName[0];

        } else {
            for (let i = 0; i < attributeName.length - 1; i++) {
                this.target = this.target[attributeName[i]];
            }
            this.attributeName = attributeName.pop();
        }

        this.setting = (this.object !== undefined) ? getParticleValue(this.target[this.attributeName]) : undefined;

        this.type = (this.setting !== undefined) ? this.setting.type : undefined;

        this.oldValue = this.target[this.attributeName];

        const data = Array.isArray(newValue) ? newValue : [newValue];


        this.newValue = this.type ? new QUARKS[this.type](...data) : newValue;


    }

    execute() {
        this.target[this.attributeName] = this.newValue;

        this.editorEM.objectChanged.dispatch(this.object);

    }

    undo() {

        this.target[this.attributeName] = this.oldValue;

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

