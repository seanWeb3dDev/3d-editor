import { Command } from '../../library';
import { Editor } from "../Editor";



/**
 * 属性设置
 */
export class SetGlobalValueCommand extends Command {

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

        this.type = 'SetGlobalValueCommand';

        this.name = `Set global ${attributeName}`;

        this.updatable = true;

        this.reuseable = false;

        this.object = object;

        this.oldValue = (this.object !== undefined) ? this.object[attributeName] : undefined;
        this.newValue = newValue;

        this.attributeName = attributeName;



    }

    execute() {
        this.object[this.attributeName] = this.newValue;

        this.editor.config.setKey(this.attributeName,this.newValue);

        this.editorEM.sceneGraphChanged.dispatch(this.object);

    }

    undo() {

        this.object[this.attributeName] = this.oldValue;

        this.editor.config.setKey(this.attributeName,this.oldValue);

        this.editorEM.sceneGraphChanged.dispatch(this.object);

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

