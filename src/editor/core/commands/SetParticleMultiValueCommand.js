import { Command } from '../../library';
import { Editor } from "../Editor";
import * as QUARKS from "three.quarks";


/**
 * 属性设置
 */
export class SetParticleMultiValueCommand extends Command {

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

        this.type = 'SetParticleMultiValueCommand';

        this.name = `Set ${attributeName}`;

        this.updatable = true;

        this.reuseable = false;

        this.object = object;

        this.particleSystem = object.particleSystem;

        const values = attributeName.split("_");

        this.firstAttr = values[0];

        this.attributeName = values[1];

        this.oldValue = this.particleSystem[this.firstAttr];

        this.newValue = this.getNewValue(data);




    }

    execute() {
        this.particleSystem[this.firstAttr] = this.newValue;

        if (this.attributeName === 'type') {
            this.editorEM.attributeChanged.dispatch(this.object.uuid);
        }


    }

    undo() {

        this.particleSystem[this.firstAttr] = this.oldValue;

        if (this.attributeName === 'type') {
            this.editorEM.attributeChanged.dispatch(this.object.uuid);
        }



    }

    update(cmd) {
        this.newValue = this.getNewValue(cmd.value);
    }

    setValue() {
        if (this.firstAttr.includes("startColor")) {

        }
    }

    getNewValue(value) {

        if (this.firstAttr.includes("startColor")) {

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

        if (this.firstAttr.includes('startRotation')) {

            return new QUARKS[value](0);

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

