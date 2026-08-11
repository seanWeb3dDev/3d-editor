
import { checkObjectType } from "../Util";
import * as MATERIAL from "../material";
import * as THREE from "three";

const MATERIAL_LIST = [
    { label: '基础材质',value: 'BasicMaterial' },
    { label: '标准材质',value: 'StandardMaterial' },
    { label: '玻璃材质',value: 'GlassMaterial' },
    { label: '高亮材质',value: 'BrightenMaterial' },
    { label: '渐隐材质',value: 'FadeMaterial' },
    { label: '高度着色材质',value: 'AltitudeMaterial' },
    { label: '菲涅尔材质',value: 'FresnelMaterial' },
    { label: '水体材质A',value: 'WaterAMaterial' },
    { label: '水体材质B',value: 'WaterBMaterial' },
    { label: '气流特效',value: 'AirFlowMaterial' },
    { label: '火焰特效',value: 'FireMaterial' },
    { label: '流光特效',value: 'FlowLightMaterial' },
    { label: '波纹特效',value: 'RippleMaterial' },
    { label: '箭头路径特效',value: 'ArrowPathMaterial' },
    { label: '雷达特效',value: 'RadarMaterial' },
    { label: '流动噪声纹理',value: 'FlowNoiseMaterial' },
    { label: '分型布朗纹理A',value: 'NoiseAMaterial' },
];
class MaterialPlugin {

    constructor(editor) {

        this.editor = editor;
        this.editorEM = editor.editorEM;
        this.materialManager = editor.materialManager;
        this.name = "MaterialPlugin";

        this.list = [
        ];
        this.map = new Map();

        this.viewport = editor.materialViewport;
        this.dom = document.getElementsByClassName('cavImage')[0];

    }

    /**获取列表 */
    getList() {
        const list = [];

        this.map.forEach((material,uuid) => {
            const obj = {
                label: material.name,
                value: uuid,
            };
            list.push(obj);
        });
        return list;
    }

    getAddList() {
        return MATERIAL_LIST;
    }

    addToList(material) {


        const uuid = material.uuid;

        if (this.map.has(uuid)) return uuid;
        else {
            this.map.set(uuid,material);
            const obj = { label: material.name,value: uuid };
            return obj;
        }


    }


    removeFromList(uuid) {
        if (this.map.has(uuid))

            this.map.delete(uuid);


    }

    /**添加材质 */
    add(value) {
        const material = new MATERIAL[value]();
        const obj = this.addToList(material);
        return obj;
    }

    /**提取材质 */
    absorb() {

        const target = this.editor.selected;

        if (checkObjectType(target,['isMesh'])) {
            if (!target.material instanceof THREE.Material) {
                return false;
            }

            const obj = this.addToList(target.material);

            return obj;

        } else return false;
    }

    /**点击材质列表 */
    select(uuid) {
        const material = this.map.get(uuid);

        //更新材质预览面板

        this.viewport.changeMaterial(material);


        this.editorEM.sceneGraphChanged.dispatch();



    }


    viewportVisible(bool) {
        this.viewport.visible = bool;
        this.editorEM.sceneGraphChanged.dispatch();
    }

    viewportResize(width,height,radius) {
        this.viewport.viewportResize(width,height,radius);
        this.editorEM.sceneGraphChanged.dispatch();
    }


    /**设置材质 */
    set(uuid) {

        const material = this.map.get(uuid);
        if (!material) return false;

        const target = this.editor.selected;

        if (checkObjectType(target,['isMesh'])) {
            if (!target.material instanceof THREE.Material) {
                return false;
            }
            const material = this.map.get(uuid);
            this.editor._FUNCS.setMaterial(material);
            return true;
        } else return false;

    }



}

export { MaterialPlugin };