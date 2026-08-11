import { Text } from 'troika-three-text';

import * as THREE from "three";
import { getColorString } from './Util';

// 后续添加字体文件用使用英文
const fonts = {
    heiti: "./font/heiti_regular.otf",
    nanshen: "./font/HuXiaoBoNanShenTi-2.otf",

};

const setting = {
    name: "文本",
    font: fonts['heiti'],
    preText: "请输入文本",
    fontSize: 0.2,
    color: "#0039e6",
    maxWidth: 1.5, //文本框宽度
    overflowWrap: "break-word", // 换行，受
    anchorY: "bottom", // 文字锚点，
    outlineWidth: 0.001,
    outlineColor: "#ffffff",
    outlineBlur: 0.01,
    lineHeight: 1,

};

const ADD_TEXT_LIST = [
    { label: '组',key: "group" },
    { label: "文本",key: "text" }
];

class TextMesh extends Text {

    #preText;

    get preText() {
        return this.#preText;
    }
    set preText(value) {
        this.#preText = value;

        this.updateText();
    }
    constructor() {
        super();

        this.isText = true;
        this.type = "Text";

    }

    updateText() {


        if (this.text === this.preText) return;

        let newText = this.preText;


        const state = this.userData.state;

        if (state) {
            const newStr = this.preText.replace(/@{(.*?)}@/g,
                (match,group) => {
                    if (state[group]) return "${state[`" + group + "`].value}";
                    else return match;
                });

            newText = eval('`' + newStr + '`');
        }

        if (this.text !== newText) {
            if (newText.trim() == "") {
                newText = "";
            }

            this.text = newText;
        }

    }

    isOnlyNewlinesOrSpaces(str) {

        return /^(?:\n|[ ]|&nbsp;)*$/.test(str);
    }

    clone() {

        const that = this;
        const text = new TextMesh();


        text.userData = JSON.parse(JSON.stringify(that.userData));

        Reflect.ownKeys(setting).forEach((key) => {
            text[key] = that[key];
        });


        text.position.copy(that.position);
        text.scale.copy(that.scale);
        text.rotation.copy(that.rotation);

        const children = that.children;

        if (that.children.length > 0) {
            children.forEach((child) => {
                text.add(
                    child.clone()
                );
            });
        }

        return text;
    }
}

function createText() {

    const planeG = new THREE.PlaneGeometry(1,0.25,2,2);
    const planeM = new THREE.MeshBasicMaterial({ color: 'gray',transparent: true,opacity: 0.2,side: THREE.DoubleSide });
    planeM.name = '文本背景材质';
    const plane = new THREE.Mesh(planeG,planeM);
    plane.position.x += 0.5;
    plane.position.y += 0.1;
    plane.position.z -= 0.001;
    plane.name = '文本背景';
    const text = new TextMesh();

    const r = text.renderOrder;
    plane.renderOrder = r + 1;

    plane.name = '文本背景';

    Reflect.ownKeys(setting).forEach((key) => {
        if (['color','outlineColor'].includes(key) && typeof setting[key] !== 'string') {
            const value = new THREE.Color(setting[key]);
            text[key] = getColorString(value);
        } else {

            text[key] = setting[key];
        }
    });
    text.add(plane);

    return text;
}

/**
 * exporter文本导出插件
 */
class GLTFTextMeshExtension {
    constructor(writer) {

        this.writer = writer;
        this.name = 'BL_textMesh_extension';
    }

    writeNode(input,nodeDef) {
        if (input instanceof TextMesh) {
            const userData = this.textExportProcess(input);
            nodeDef.extras = JSON.parse(JSON.stringify(userData));
        }

    }

    beforeParse(input) {

    }

    textExportProcess(obj) {
        obj.userData = obj.userData || {};
        const userData = obj.userData;
        userData.isText = true;

        Reflect.ownKeys(setting).forEach((key) => {
            if (['color','outlineColor'].includes(key)) {
                userData[key] = getColorString(obj[key]);
            } else {
                userData[key] = obj[key];
            }

        });

        return userData;
    }

}



export { createText,GLTFTextMeshExtension,TextMesh,ADD_TEXT_LIST };