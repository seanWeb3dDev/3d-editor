import * as Commands from './commands/index.js';
import { Editor } from './Editor.js';
import { Command } from '../library/Command.js';

export class History {

    constructor(editor) {

        /**@type {Editor} */
        this.editor = editor;

        /**@type {Command} */
        this.undos = [];

        /**@type {Command} */
        this.redos = [];

        /**@type {number} */
        this.lastCmdTime = Date.now();

        /**@type {number} */
        this.idCounter = 0;

        this.reuseCmd = [];
    }

    /**
     * 执行命令
     * @param {Command} cmd 
     * @param {*} optionalName 
     */
    execute(cmd,optionalName) {

        const lastCmd = this.undos[this.undos.length - 1];
        const timeDifference = Date.now() - this.lastCmdTime;

        // 触发高频指令时，在历史记录中将历史指令剔除，直接插入最新指令
        const isUpdatableCmd = lastCmd &&
            lastCmd.updatable &&
            cmd.updatable &&
            lastCmd.object === cmd.object &&
            lastCmd.type === cmd.type &&
            lastCmd.script === cmd.script &&
            lastCmd.attributeName === cmd.attributeName;

        if (isUpdatableCmd && timeDifference < 500) {
            lastCmd.update(cmd);
            cmd = lastCmd;

        } else {

            // the command is not updatable and is added as a new part of the history

            this.undos.push(cmd);
            cmd.id = ++this.idCounter;

        }

        // todo 可被复用指令 逻辑需需改
        const isReuseableCmd = cmd.reuseable;
        if (isReuseableCmd) {
            // const json = cmd.toJSON();
            // const obj = {
            //     target: cmd.object.name,
            //     json: json
            // };
            // this.reuseCmd.push(obj);
        }

        cmd.name = (optionalName !== undefined) ? optionalName : cmd.name;
        cmd.execute();
        cmd.inMemory = true;


        this.lastCmdTime = Date.now();

        // clearing all the redo-commands

        this.redos = [];
        this.editor.editorEM.historyChanged.dispatch(cmd);


    }

    undo() {

        let cmd = undefined;

        if (this.undos.length > 0) {

            cmd = this.undos.pop();


        }


        if (cmd !== undefined) {

            cmd.undo();
            this.redos.push(cmd);
            this.editor.editorEM.historyChanged.dispatch(cmd);

            if (cmd.reuseable) {
                // todo 逻辑待完善
                this.reuseCmd.pop();

            }


        }

        return cmd;

    }
    // 重新执行撤销行为
    redo() {

        let cmd = undefined;

        if (this.redos.length > 0) {

            cmd = this.redos.pop();


        }

        if (cmd !== undefined) {

            cmd.execute();
            this.undos.push(cmd);
            this.editor.editorEM.historyChanged.dispatch(cmd);

        }

        return cmd;

    }

    toJSON() {

        const history = {};
        history.undos = [];
        history.redos = [];

        // Append Undos to History

        for (let i = 0; i < this.undos.length; i++) {

            if (Reflect.has(this.undos[i],'json')) {

                history.undos.push(this.undos[i].json);

            }

        }

        // Append Redos to History

        for (let i = 0; i < this.redos.length; i++) {

            if (Reflect.has(this.redos[i],'json')) {

                history.redos.push(this.redos[i].json);

            }

        }

        return history;

    }

    fromJSON(json) {

        if (json === undefined) return;

        for (let i = 0; i < json.undos.length; i++) {

            const cmdJSON = json.undos[i];
            const cmd = new Commands[cmdJSON.type](this.editor); // creates a new object of type "json.type"
            cmd.json = cmdJSON;
            cmd.id = cmdJSON.id;
            cmd.name = cmdJSON.name;
            this.undos.push(cmd);
            this.idCounter = (cmdJSON.id > this.idCounter) ? cmdJSON.id : this.idCounter; // set last used idCounter

        }

        for (let i = 0; i < json.redos.length; i++) {

            const cmdJSON = json.redos[i];
            const cmd = new Commands[cmdJSON.type](this.editor); // creates a new object of type "json.type"
            cmd.json = cmdJSON;
            cmd.id = cmdJSON.id;
            cmd.name = cmdJSON.name;
            this.redos.push(cmd);
            this.idCounter = (cmdJSON.id > this.idCounter) ? cmdJSON.id : this.idCounter; // set last used idCounter

        }

        // Select the last executed undo-command
        this.editor.editorEM.historyChanged.dispatch(this.undos[this.undos.length - 1]);

    }

    clear() {

        this.undos = [];
        this.redos = [];
        this.idCounter = 0;

        this.editor.editorEM.historyChanged.dispatch();

    }

}

