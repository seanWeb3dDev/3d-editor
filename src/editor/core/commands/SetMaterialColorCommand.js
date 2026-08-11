import { Command } from '../../library';
import { Material } from 'three';
import { Editor } from "../Editor";
import { getColorString } from '../Util';


export class SetMaterialColorCommand extends Command {

    /**
     * @param {Editor} editor Editor
     * @param {Material} material THREE.Material
     * @param {[]} newValue Array
     * @constructor
     */
    constructor(editor,material,attr,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetMaterialColorCommand';

        this.name = `Set Material.color`;

        this.updatable = true;
        this.reuseable = true;

        this.attr = attr;


        this.material = material;
        this.oldValue = (this.material !== undefined) ? getColorString(this.material[attr]) : undefined;
        this.newValue = newValue;




    }

    execute() {

        this.material[this.attr].set(this.newValue);

        this.editorEM.materialChanged.dispatch();

    }

    undo() {

        this.material[this.attr].set(this.oldValue);

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
