/**
 * @param editor pointer to main editor object used to initialize
 *        each command object with a reference to the editor
 *        开发command时，应该注意在command内部不要产生闭包。
 * @constructor
 */

class Command {
    constructor(editor) {
        this.id = -1;
        this.inMemory = false; // 执行过后inMemory变为true
        this.updatable = false;
        this.reuseable = false; // 该指令是否可以被复制和复用
        this.type = "";
        this.name = "";
        this.editor = editor;
    }

    toJSON() {
        const output = {};
        output.type = this.type;
        output.id = this.id;
        output.name = this.name;
        output.reuseable = this.reuseable;
        return output;
    }

    fromJSON(json) {
        this.inMemory = true;
        this.reuseable = false;
        this.type = json.type;
        this.id = json.id;
        this.name = json.name;

    }
}

export { Command };
