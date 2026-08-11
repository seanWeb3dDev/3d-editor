import { Command } from '../../library';

import { Editor } from "../Editor";
import { getColorString } from '../Util';



/**
 * 着色器材质内color属性修改
 */
export class SetUniformColorCommand extends Command {

    /**
     * @template T
     * @param {Editor} editor 
     * @param {T} material 
     * @param {Color} newValue 
     * @constructor
     */
    constructor(editor,material,attribute,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetUniformColorCommand';

        this.name = `Set Uniform Color`;

        this.updatable = true;

        this.reuseable = false;

        this.material = material;

        this.uniforms = this.material.uniforms;

        this.oldValue = (this.material !== undefined) ? getColorString(this.uniforms[attribute].value) : undefined;

        this.newValue = newValue;

        this.attribute = attribute;



    }

    execute() {
        this.uniforms[this.attribute].value.set(this.newValue);

        this.editorEM.materialChanged.dispatch();

    }

    undo() {

        this.uniforms[this.attribute].value.set(this.oldValue);

        this.editorEM.materialChanged.dispatch();

    }

    update(cmd) {

        this.newValue = cmd.newValue;

    }


    toJSON() {

        const output = super.toJSON(this);

        output.newValue = this.newValue;

        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);
        this.newValue = json.newValue;

    }

}

