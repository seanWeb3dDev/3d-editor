import { Command } from '../../library';

import { Editor } from "../Editor";



/**
 * 着色器材质中属性修改
 * 更新属性 针对Number， String等参数，且执行execute时无需执行其他操作
 */
export class SetUniformValueCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {T} material 
     * @param {keyof T} attributeName 
     * @param {any} newValue 
     * @constructor
     */
    constructor(editor,material,attributeName,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetUniformValueCommand';

        this.name = `Set Uniform ${attributeName}`;

        this.updatable = true;

        this.reuseable = false;

        this.material = material;

        this.uniforms = this.material.uniforms;

        this.oldValue = (this.material !== undefined) ? this.uniforms[attributeName].value : undefined;

        this.newValue = newValue;

        this.attributeName = attributeName;



    }

    execute() {
        this.uniforms[this.attributeName].value = this.newValue;

        this.editorEM.materialChanged.dispatch();

    }

    undo() {

        this.uniforms[this.attributeName].value = this.oldValue;

        this.editorEM.materialChanged.dispatch();

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

