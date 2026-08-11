import { Command } from '../../library';
import { Material } from 'three';
import { Editor } from "../Editor";


export class SetMaterialValueCommand extends Command {

    /**
     * @param {Editor} editor Editor
     * @param {Material} material THREE.Material
     * @param {keyof Material} attributeName string
     * @param {boolean|number|string} newValue number, string, boolean or object
     * @param {number|} materialSlot 材质索引
     * @constructor
     */
    constructor(editor,material,attributeName,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetMaterialValueCommand';

        this.name = `Set Material.${attributeName}`;

        this.updatable = true;

        this.reuseable = true;



        this.material = material;
        this.oldValue = (this.material !== undefined) ? this.material[attributeName] : undefined;
        this.newValue = newValue;

        this.attributeName = attributeName;



    }

    execute() {

        this.material[this.attributeName] = this.newValue;
        this.material.needsUpdate = true;

        this.editorEM.materialChanged.dispatch();

    }

    undo() {

        this.material[this.attributeName] = this.oldValue;
        this.material.needsUpdate = true;

        this.editorEM.materialChanged.dispatch();

    }

    update(cmd) {

        this.newValue = cmd.newValue;

    }

    // todo 多维材质的模型 逻辑需要完善
    /**修改选择多维材质模型的指定材质 */
    setMaterialSlot(slot) {
        this.material = this.editor.getObjectMaterial(editor.selected,slot);
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

