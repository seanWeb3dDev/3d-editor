import { Command } from '../../library';
import { Material } from 'three';
import { Editor } from "../Editor";


export class SetMaterialMapValueCommand extends Command {

    /**
     * @param {Editor} editor Editor
     * @param {Material} material THREE.Material
     * @param {keyof Material} attributeName string
     * @param {boolean|number|string} newValue number, string, boolean or object
     * @param {number|} materialSlot 材质索引
     * @constructor
     */
    constructor(editor,map,attributeName,newValue) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetMaterialMapValueCommand';

        this.name = `Set Map.${attributeName}`;

        this.updatable = true;

        this.reuseable = false;


        this.map = map;

        this.oldValue = (this.map !== undefined) ? this.map[attributeName] : undefined;
        this.newValue = newValue;

        this.attributeName = attributeName;



    }

    execute() {

        this.map[this.attributeName] = this.newValue;

        this.map.needsUpdate = true;

        this.editorEM.materialChanged.dispatch();

    }

    undo() {

        this.map[this.attributeName] = this.oldValue;

        this.map.needsUpdate = true;

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

