import { Command } from '../../library';
import { Editor } from "../Editor";
import * as QUARKS from "three.quarks";

const map = {
    grid: "GridEmitter",
    cone: "ConeEmitter",
    circle: "CircleEmitter",
    donut: "DonutEmitter",
    sphere: "SphereEmitter",
    point: "PointEmitter",
};
/**
 * 发射器形状设置
 */
export class SetParticleShapeCommand extends Command {

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

        this.type = 'SetParticleShapeCommand';

        this.name = `Set ${attributeName}`;

        this.updatable = false;

        this.reuseable = false;

        this.object = object;

        this.particleSystem = object.particleSystem;

        this.oldValue = (this.object !== undefined) ? object.shape : undefined;

        const shapeType = map[newValue];

        this.newValue = new QUARKS[shapeType]();

        this.attributeName = attributeName.split("_")[1];



    }

    execute() {
        this.particleSystem.emitterShape = this.newValue;

        this.editorEM.attributeChanged.dispatch(this.object.uuid);


    }

    undo() {

        this.particleSystem.emitterShape = this.oldValue;

        this.editorEM.attributeChanged.dispatch(this.object.uuid);

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

