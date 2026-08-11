import * as THREE from "three";
import {
    Vector4,
    Vector3,
    Vector2,
    ConstantValue,
    ConstantColor,
    IntervalValue,
    RandomColor,
    RandomQuatGenerator
} from "three.quarks";
import * as QUARKS from "three.quarks";
/**
 * 合并默认对象
 * @param {{}} defaultObject 
 * @param {{}} obj 
 * @returns {{}}  defaultObject
 */
export function setDefault(defaultObject,obj) {

    if (!obj || !defaultObject) return;

    Reflect.ownKeys(defaultObject).forEach(key => {

        if (Reflect.has(obj,key)) {

            const defaultValue = defaultObject[key];

            if (getType(defaultValue) === "object") {

                setDefault(defaultValue,obj[key]);

            } else {

                defaultObject[key] = obj[key];

            }

        }

    });

}

/**
 * 
 * @param {string|File} source 资源文件，可能为url字符串，也可能为file文件
 * @returns { Promise<THREE.Texture> }
 */
export function toTexture(source,options = { imageOrientation: 'flipY' }) {

    if (source === null) return Promise.resolve(null);
    if (source.isTexture) return Promise.resolve(source);


    const loader = new THREE.ImageBitmapLoader();

    loader.setOptions(options);

    const url = typeof source === "string" ? source : URL.createObjectURL(source);

    return new Promise((resolve,reject) => {

        loader.loadAsync(url).then(imgBitmap => {

            const texture = new THREE.CanvasTexture(imgBitmap);

            resolve(texture);

        }).catch(err => {

            reject(`wrong in Util.js line ${44}\n${err}`);

        });


    });

}

const _img_regex = /\.(?:jpg|jpeg|png|gif|bmp|webp)$/i;

/** 获取数据类型 */
export function getType(value) {

    if (value === null) return "null";

    const type = typeof value;

    if (_img_regex.test(value)) return "path";

    if (type !== "object") return type;

    if (value instanceof Vector3) return "vec3";

    if (value instanceof Vector4) return "vec4";

    if (value instanceof THREE.Vector3) return "vec3";

    if (value instanceof THREE.Vector2) return "vec2";

    if (value instanceof THREE.Euler) return "euler";

    if (value instanceof THREE.Color) return "color";

    if (value instanceof ImageBitmap) return "imageBitmap";

    if (value instanceof ConstantValue) return "constantValue";

    if (value instanceof ConstantColor) return "constantColor";

    if (value instanceof RandomColor) return "randomColor";

    if (value instanceof IntervalValue) return "intervalValue";

    if (Array.isArray(value)) {

        const length = value.length;

        if (length === 3) return "vec3";

        if (length === 2) return "vec2";

        return "array";

    }

    return "object";

}


/**
 * 简单数据描述类
 */


export function getColorString(color) {
    if (color instanceof THREE.Color) {
        return "#" + color.getHexString();
    } else return color;

}

/**
 * 从json生成粒子系统参数value值
 */
export function psValueFromJSON(json) {
    let v;
    if (Array.isArray(json.value)) {

        v = json.value;

        for (let i = 0; i < v.length; i++) {

            if (Array.isArray(v[i])) {
                v[i] = arrayToVector(v[i]);
            }

        }

        if (json.type === "ConstantColor") {
            // 特殊处理
            v = [arrayToVector(v)];
        }

    } else {
        v = [json.value];
    }

    const type = json.type;

    return new QUARKS[type](...v);

}

function arrayToVector(arr) {
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return new QUARKS.Vector2(...arr);
    if (arr.length === 3) return new QUARKS.Vector3(...arr);
    if (arr.length === 4) return new QUARKS.Vector4(...arr);
}

/**
 * 判断目标是否符合类型
 * 多个条件时只要符合其中一个即返回true
 * 如果condition内没有合法值,则返回false
 * 
 * 
 * @param {THREE.Object3D} object 
 * @param {["isMesh"|"isText"|"isLight"|"isParticle"|"isSprite"|"isGroup"|"isObject3D"|"isReflector"]} condition 
 * @returns 
 */
export function checkObjectType(object,condition = []) {
    let result = 0;

    if (!object) return false;

    if (condition.length === 0) return false;

    condition.forEach((con) => {
        if (con === "isMesh") {

            if (isNormalMesh(object)) result++;

        } else {

            if (object[con]) result++;
        }
    });

    return result > 0;

}

export function isNormalMesh(object) {

    if (object.isMesh && object.isObject3D) {

        if (object.isLight ||
            object.isText ||
            object.isParticle ||
            object.isSprite ||
            object.isGroup) {
            return false;
        }
        return true;
    } else return false;
}

/**
 * 判断目标是否有骨骼
 * @param {THREE.Object3D} object 
 * @returns { Boolean } true 有骨骼 false 没有骨骼
 */
export function hasSkeleton(object) {
    if (object?.isSkinnedMesh && object?.skeleton) {
        return true;
    }

    for (const child of object?.children || []) {
        if (hasSkeleton(child)) {
            return true;
        }
    }

    return false;

}

/**
 * 
 * 此方法用于toJSON的时候返回存储与userData的数据
 * @returns 
 */
export function getParticleValue(attr) {

    if (attr instanceof Vector3) {

        return { type: "Vector3",value: [...attr] };
    }
    if (attr instanceof Vector2) {

        return { type: "Vector2",value: [...attr] };
    }
    if (attr instanceof ConstantValue) {

        return { type: "ConstantValue",value: attr.value };
    }
    if (attr instanceof ConstantColor) {
        return { type: "ConstantColor",value: [...attr.color] }; // 向量默认以数组形式存储
    }

    if (attr instanceof IntervalValue) {
        return { type: 'IntervalValue',value: [attr.a,attr.b] };
    }

    if (attr instanceof RandomQuatGenerator) {
        return { type: 'RandomQuatGenerator',value: "RandomQuatGenerator" };
    }

    if (attr instanceof RandomColor) {
        return { type: 'RandomColor',value: [[...attr.a],[...attr.b]] };// 向量默认以数组形式存储
    }

    return attr;

}

/**
 * 判断一个资源是否是模型组下的资源
 * @param {} object 
 */
export function inModelGroup(object) {
    const p = object.parent;

    if (p == null) {
        return true;
    }
    if (["灯光组","文本组","辅助线组","粒子组"].includes(p.userData.groupName)) {

        return false;
    }
    else return inModelGroup(p);
}