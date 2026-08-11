import { AddObjectCommand } from "../commands";
import { Memory } from "../../library";

import * as THREE from "three";
import { HelperLine } from "../HelperLine";


class HelperLineProcessPlugin {

    constructor(executor) {
        this.executor = executor;
        this.lines = [];
    }

    process(object) {

        const userData = object.userData;

        if (userData.isHelperLine) {

            this.lines.push(object);

        }
    }

    afterProcess(scene) {


        if (this.lines.length === 0) return;



        this.lines.forEach((line) => {
            const userData = line.userData;

            const parent = line.parent;
            parent.remove(line);

            let newLine = null;

            if (userData.isHelperLine) {

                newLine = new HelperLine(userData.lineSetting);
                newLine.name = line.name;
                line.matrix.decompose(newLine.position,newLine.quaternion,newLine.scale);
            }

            if (newLine) {
                parent.add(newLine);
            }

        });

        this.lines = null;



        const editor = this.executor.editor;

        this.executor.setAction(
            function () {


                editor.loadLength += scene.children.length;

                for (let i = scene.children.length - 1; i >= 0; i--) {

                    editor.loadLength--;

                    const target = scene.children[i];


                    editor.execute(new AddObjectCommand(editor,target,editor.helperLineGroup));


                }

            }

        );

    }

}


export { HelperLineProcessPlugin };