import { Command } from '../../library';

import * as Util from "../Util";



// todo 未完成
class SetMapCommand extends Command {
    /**
     * @param editor Editor
     * @param object THREE.Object3D
     * @param mapName string
     * @param newMap THREE.Texture
     * @constructor
     */

    constructor(editor,object,mapName,newMap) {

        super(editor);

        this.type = 'SetMapCommand';
        this.name = `Set ${mapName}`;

        this.object = object;

        this.material = object.material;

        this.oldMap = this.material[mapName];
        this.newMap = newMap;

        this.mapName = mapName;

    }

    execute() {

        if (this.oldMap) this.oldMap.dispose();

        Util.toTexture(this.newMap).then(texture => {

            this.material[this.mapName] = texture;
            this.material.needsUpdate = true;
            this.editor.signals.objectChanged.dispatch(this.object);

        });

    }

    undo() {

        Util.toTexture(this.oldMap).then(texture => {

            this.material[this.mapName] = texture;
            this.material.needsUpdate = true;
            this.editor.signals.objectChanged.dispatch(this.object);
        });

    }

    toJSON() {


    }

    fromJSON() {

    }
}

export { SetMaterialMapCommand };
