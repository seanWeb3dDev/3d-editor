import * as CMD from "./commands";
import * as THREE from "three";
import { ADD_TEXT_LIST,createText } from "./Text";
import * as Util from "./Util";
import { exportGLTF } from "../library/Exporter";
import { ADD_PARTICLE_LIST,ParticleEmitter } from "./Particle";
import { ADD_LIGHT_LIST } from "./Light";
import { GEOMETRY_LIST,createMesh,createMirror } from "./GeometryManager";
import { ADD_HELPER_LINE_LIST,createHelperDot,createHelperLine } from "./HelperLine";


const EDITOR_SETTING = {
    tool: [
        { label: "灯光线",value: false,fn: "lightVisible" },
        { label: "网格",value: true,fn: "gridVisible" },
        { label: "特效预览",value: false,fn: "shaderPreview" },
        { label: "全局动画",value: false,fn: "allAnimation" },
        { label: "单独显示",value: false,fn: "singleShow" },
    ]
};



const _FUNCS = {
    _pluginDispatch: null,
    getSceneData: null,
    addLight: null,
    addModel: null,
    setValue: null,
    init: null,
    getGlobalSetting: null,
    save: null,
    insert: null,
    getEditorSetting: null,
    markerActive: null,
    lightVisible: null,
    gridVisible: null,
    shaderPreview: null,
    allAnimation: null,
    bindEvent: null,
    bindFollowEvent: null,
    deleteEvent: null,
    deleteFollowEvent: null,
    setState: null,
    deleteState: null,
    animationPlay: null,
    select: null,
    singleShow: null,
    setMaterial: null,
    selectMaterial: null,
    getAllMaterial: null,
    objectFocus: null,
    addParticle: null,
    lockObject: null,
    setTransformControls: null,
    getEventData: null,
    moveObject: null,
    getViewAngle: null,
    containerResize: null,
    screenshot: null,
    setViewAngle: null

};
const _AddObjectList = {
    lightGroup: ADD_LIGHT_LIST,
    textGroup: ADD_TEXT_LIST,
    ParticleGroup: ADD_PARTICLE_LIST,
    helperLineGroup: ADD_HELPER_LINE_LIST,
    modelGroup: [...GEOMETRY_LIST]
};
/**编辑器功能注册函数，用于前端调用 */
function registerFunctions(editor) {

    /**事件管理器 */
    const editorEM = editor.editorEM;

    /**插件功能派发 */
    _FUNCS._pluginDispatch = function _pluginDispatch(name,func,param) {


        return editor.pluginDispatcher.dispatch(name,func,param);
    };

    /**添加灯光 */
    _FUNCS.addLight = function addLight(type) {

        let light = null;
        switch (type) {
            case "group": {
                light = new THREE.Group();
                light.name = "group";

                break;
            }
            case "AmbientLight": {
                light = new THREE.AmbientLight();
                light.name = "环境光";

                break;
            }
            case "DirectionalLight": {
                light = new THREE.DirectionalLight();
                light.name = "直线光";
                light.position.y = 10;
                const shadow = light.shadow;
                const camera = shadow.camera;
                shadow.bias = -0.0004;
                camera.left = -50;
                camera.right = 50;
                camera.top = 50;
                camera.bottom = -50;
                camera.far = 250;
                break;
            }
            case "SpotLight": {
                light = new THREE.SpotLight();

                const target = light.target;
                target.position.y += 1;
                light.targetProcess(target);

                light.name = "聚光灯";
                break;
            }
            case "PointLight": {
                light = new THREE.PointLight();
                light.name = "点光源";
                break;
            }
            case "HemisphereLight": {
                light = new THREE.HemisphereLight();
                light.name = "半球光";
                break;
            }
            default:
                console.log("无效灯光类型");
                break;
        }

        if (light) {
            editor.execute(new CMD.AddObjectCommand(editor,light,editor.lightGroup));
        }
    };

    /**添加文本 */
    _FUNCS.addText = function addText(type = "text") {
        if (type === "group") {
            const group = new THREE.Group();
            group.name = "group";
            editor.execute(new CMD.AddObjectCommand(editor,group,editor.textGroup));
        }
        if (type === "text") {
            editor.execute(new CMD.AddObjectCommand(editor,createText(),editor.textGroup));
            // editor.execute(new CMD.AddObjectCommand(editor,createText()));

        }
    };

    /**添加粒子 */
    _FUNCS.addParticle = function addParticle(type = "particle") {
        if (type === "group") {
            const group = new THREE.Group();
            group.name = "group";
            editor.execute(new CMD.AddObjectCommand(editor,group,editor.particleGroup));
        }
        if (type === "particle") {
            const particle = new ParticleEmitter();

            editor.execute(new CMD.AddObjectCommand(editor,particle,editor.particleGroup));
        }
    };

    /**添加模型 */
    _FUNCS.addModel = function addModel(data) {
        if (data === "group") {
            const group = new THREE.Group();
            group.name = "group";
            editor.execute(new CMD.AddObjectCommand(editor,group));
        } else {

            let mesh;
            let options;
            if (data.includes("mirror")) {
                data = data.split("_")[0]; // XXX_mirror
                options = {
                    textureHeight: editor.container.offsetWidth,
                    textureWidth: editor.container.offsetHeight,
                };
                mesh = createMirror(data,options);
            } else {

                mesh = createMesh(data);
            }
            if (mesh) {
                editor.execute(new CMD.AddObjectCommand(editor,mesh));
            } else {
                editor.loader.loadUrl(data);
            }
        }

    };

    /**添加辅助线 */
    _FUNCS.addHelperLine = function addHelperLine(data) {
        if (data === 'helperLine') {
            const line = createHelperLine();
            const dot = createHelperDot(line);
            line.dotGroup.add(dot);
            const dot2 = createHelperDot(line);
            line.dotGroup.add(dot2);
            line.refreshSegment();
            editor.execute(new CMD.AddObjectCommand(editor,line,editor.helperLineGroup));

        }
        if (data === "group") {
            const group = new THREE.Group();
            group.name = "group";
            editor.execute(new CMD.AddObjectCommand(editor,group,editor.helperLineGroup));
        }

    };

    _FUNCS.setValue = function setValue(data) {
        const { key,value,isGlobal,uuid,slot } = data;
        let attr;
        if (key.includes("attribute_geometry_")) {
            const target = editor.selected;
            attr = key.replace('attribute_geometry_','');
            // todo 先从目标身上获取所有的geometry数据
            editor.execute(new CMD.SetGeometryCommand(editor,target,attr,value));
        } else if (key.includes("attribute_particleSetting_")) {
            // 粒子配置项
            attr = key.replace('attribute_particleSetting_','');
            const target = editor.selected;
            const particleSystem = target.particleSystem;

            switch (attr) {
                case "duration":
                    editor.execute(new CMD.SetValueCommand(editor,particleSystem,attr,value));
                    particleSystem.restart();
                    break;
                case "looping":
                    editor.execute(new CMD.SetValueCommand(editor,particleSystem,attr,value));
                    particleSystem.restart();
                    break;
                case "renderMode":
                    // todo startRotation会被修改
                    editor.execute(new CMD.SetValueCommand(editor,particleSystem,attr,value));
                    particleSystem.restart();
                    break;
                case "startLife":
                    editor.execute(new CMD.SetParticleValueCommand(editor,target,attr,value));
                    break;
                case "startSize":
                    editor.execute(new CMD.SetParticleValueCommand(editor,target,attr,value));
                    break;
                case "startSpeed":
                    editor.execute(new CMD.SetParticleValueCommand(editor,target,attr,value));
                    break;
                case "startRotation":
                    editor.execute(new CMD.SetParticleMultiValueCommand(editor,target,attr,value));
                    break;
                case "startColor_type":
                    editor.execute(new CMD.SetParticleMultiValueCommand(editor,target,attr,value));
                    break;
                case "startColor_a":
                    editor.execute(new CMD.SetParticleMultiValueCommand(editor,target,attr,value));
                    break;
                case "startColor_b":
                    editor.execute(new CMD.SetParticleMultiValueCommand(editor,target,attr,value));
                    break;
                case "emissionOverTime":
                    if (value > 1000) {
                        editor.callbackList.tipFun(
                            "粒子数量过大会导致性能问题,确定修改吗",
                            () => {
                                editor.execute(new CMD.SetParticleValueCommand(editor,target,attr,value));
                            }
                        );
                    } else {
                        editor.execute(new CMD.SetParticleValueCommand(editor,target,attr,value));
                    }
                    break;
                case "renderOrder":
                    editor.execute(new CMD.SetValueCommand(editor,particleSystem,attr,value));
                    break;
                case "model":
                    const particleManager = editor.particleManager;

                    // 支持 File 对象（本地文件选择器）和 URL 字符串
                    const modelUrl = value instanceof File ? URL.createObjectURL(value) : value;

                    // 防御：deepCopy 会把 File 对象破坏成 {}，此时 modelUrl 不是字符串
                    if (typeof modelUrl !== 'string' || !modelUrl) {
                        console.error('粒子实例值无效（期望 URL 字符串）:',value);
                        break;
                    }

                    let instance = particleManager.getInstance(modelUrl);
                    if (instance) {
                        // 已下载过该实例
                        editor.execute(new CMD.SetParticleInstanceCommand(editor,target,instance));
                    } else {
                        // 未下载该实例
                        const loader = editor.loader.createGLTFLoader();
                        loader.load(modelUrl,gltf => {
                            gltf.scene.traverse((child) => {
                                if (child.isMesh) {
                                    instance = child;
                                }
                            });

                            particleManager.setInstance(modelUrl,instance);
                            editor.execute(new CMD.SetParticleInstanceCommand(editor,target,instance));
                        });
                    }

                    break;
                case "emitterShape_type":
                    editor.execute(new CMD.SetParticleShapeCommand(editor,target,attr,value));
                    break;
                default:
                    if (attr.includes('emitterShape_')) {
                        const key = attr.replace('emitterShape_','');
                        editor.execute(new CMD.SetValueCommand(editor,particleSystem.emitterShape,key,value));
                    } else if (attr.includes('behaviors_')) {
                        const arr = attr.replace('behaviors_behavior',"").split("_");
                        const index = arr.shift();

                        editor.execute(new CMD.SetParticleBehaviorValueCommand(editor,target,index,arr,value));

                    } else {
                        console.log('无效指令');
                    }
                    break;
            }
        } else if (key.includes("attribute_textSetting_")) {
            attr = key.replace('attribute_textSetting_','');
            switch (attr) {
                // 文本相关
                case "overflowWrap":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"overflowWrap",value));
                    break;
                case "preText":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"preText",value));
                    editorEM.syncRender.dispatch();
                    break;
                case "fontSize":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"fontSize",value));
                    editorEM.syncRender.dispatch();
                    break;
                case "maxWidth":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"maxWidth",value));
                    editorEM.syncRender.dispatch();
                    break;
                case "letterSpacing":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"letterSpacing",value));
                    editorEM.syncRender.dispatch();
                    break;
                case "outlineWidth":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"outlineWidth",value));
                    break;
                case "outlineBlur":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"outlineBlur",value));
                    break;
                case "lineHeight":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"lineHeight",value));
                    break;
                case "color":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,new THREE.Color(value)));
                    break;
                case "outlineColor":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,new THREE.Color(value)));
                    break;
                case "font":

                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,"font",value));
                    editorEM.syncRender.dispatch();
                    break;
                default:
                    console.log("无效的指令");
                    break;
            }

        } else if (key.includes("attribute_")) {
            // 基础属性
            attr = key.replace('attribute_','');

            switch (attr) {

                case "name":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "position":
                    editor.execute(new CMD.SetPositionCommand(editor,editor.selected,new THREE.Vector3(...value)));
                    break;
                case "rotation":
                    editor.execute(new CMD.SetRotationCommand(editor,editor.selected,new THREE.Euler(...value,'XYZ')));
                    break;
                case "scale":
                    editor.execute(new CMD.SetScaleCommand(editor,editor.selected,new THREE.Vector3(...value)));
                    break;
                case "visible":
                    if (uuid) {
                        const target = editor.format.get(uuid).object;
                        editor.execute(new CMD.SetValueCommand(editor,target,attr,value));

                    } else {

                        editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    }
                    break;
                case "castShadow":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "receiveShadow":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "renderOrder":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "color":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,new THREE.Color(value)));
                    break;
                case "angle":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "distance":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "intensity":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "penumbra":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "decay":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected,attr,value));
                    break;
                case "target":
                    const lightTarget = editor.selected.target;
                    editor.execute(new CMD.SetPositionCommand(editor,lightTarget,new THREE.Vector3(...value)));

                    break;


                // 阴影
                case "shadow_mapSize":
                    const shadow = editor.selected.shadow;
                    const v = JSON.parse(value);

                    editor.execute(new CMD.SetShadowMapSizeCommand(editor,shadow,new THREE.Vector2(...v),shadow.mapSize.clone()));

                    break;
                case "shadow_radius":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow,'radius',value));
                    break;
                case "shadow_bias":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow,'bias',value));
                case "shadow_normalBias":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow,'normalBias',value));
                    break;
                case "shadow_blurSamples":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow,'blurSamples',value));
                    break;
                case "shadow_camera_left":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow.camera,"left",value));
                    break;
                case "shadow_camera_right":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow.camera,"right",value));
                    break;
                case "shadow_camera_top":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow.camera,"top",value));
                    break;
                case "shadow_camera_bottom":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow.camera,"bottom",value));
                    break;
                case "shadow_camera_near":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow.camera,"near",value));
                    break;
                case "shadow_camera_far":
                    editor.execute(new CMD.SetValueCommand(editor,editor.selected.shadow.camera,"far",value));
                    break;

                default:
                    console.log("无效的指令");
                    break;
            }

            if (attr.includes("shadow_camera")) {
                editor.addHelper(editor.selected);
                editorEM.sceneGraphChanged.dispatch();
            }
        } else if (key.includes("material_uniforms_")) {
            // 着色器材质uniforms内属性
            attr = key.replace('material_uniforms_','');
            const object = editor.selected;
            const material = editor.getObjectMaterial(object,slot) || editor.selectedMaterial;

            if (attr.includes("color") || attr.includes("Color")) {

                editor.execute(new CMD.SetUniformColorCommand(editor,material,attr,value));
            } else {
                editor.execute(new CMD.SetUniformValueCommand(editor,material,attr,value));
            }
        } else if (key.includes("material_")) {
            attr = key.replace('material_','');
            const object = editor.selected;
            const material = editor.getObjectMaterial(object,slot) || editor.selectedMaterial;

            // 普通材质属性
            switch (attr) {
                case "name":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "color":
                    editor.execute(new CMD.SetMaterialColorCommand(editor,material,attr,value));
                    break;
                case "emissive":
                    editor.execute(new CMD.SetMaterialColorCommand(editor,material,attr,value));
                    break;
                case "side":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "emissiveIntensity":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "alphaTest":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "depthWrite":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "depthTest":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "roughness":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "metalness":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "transparent":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "opacity":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "envMapIntensity":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "wireframe":
                    editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
                    break;
                case "map":
                    editor.execute(new CMD.SetMaterialMapCommand(editor,material,"map",value));
                    break;
                case "map_image":
                    editor.execute(new CMD.SetMaterialMapCommand(editor,material,"map",value));
                    break;
                case "map_wrapS":
                    editor.execute(new CMD.SetMaterialMapValueCommand(editor,material.map,"wrapS",value));
                    break;
                case "map_wrapT":
                    editor.execute(new CMD.SetMaterialMapValueCommand(editor,material.map,"wrapT",value));
                    break;
                case "map_offset":
                    editor.execute(new CMD.SetVectorCommand(editor,object,material.map.offset,new THREE.Vector2(...value),material.map.offset.clone()));
                    material.map.needsUpdate = true;
                    editorEM.materialChanged.dispatch();
                    break;
                case "map_uvFlow":
                    editor.execute(new CMD.SetVectorCommand(editor,object,material.map.uvFlow,new THREE.Vector2(...value),material.map.uvFlow.clone()));
                    editorEM.textureUvFlowChanged.dispatch(material);
                    break;
                case "map_repeat":
                    editor.execute(new CMD.SetVectorCommand(editor,object,material.map.repeat,new THREE.Vector2(...value),material.map.repeat.clone()));
                    material.map.needsUpdate = true;
                    editorEM.materialChanged.dispatch();
                    break;
                case "map_mapping":
                    editor.execute(new CMD.SetMaterialMapValueCommand(editor,material.map,"mapping",value));
                    break;
                case "envMap":
                    editor.execute(new CMD.SetMaterialMapCommand(editor,material,"envMap",value));
                    break;
                case "envMap_image":
                    editor.execute(new CMD.SetMaterialMapCommand(editor,material,"envMap",value));
                    break;
                default:
                    console.log("无效的指令");
                    break;
            }
        } else if (key.includes("global_")) {
            attr = key.replace('global_','');
            switch (attr) {
                case "brightness":
                    editor.execute(new CMD.SetGlobalValueCommand(editor,editor.composer.brightnessContrastEffect,attr,value));
                    break;
                case "contrast":
                    editor.execute(new CMD.SetGlobalValueCommand(editor,editor.composer.brightnessContrastEffect,attr,value));
                    break;
                case "saturation":
                    editor.execute(new CMD.SetGlobalValueCommand(editor,editor.composer.hueSaturationEffect,attr,value));
                    break;
                case "shadow_enable":
                    editor.execute(new CMD.SetGlobalValueCommand(editor,editor.renderer.shadowMap,'enabled',value));
                    break;
                case "camera_position":
                    editorEM.cameraSetting.dispatch('position',value);
                    break;
                case "camera_center":
                    editorEM.cameraSetting.dispatch('center',value);
                    break;
                case "camera_near":
                    editorEM.cameraSetting.dispatch('near',value);
                    break;
                case "camera_far":
                    editorEM.cameraSetting.dispatch('far',value);
                    break;
                case "camera_fov":
                    editorEM.cameraSetting.dispatch('fov',value);
                    break;
                case "background":
                    editorEM.backgroundChange.dispatch(value);
                    break;
                case "backgroundBlurriness":
                    editor.execute(new CMD.SetGlobalValueCommand(editor,editor.scene,'backgroundBlurriness',value));
                    break;
                case "environment":
                    editorEM.environmentChange.dispatch(value);
                    break;
                case "environmentIntensity":
                    editor.execute(new CMD.SetGlobalValueCommand(editor,editor.scene,'environmentIntensity',value));
                    break;
                case "connect_socket":
                    editor.config.setKey('socket',value,'connect');
                    break;
                case "pathTracer_enabled":
                    editor.config.setKey('enabled',value,'pathTracer');
                    break;
                case "pathTracer_envBlur":
                    editor.config.setKey('envBlur',value,'pathTracer');
                    break;
                case "pathTracer_filterGlossyFactor":
                    editor.config.setKey('filterGlossyFactor',value,'pathTracer');
                    break;
                case "pathTracer_bounces":
                    editor.config.setKey('bounces',value,'pathTracer');
                    break;
                case "pathTracer_renderDelay":
                    editor.config.setKey('renderDelay',value,'pathTracer');
                    break;

                default:
                    console.log("无效的指令");
                    break;
            }
        }


    };

    /**
     * 暴露方法-------编辑器初始化
     * @param {{}} config 配置文件，包含的属性用于覆盖默认配置
     * @param {string[]} paths 模型路径数组，如果不为空，则加载模型
     */
    _FUNCS.init = function init(config,paths) {

        const localConfig = editor.config.getConfig();


        config = editor.config.transform(config);

        Util.setDefault(localConfig,config);

        editor.updateFromConfig();


        if (paths.length) {

            editor.loader.loadUrls(paths);
        }
    };

    _FUNCS.getEditorSetting = function () {

        return EDITOR_SETTING;

    };

    /**保存项目
     * @param {string} type 保存类型，如果为scene则保存所有glb和json配置，如果是config则只保存config
     */
    _FUNCS.save = function save(type) {

        editor.save(type);

    };

    /**插入指令 文本框，路径，标记，动画路径等等 */
    _FUNCS.insert = function insert(type) {
        // 激活插入功能，激活该功能时，选中指定group，
        // 进入该功能时可以通过鼠标调整mark，当选择添加标记时，激活marker
        switch (type) {
            case "label": {
                // editor.selected选择label的组
                editor.select(editor.labelGroup);
            }
            case "mark": {

            }
            case "path": {
                // MarkGroup removed: offline mode
            }
            default:
                break;
        }

    };
    /** 激活标记工具 click事件被修改， */
    _FUNCS.markerActive = function markerActive(boolean) {
        editorEM.markerActive.dispatch(boolean);

    };

    /**设置辅助网格线可视 */

    _FUNCS.gridVisible = function gridVisible(boolean) {

        editorEM.gridVisible.dispatch(boolean);
    };

    /**设置灯光可视 */
    _FUNCS.lightVisible = function lightVisible(boolean) {
        editorEM.lightHelperVisible.dispatch(boolean);
    };

    /**设置特效预览总开关 */
    _FUNCS.shaderPreview = function shaderPreview(boolean) {

        editorEM.shaderPreview.dispatch(boolean);
    };

    /**全场景所有动画开关
     * 该功能可以同时播放模型组下第一层级的所有模型上的动画
     */
    _FUNCS.allAnimation = function allAnimation(boolean) {
        editorEM.allAnimation.dispatch(boolean);

    };

    _FUNCS.singleShow = function singleShow(boolean) {
        editorEM.singleShow.dispatch(boolean);
    };


    /**绑定事件 表单提交 */
    _FUNCS.bindEvent = function bindEvent(data) {

        const { index,event } = data;
        const result = {
            value: true
        };
        const object = editor.selected;
        editorEM.bindEvent.dispatch(index,event,object,result);

        return result.value;


    };
    /**删除事件 */
    _FUNCS.deleteEvent = function deleteEvent(index) {

        const result = editorEM.deleteEvent.dispatch(index);

        return result;

    };

    /**绑定事件 表单提交 */
    _FUNCS.bindFollowEvent = function bindFollowEvent(data) {

        const { parentIndex,index,event } = data;
        editorEM.bindFollowEvent.dispatch(parentIndex,index,event);




    };
    /**删除事件 */
    _FUNCS.deleteFollowEvent = function deleteFollowEvent(data) {

        const { parentIndex,index } = data;
        editorEM.deleteFollowEvent.dispatch(parentIndex,index);



    };


    /**设置对象状态 表单提交 */
    _FUNCS.setState = function setState(state,object) {
        const target = object || editor.selected;
        editorEM.setState.dispatch(state,target);

    };

    /**删除某条状态  */
    _FUNCS.deleteState = function deleteState(key,object) {
        const target = object || editor.selected;
        editorEM.deleteState.dispatch(key,target);

    };

    /**动画播放 */
    _FUNCS.animationPlay = function animationPlay(uuid) {
        editorEM.animationPlay.dispatch(uuid);
    };

    /** 设定模型特效 */
    _FUNCS.setShader = function setShader(type) {
        /** setting案例
         * setting ={
         * type:"fresnel",
         * color:"#0000000",
         * strength:2.5
         * }
         */
        editorEM.setShader.dispatch(type);
    };


    _FUNCS.getSceneData = function getSceneData() {

        // 初始化获取scene结构和数据
        return editor.getSceneData();

    };


    /**
     * 前端选择场景中的对象 
     * @param {string} param 传入的参数值
     * @param {"uuid"|"name"} type 传入的参数类型
     * */
    _FUNCS.select = function select(param) {

        if (param === null) {
            editor.deselect();
        }

        if (param) {
            editor.selectByUuid(param);
        }

    };
    _FUNCS.selectMaterial = function selectMaterial(param) {
        editor.selectMaterial(param);
    };

    /**
    * 双击左侧列表
     * */
    _FUNCS.objectFocus = function objectFocus(uuid) {
        editorEM.objectFocused.dispatch(editor.selected);
    };
    /**
    * 双击左侧列表
     * */
    _FUNCS.lockObject = function lockObject(param) {
        const { uuid,value } = param;

        const node = editor.getNodeByUuid(uuid);
        if (!node) return;
        editor.execute(new CMD.LockObjectCommand(editor,node,value));

    };


    /**
     * 获取全局配置
     * */
    _FUNCS.getGlobalSetting = function getGlobalSetting() {
        const data = editor.configData;
        return data;
    };

    /**
     * 材质设置
     */
    _FUNCS.setMaterial = function setMaterial(material) {
        // 没有选中目标或者目标没有材质
        if (!editor.selected || !editor.selected.material) return;
        editor.execute(new CMD.SetMaterialCommand(editor,editor.selected,material));
    };

    _FUNCS.getAllMaterial = function getAllMaterial() {
        const data = editor.materialData;
        return data;
    };

    _FUNCS.setTransformControls = function setTransformControls(param) {

        editor.transformControls.setMode(param);

        editorEM.sceneGraphChanged.dispatch();

    };

    _FUNCS.getEventData = function getEventData() {

        const select = editor.selected;

        if (select === null) return;

        const uuid = select.uuid;

        const node = editor.getNodeByUuid(uuid);

        const data = node.toEventData();


        return data;
    };

    _FUNCS.moveObject = function moveObject(param) {

        const { uuid,parentUuid,index } = param;

        const obj = editor.getObjectByUuid(uuid);
        const parent = editor.getObjectByUuid(parentUuid);

        if (obj && parent && index !== undefined) {

            editor.execute(new CMD.MoveObjectCommand(editor,obj,parent,index));
        }
    };

    _FUNCS.getViewAngle = function getViewAngle() {
        const camera = editor.camera.position;
        const position = [camera.x,camera.y,camera.z];
        const controls = editor.controls.center;
        const center = [controls.x,controls.y,controls.z];
        const obj = {
            global_camera_position: position,
            global_camera_center: center
        };

        editor.config.setKey('position',position,'camera');
        editor.config.setKey('center',center,'camera');


        return obj;
    };

    _FUNCS.setViewAngle = function setViewAngle(param) {

        const position = param.global_camera_position;
        const center = param.global_camera_center;
        const camera = editor.camera;

        camera.position.set(...position);
        camera.lookAt(...center);
        camera.updateProjectionMatrix();
        editorEM.sceneGraphChanged.dispatch();
    };

    /**
     * 容器宽高修改
     */
    _FUNCS.containerResize = function containerResize() {
        editorEM.windowResize.dispatch();
    };

    /**
     * 截屏
     */
    _FUNCS.screenshot = async function screenshot() {
        const canvas = editor.renderer.domElement;
        return new Promise((reslove,reject) => {

            canvas.toBlob((blob) => {
                reslove(blob);
            });
        }).catch((err) => {
            console.log(err);
        });
    };

}



export { registerFunctions,_FUNCS,_AddObjectList };