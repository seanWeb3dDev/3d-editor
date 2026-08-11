import { Command } from '../../library';
import { Editor } from "../Editor";
import * as QUARKS from "three.quarks";


/**
 * 属性设置
 */
export class SetParticleColorCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {T} object 
     * @param {keyof T} attributeName 
     * @param {any} newValue 
     * @constructor
     */
    constructor(editor,object,attributeName,data) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetParticleColorCommand';

        this.name = `Set ${attributeName}`;

        this.updatable = true;

        this.reuseable = false;

        this.object = object;

        this.particleSystem = object.particleSystem;

        this.attributeName = attributeName.split("_")[1];

        this.oldValue = this.particleSystem.startColor;

        this.newValue = this.getNewValue(data);



    }

    execute() {
        this.particleSystem.startColor = this.newValue;

        if (this.attributeName === 'type') {
            this.editorEM.attributeChanged.dispatch(this.object.uuid);
        }


    }

    undo() {

        this.particleSystem.startColor = this.oldValue;

        if (this.attributeName === 'type') {
            this.editorEM.attributeChanged.dispatch(this.object.uuid);
        }



    }

    update(cmd) {
        this.newValue = this.getNewValue(cmd.value);
    }

    getNewValue(value) {

        const originType = this.object.startColor.type;

        const color = {
            a: this.oldValue.a ? new QUARKS.Vector3(...this.oldValue.a) : new QUARKS.Vector3(...this.oldValue.color),
            b: this.oldValue.b ? new QUARKS.Vector3(...this.oldValue.b) : new QUARKS.Vector3(...this.oldValue.color)
        };


        if (this.attributeName === 'type') {

            const type = value;

            return new QUARKS[type](color.a,color.b);
        } else {

            // attribute是a 或者 b
            color[this.attributeName] = new QUARKS.Vector3(...value);

            return new QUARKS[originType](color.a,color.b);
        }




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

