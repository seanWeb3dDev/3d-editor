import { Command } from '../../library';
import { Object3D } from 'three';
import { Editor } from "../Editor";
// state属性案例
const state = {
    id: {
        type: "int",
        value: 1,
    },
    walk: {
        type: "bool",
        value: true,
        relate: "animate",
        relateTarget: "walk"
    }
};

/**
 * 插入mark时，要关注是用来做单一标记，还是路径上的其中一个节点
 * 还有该mark会存入哪个group中，存入的group取决于当前激活了哪个插入功能
 */
export class SetStateCommand extends Command {
    /**
 * @param {Editor} editor Editor
 * @param {Object3D} object THREE.Object3D
 * @constructor
 */
    constructor(editor,object,attribute) {
        super(editor);

        this.type = 'SetStateCommand';
        this.name = 'set State';

        this.object = object;
        this.userData = object.userData;

        if (object !== undefined) {

            this.name = `Add State: ${object.name}`;
        }
        if (!object.userData.hasOwnProperty('state')) {
            object.userData.state = {};

        }
        this.attribute = attribute;
        this.oldState = this.object.userData.state;

    }
    execute() {
        const key = this.attribute.key;
        this.userData.state[key] = this.attribute;

    }
    undo() {

        this.userData.state = this.oldState;

    }
    toJSON() {

    }

}