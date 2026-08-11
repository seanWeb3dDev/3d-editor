import { Command } from '../../library';
import { Object3D } from 'three';
import { Editor } from "../Editor";
import * as GEOMETRY from "../geometry";

export class SetGeometryCommand extends Command {

    /**
     * @param {Editor} editor Editor
     * @param {Object3D} object THREE.Object3D
     * @param {BufferGeometry} newGeometry 几何体
     * @constructor
     */
    constructor(editor,object,attribute,value) {

        super(editor);

        this.editorEM = editor.editorEM;

        this.type = 'SetGeometryCommand';

        this.name = `Set Geometry`;

        this.object = object;

        this.parameters = this.object.geometry.parameters;

        this.oldGeometry = this.object.geometry;

        this.attribute = attribute;

        this.newValue = value;

        this.oldValue = this.parameters[this.attribute];

    }

    execute() {


        this.parameters[this.attribute] = this.newValue;

        const data = this.object.geometry.toParam();

        const geo = new GEOMETRY[data.type](...data.param);

        this.object.geometry.dispose();

        this.object.geometry = geo;

        this.object.geometry.computeBoundingSphere();

        const geoData = geo.toParam ? geo.toParam() : undefined;

        this.object.userData.geometry = geoData;

        this.editorEM.geometryChanged.dispatch(this.object);


    }

    undo() {

        this.parameters[this.attribute] = this.oldValue;

        this.object.geometry.dispose();

        this.object.geometry = this.oldGeometry;

        this.object.geometry.computeBoundingSphere();

        const geoData = this.oldGeometry.toParam ? this.oldGeometry.toParam() : undefined;

        this.object.userData.geometry = geoData;

        this.editorEM.geometryChanged.dispatch(this.object);

    }

    update(cmd) {

        this.newGeometry = cmd.newGeometry;

    }





    toJSON() {

        const output = super.toJSON(this);



        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);



    }

}

