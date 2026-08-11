import { Text } from 'troika-three-text';
import { AddObjectCommand } from "../commands";
import { Memory } from "../../library";

import * as THREE from "three";
import { TextMesh } from '../Text';
import { getColorString } from '../Util';

const setting = {
    font: "./font/heiti_regular.otf",
    preText: "请输入文本",
    fontSize: 0.2,
    color: "#0039e6",
    maxWidth: 1, //文本框宽度
    overflowWrap: "break-word", // 换行，受
    anchorY: "bottom", // 文字锚点，
    outlineWidth: 0.001,
    outlineColor: 'white',
    outlineBlur: 0.01,
    lineHeight: 1,

};

class TextProcessPlugin {

    constructor(executor) {
        this.executor = executor;
        this.texts = [];
    }

    process(object) {

        const userData = object.userData;

        if (userData.isText) {

            this.texts.push(object);

        }
    }

    afterProcess(scene) {


        if (this.texts.length === 0) return;

        const list = textProcess(this.texts);

        this.texts = null;

        const editor = this.executor.editor;

        this.executor.setAction(

            function () {


                // 如果文本模型在文本组中，一次添加scene的子元素以保证层级结构被保留
                if (scene.userData.groupName === "文本组") {

                    editor.loadLength += scene.children.length;

                    for (let i = scene.children.length - 1; i >= 0; i--) {

                        editor.loadLength--;

                        const target = scene.children[i];

                        editor.execute(new AddObjectCommand(editor,target,editor.textGroup));


                    }

                } else {

                    editor.loadLength += list.length;

                    // 文本模型不在文本组中，先将文本模型添加进文本组中

                    if (scene.name.includes("孪生体制作专用")) {
                        // 当文件名为孪生体制作专用时，该文件用于制作特定孪生体，文本模型不用提取到文本组
                        list.forEach((text) => {
                            editor.loadLength--;
                        });
                    } else {

                        const newGroup = new THREE.Group();
                        newGroup.name = scene.name + "文本集合";
                        list.forEach((text) => {

                            // text.parent.remove(text);

                            // editor.execute(new AddObjectCommand(editor,text,newGroup));

                            // 1.3版本更新，重新创建了一个组用于存放文本模型
                            newGroup.add(text);

                            editor.loadLength--;


                        });
                        editor.execute(new AddObjectCommand(editor,newGroup,editor.textGroup));


                    }

                    editor.execute(new AddObjectCommand(this.editor,scene));

                }




            }

        );

    }

}

function textProcess(texts,editor) {

    const list = [];


    texts.forEach((t) => {

        const userData = t.userData;

        let text = new TextMesh();


        // 找出文本背景

        for (let i = 0; i < t.children.length; i++) {
            if (t.children[i].name.includes('文本背景')) {
                text.add(t.children[i]);
                break;
            }
        }

        const p = t.position;
        const s = t.scale;
        const r = t.rotation;
        text.position.set(p.x,p.y,p.z);
        text.scale.set(s.x,s.y,s.z);
        text.rotation.set(r.x,r.y,r.z);

        text.visible = t.visible;
        text.name = t.name;

        text.userData = text.userData || {};

        if (userData.state) {
            text.userData.state = userData.state;
        }
        if (userData.eventList) {
            text.userData.eventList = userData.eventList;
        }

        // todo text实例的renderOrder有问题
        Reflect.ownKeys(setting).forEach((key) => {


            if (['color','outlineColor'].includes(key) && typeof userData[key] !== 'string') {
                const value = new THREE.Color(userData[key]);
                text[key] = getColorString(value);

            } else {

                text[key] = userData[key];
            }


        });

        // text实例更新文本函数, 需要通过apply方式引用

        list.push(text);

        t.parent.add(text);


        Memory.dispose(t,true);


    });

    return list;

}



function updateText() {

    const text = this.text;
    const state = this.userData.state;

    const newStr = text.replace(/{(.*?)}/g,
        (match,group) => {
            if (state[group]) return "${state." + group + ".value}";
            else return match;
        });

    this.text = eval('`' + newStr + '`');

}
export { TextProcessPlugin };