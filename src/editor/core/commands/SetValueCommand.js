import { Command } from '../../library';
import { Object3D } from 'three';
import { Editor } from "../Editor";



/**
 * 属性设置
 * 更新属性 针对Number， String等参数，且执行execute时无需执行其他操作
 */
export class SetValueCommand extends Command {

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

        this.type = 'SetValueCommand';

        this.name = `Set ${attributeName}`;

        this.updatable = true;

        this.reuseable = false;

        this.object = object;

        this.oldValue = (this.object !== undefined) ? this.object[attributeName] : undefined;
        this.newValue = newValue;

        this.attributeName = attributeName;



    }

    execute() {
        this.object[this.attributeName] = this.newValue;

        this.editorEM.objectChanged.dispatch(this.object);

    }

    undo() {

        this.object[this.attributeName] = this.oldValue;

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

