import * as THREE from "three";
import { GLTFExporter } from "./GLTFExporter";
import { OBJExporter } from "./OBJExporter";


const gltfExporter = new GLTFExporter();
const objExporter = new OBJExporter();
const link = document.createElement('a');

/**
 * @param {Blob} blob 
 * @param {string} filename 
 */
function save(blob,filename) {
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }

    link.href = URL.createObjectURL(blob);
    link.download = filename || 'data.json';
    link.dispatchEvent(new MouseEvent('click'));

}

/**
 * 
 * @param {ArrayBuffer} buffer 
 * @param {string} filename 
 */
function saveArrayBuffer(buffer,filename) {


    save(new Blob([buffer],{ type: 'application/octet-stream' }),filename);

}

function saveString(text,filename) {

    save(new Blob([text],{ type: 'text/plain' }),filename);

}


/**
 * 导出 gltf 
 * @param {THREE.Object3D} input 输入
 * @param {boolean} binary 是否导出二进制文件（.glb） 默认为true
 * @param {string} filename 导出文件名
 */
function exportGLTF(input,binary = true,filename = "scene.glb") {
    const animations = getAnimations(input);

    const optimizedAnimations = [];

    for (const animation of animations) {
        optimizedAnimations.push(animation.clone().optimize());
    }
    // const _input = input.children.length === 0 ? input : input.children;
    if (input.name) {
        filename = input.name.endsWith(".glb") ? input.name : `${input.name}.glb`;
    }
    // input必须为object3D对象
    gltfExporter.parse(input,buffer => {
        saveArrayBuffer(buffer,filename);
    },undefined,{ binary,animations: optimizedAnimations });

}
/**
 * 导出 gltf 用于模型上传后台
 * @param {THREE.Object3D} input 输入
 * @param {boolean} binary 是否导出二进制文件（.glb） 默认为true
 * @param {string} filename 导出文件名
 */
async function exportGLTFAsync(input,binary = true,filename = "scene.glb") {
    const animations = getAnimations(input);

    const optimizedAnimations = [];

    for (const animation of animations) {
        optimizedAnimations.push(animation.clone().optimize());
    }
    // const _input = input.children.length === 0 ? input : input.children;
    if (input.name) {
        filename = input.name.endsWith(".glb") ? input.name : `${input.name}.glb`;
    }
    // input必须为object3D对象
    const buffer = await gltfExporter.parseAsync(input,{ binary,animations: optimizedAnimations });

    return { buffer,filename };
}


/**
 * 导出 buffer
 * @param {THREE.Object3D} input 输入
 * @param {boolean} binary 是否导出二进制文件（.glb） 默认为true
 */
async function saveBufferAsync(input,binary = true) {
    const animations = getAnimations(input);
    const optimizedAnimations = [];

    for (const animation of animations) {
        optimizedAnimations.push(animation.clone().optimize());
    }

    // const _input = input.children.length === 0 ? input : input.children;

    const buffer = await gltfExporter.parseAsync(input,{ binary,animations: optimizedAnimations });

    return buffer;
}

/**
 * 保存为obj文件
 * @param {THREE.Object3D} input 
 * @param {"string"|"file"} [format="string"] 格式
 */
function saveObj(input,format = "string") {
    if (input.name.indexOf(".obj") !== -1) {

        const string = objExporter.parse(input);

        if (format === "string") {
            return string;
        } else {
            return new File([new Blob([string],{ type: 'text/plain' })],input.name);
        }

    }
}


/**
 * 获取对象中的所有动画
 * @param {THREE.Object3D} scene 
 * @returns {THREE.AnimationClip[]}
 */
function getAnimations(scene) {
    const animations = [];
    scene.traverse(child => {
        animations.push(...child.animations);
    });
    return animations;
}

export { exportGLTF,saveBufferAsync,saveObj,exportGLTFAsync };