import * as THREE from "three";
import { BaseNode } from ".";
import { DataAgent } from "./agent/DataAgent";
import { getColorString } from "../Util";
import { TextureNode } from './textureNode';

const sideOptions = [
    { label: '正面',value: 0 },
    { label: '反面',value: 1 },
    { label: '正反面',value: 2 }
];

export class MaterialNode extends BaseNode {

    /**
     * @param {THREE.Material} material 
     */
    constructor(material) {
        super(material);
        this.type = 'materialNode';

    }

    toJSON() {
        const material = this.object;
        const data = {};

        data.uuid = material.uuid;
        data.name = material.name;
        data.type = material.type;

        return data;
    }

    toModifyJSON() {

        /**@type {THREE.Material} */
        const material = this.object;
        const data = {};
        data.name = new DataAgent(material.name,{ label: "名称" });
        data.type = new DataAgent(material.type,{ writable: false,label: '材质类型' });
        data.uuid = new DataAgent(material.uuid,{ writable: false });


        // 标准材质
        if (material.type === 'MeshStandardMaterial') {

            data.roughness = new DataAgent(material.roughness,{ label: '粗糙度',inputType: 'slider_input',range: [0,1] });
            data.metalness = new DataAgent(material.metalness,{ label: '金属度',inputType: 'slider_input',range: [0,1] });
            data.transparent = new DataAgent(material.transparent,{ label: '是否透明',inputType: 'switch' });
            data.opacity = new DataAgent(material.opacity,{ label: '透明度',inputType: 'slider_input',range: [0,1] });
            data.side = new DataAgent(material.side,{ label: '正反显示',inputType: 'select',options: sideOptions });

            data.color = new DataAgent(getColorString(material.color),{ label: '颜色',inputType: 'color' });
            data.emissive = new DataAgent(getColorString(material.emissive),{ label: '外发光',inputType: 'color' });
            data.emissiveIntensity = new DataAgent(material.emissiveIntensity,{ label: '发光强度',inputType: 'number' });
            // data.wireframe = new DataAgent(material.wireframe,{ label: '网格显示',inputType: 'switch' });
            // data.alphaTest = new DataAgent(material.alphaTest,{ label: 'alpha测试',inputType: 'slider_input',range: [0,1] });
            data.depthTest = new DataAgent(material.depthTest,{ label: '深度测试',inputType: 'switch' });
            data.depthWrite = new DataAgent(material.depthWrite,{ label: '深度写入',inputType: 'switch' });
            data.map = this.handelMap(material,'map');

            if (material.envMap !== null) {
                data.envMapIntensity = new DataAgent(material.envMapIntensity,{ label: '环境纹理',inputType: 'number' });
            }

            if (material.aoMap !== null) {
                data.aoMap = new DataAgent(material.aoMap.image,{ inputType: "chartlet",label: "ao贴图",writable: false });
            }

            if (material.normalMap !== null) {
                data.normalMap = new DataAgent(material.normalMap.image,{ inputType: "chartlet",label: "法线贴图",writable: false });
            }

        }
        // todo 基础材质
        if (material.type === 'MeshBasicMaterial') {

            data.transparent = new DataAgent(material.transparent,{ label: '是否透明',inputType: 'switch' });
            data.opacity = new DataAgent(material.opacity,{ label: '透明度',inputType: 'slider',range: [0,1] });
            data.side = new DataAgent(material.side,{ label: '正反显示',inputType: 'select',options: sideOptions });

            data.color = new DataAgent(getColorString(material.color),{ label: '颜色',inputType: 'color' });

            // data.wireframe = new DataAgent(material.wireframe,{ label: '网格显示',inputType: 'switch' });
            // data.alphaTest = new DataAgent(material.alphaTest,{ label: 'alpha测试',inputType: 'slider_input',range: [0,1] });
            data.depthTest = new DataAgent(material.depthTest,{ label: '深度测试',inputType: 'switch' });
            data.depthWrite = new DataAgent(material.depthWrite,{ label: '深度写入',inputType: 'switch' });
            data.map = this.handelMap(material,'map');

        }
        // todo 精灵图材质
        if (material.type === 'SpriteMaterial') {

        }
        // todo 物理材质
        if (material.type === 'MeshPhysicalMaterial') {

            data.roughness = new DataAgent(material.roughness,{ label: '粗糙度',inputType: 'slider_input',range: [0,1] });
            data.metalness = new DataAgent(material.metalness,{ label: '金属度',inputType: 'slider_input',range: [0,1] });
            data.transparent = new DataAgent(material.transparent,{ label: '是否透明',inputType: 'switch' });
            data.opacity = new DataAgent(material.opacity,{ label: '透明度',inputType: 'slider_input',range: [0,1] });
            data.side = new DataAgent(material.side,{ label: '正反显示',inputType: 'select',options: sideOptions });

            data.color = new DataAgent(getColorString(material.color),{ label: '颜色',inputType: 'color' });
            data.emissive = new DataAgent(getColorString(material.emissive),{ label: '外发光',inputType: 'color' });
            data.emissiveIntensity = new DataAgent(material.emissiveIntensity,{ label: '发光强度',inputType: 'number' });

            data.depthTest = new DataAgent(material.depthTest,{ label: '深度测试',inputType: 'switch' });
            data.depthWrite = new DataAgent(material.depthWrite,{ label: '深度写入',inputType: 'switch' });
            data.map = this.handelMap(material,'map');

            if (material.envMap !== null) {
                data.envMapIntensity = new DataAgent(material.envMapIntensity,{ label: '环境纹理',inputType: 'number' });
            }

            if (material.aoMap !== null) {
                data.aoMap = new DataAgent(material.aoMap.image,{ inputType: "chartlet",label: "ao贴图",writable: false });
            }

            if (material.normalMap !== null) {
                data.normalMap = new DataAgent(material.normalMap.image,{ inputType: "chartlet",label: "法线贴图",writable: false });
            }

        }
        if (material.type === 'LineBasicMaterial') {
            data.color = new DataAgent(getColorString(material.color),{ label: '颜色',inputType: 'color' });
        }
        if (material.type === 'ShaderMaterial') {
            /**
             * 着色器材质
             */
            delete data.type;
            data.shaderType = new DataAgent(material.shaderType,{ writable: false,label: '着色器' });
            data.transparent = new DataAgent(material.transparent,{ label: '是否透明',inputType: 'switch' });
            data.uniforms = material.toUniformNode();
            data.uniforms.inputType = 'group';

            // data.wireframe = new DataAgent(material.wireframe,{ label: '网格显示',inputType: 'switch' });
            data.side = new DataAgent(material.side,{ label: '正反显示',inputType: 'select',options: sideOptions });
            // data.alphaTest = new DataAgent(material.alphaTest,{ label: 'alpha测试',inputType: 'slider_input',range: [0,1] });
            data.depthTest = new DataAgent(material.depthTest,{ label: '深度测试',inputType: 'switch' });
            data.depthWrite = new DataAgent(material.depthWrite,{ label: '深度写入',inputType: 'switch' });

            if (material.useMap) {
                data.map = this.handelMap(material,'map');
            }
        }

        return data;
    }

    toAttributeChangeList() {
        const material = this.object;
        const list = [];
        if (material.type === 'MeshStandardMaterial' ||
            material.type === 'MeshBasicMaterial' ||
            material.type === 'MeshPhysicalMaterial'
        ) {
            const color = {
                label: "颜色",
                value: "material_color"
            };
            list.push(color);
            const transparent = {
                label: "是否透明",
                value: "material_transparent"
            };
            list.push(transparent);
        }
        if (material.type === 'ShaderMaterial') {
            const uniforms = material.uniforms;
            if (uniforms.color) {
                const color = {
                    label: "颜色",
                    value: "material_uniforms_color_value"
                };
                list.push(color);
            }

        }
        return list;
    }

    handelMap(material,mapName) {


        if (Reflect.has(material,mapName) && material[mapName] === null) {


            const labelMap = {
                map: "贴图",
                envMap: "环境贴图",
                aoMap: 'ao贴图',
                normalMap: '法线贴图'
            };
            const map = material[mapName] ? material[mapName].image : null;

            return new DataAgent(map,{ inputType: "chartlet",label: labelMap[mapName] });
        } else {
            return new TextureNode(material[mapName],mapName).toModifyJSON();
        }

    }

}


