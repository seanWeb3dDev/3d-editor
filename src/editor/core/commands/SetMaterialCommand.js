import { Command } from '../../library';
import { Object3D } from 'three';
import { Editor } from "../Editor";


export class SetMaterialCommand extends Command {

    /**
     * @param {Editor} editor Editor
     * @param {Object3D} object THREE.Object3D
     * @param {Material} newMaterial 材质
     * @param {number|} materialSlot 材质索引
     * @constructor
     */
    constructor(editor,object,newMaterial,materialSlot = 0) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetMaterialCommand';

        this.name = `Set Material`;

        this.object = object;

        this.materialSlot = materialSlot;

        this.oldMaterial = this.editor.getObjectMaterial(object,materialSlot);

        this.newMaterial = newMaterial;


    }

    execute() {

        this.editor.setObjectMaterial(this.object,this.materialSlot,this.newMaterial);

        this.editorEM.materialReplaced.dispatch(this.object);


    }

    undo() {

        this.editor.setObjectMaterial(this.object,this.materialSlot,this.oldMaterial);

        this.editorEM.materialReplaced.dispatch(this.object);


    }




    toJSON() {

        const output = super.toJSON(this);



        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);



    }

}

