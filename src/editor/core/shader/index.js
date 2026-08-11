import * as THREE from "three";
import {
    DAY,
    NIGHT,
    SCIENCE,
    lightingPattern,
    flowTime,
    glassTime,
    elapsedTime,
    SHADER_END,
    SHADER_UNIFORM,
    DIFFUSE_END,
    fadeTime,
} from "./constant";

import * as EFFECT from "./chunk";


const custom_pars_vertex = `
uniform float uElapseTime;
varying vec4 mPosition;
varying vec3 mNormal;
varying vec2 st;
`;

const custom_vertex = `
mNormal = vNormal;
mPosition = modelMatrix * vec4( position, 1.0 );
st = uv;
`;

const custom_pars_fragment = `
uniform float uElapseTime;
uniform vec3 uColor;
varying vec4 mPosition;
varying vec3 mNormal;
varying vec2 st;
`;
const custom_fragment = `
`;


THREE.ShaderChunk['custom_pars_vertex'] = custom_pars_vertex;
THREE.ShaderChunk['custom_vertex'] = custom_vertex;
THREE.ShaderChunk['custom_pars_fragment'] = custom_pars_fragment;
THREE.ShaderChunk['custom_fragment'] = custom_fragment;


export function shaderModify(shader,effect = "",param = {}) {
    shader.uniforms.uElapseTime = elapsedTime;
    shader.uniforms.uStyle = lightingPattern;

    Reflect.ownKeys(param).forEach((key) => {

        if (typeof param[key] === 'object' && param[key] !== null) {
            if (param[key] instanceof THREE.Color ||
                param[key] instanceof THREE.Vector2 ||
                param[key] instanceof THREE.Vector3
            ) {
                shader.uniforms[key] = { value: param[key] };
            } else {

                shader.uniforms[key] = param[key];
            }
        } else {
            shader.uniforms[key] = { value: param[key] };
        }


    });

    addUniform(shader);

    addChunk(shader,effect);

}
export function shaderReset(shader,effect) {
    removeUniform(shader);

}
// 时间参数
export function shaderUpdateTime(time) {
    elapsedTime.value = time;

}

function addChunk(shader,effect) {
    const e = EFFECT[effect];
    if (!e) return;
    const chunk = e.chunk;
    const uniform = e.uniform;


    chunk && fragReplace(shader,chunk.location,chunk.shader);

    uniform && fragReplace(shader,uniform.location,uniform.shader);

}

/** 添加基础参数 */
function addUniform(shader) {

    if (!shader.vertexShader.includes("#include <custom_pars_vertex>")) {
        shader.vertexShader = shader.vertexShader.replace(
            "#include <common>",
            `
        #include <common>
        #include <custom_pars_vertex>
            `,
        );
    }
    if (!shader.vertexShader.includes("#include <custom_vertex>")) {
        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
        #include <begin_vertex>
        #include <custom_vertex>
            `,
        );
    }

    if (!shader.fragmentShader.includes(`${SHADER_UNIFORM}`)) {
        shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `
        #include <common>
        ${SHADER_UNIFORM}
        `,
        );

    }

    if (!shader.fragmentShader.includes("#include <custom_pars_fragment>")) {
        shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `
        #include <common>
        #include <custom_pars_fragment>
            `,
        );
    }
    if (!shader.fragmentShader.includes(`${DIFFUSE_END}`)) {
        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 diffuseColor = vec4( diffuse, opacity );",
            `
        vec4 diffuseColor = vec4( diffuse, opacity );
        ${DIFFUSE_END}
        `,
        );

    }
    if (!shader.fragmentShader.includes(`${SHADER_END}`)) {
        shader.fragmentShader = shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
        #include <dithering_fragment>
        ${SHADER_END}
        `,
        );

    }
}
/**移除基础参数 */
function removeUniform(shader) {
    const vertex = shader.vertexShader;
    const fragment = shader.fragmentShader;
    const strList = [
        "#include <custom_pars_vertex>",
        "#include <custom_vertex>",
        "#include <custom_pars_fragment>",
        `${DIFFUSE_END}`,
        `${SHADER_UNIFORM}`,
        `${SHADER_END}`,
    ];

    strList.forEach((str) => {
        const regex = new RegExp(str,"g");
        shader.vertexShader = vertex.replace(regex,'');
        shader.fragmentShader = fragment.replace(regex,'');
    });
}

/**
 * @function fragReplace 片元着色器修改函数
 * @function vertexReplace 顶点着色器修改函数
 */
function fragReplace(shader,start,chunk) {
    shader.fragmentShader = shader.fragmentShader.replace(start,
        `#include <${chunk}>
        ${start}`);
}
function vertexReplace(shader,start,chunk) {
    shader.vertexShader = shader.vertexShader.replace(
        start,
        `
  #include <${chunk}>
  ${start}
`,
    );
}