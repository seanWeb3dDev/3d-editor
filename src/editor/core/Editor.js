import * as THREE from "three";
import * as Util from "./Util";

import { editorEM } from "./EventRegister";
import { _FUNCS,_AddObjectList } from "./FunctionRegister";

import { Composer } from "./Composer";
import { Selector } from "./Selector";

import { Config } from "./config";
import { EditorControls } from "../library";
import { History } from "./History";
import { Memory } from "../library";
import { Loader } from "./Loader";
import { Format } from "./Format";
import { AnimateManager } from "./AnimateManager";

import { exportGLTF,saveBufferAsync,saveObj } from "../library/Exporter";
import { ProcessManager } from "./loadProcess";
import { StateManager } from "./StateManager";
import { EventBinder } from "./EventBinder";
import { ShaderManager } from "./ShaderManager";
import { MaterialManager,MaterialViewport } from "./MaterialManager";
import { ParticleManager } from "./Particle";
import { PluginDispatcher } from "./plugins/PluginDispatcher";



const HELPER_GEOMETRY = new THREE.SphereGeometry(2,4,2);
const HELPER_MATERIAL = new THREE.MeshBasicMaterial({
	color: 0xff0000,
	visible: false,
});


export class Editor {

	/** 场景结构化数据 */
	get sceneData() {
		return this.format.sceneData;
	}

	/** 相机数据 */
	get cameraData() {
		return this.format.cameraData;
	}

	/**	配置数据 */
	get configData() {
		return this.config.getConfigAgent();
	}

	get materialData() {
		return this.materialManager.getAllMaterial();
	}


	constructor(dom) {


		this.projectID = null;

		this.config = Config;

		/** 编辑器事件管理器 */
		this.editorEM = editorEM;

		/** 编辑器功能集合 */
		this._FUNCS = _FUNCS;
		this._AddObjectList = _AddObjectList;

		this.loadLength = 0;

		this.container = dom;

		this._groupList = [];

		this.renderer = this.#createRenderer();
		this.scene = new THREE.Scene();
		this.sceneHelpers = new THREE.Scene();
		this.lightHelpersGroup = new THREE.Group();
		this.lightHelpersGroup.name = 'lightHelpersGroup';
		this.lightHelpersGroup.visible = false;
		this.sceneHelpers.add(this.lightHelpersGroup);

		this.camera = this.#_updateCamera();
		this.controls = new EditorControls(this.camera,this.renderer.domElement);

		this.lightGroup = new THREE.Group();
		this.lightGroup.name = "灯光组";
		this.lightGroup.userData.groupName = "灯光组";
		this.scene.add(this.lightGroup);
		this._groupList.push(this.lightGroup);

		this.textGroup = new THREE.Group();
		this.textGroup.name = "文本组";
		this.textGroup.userData.groupName = "文本组";
		this.scene.add(this.textGroup);
		this._groupList.push(this.textGroup);

		this.particleGroup = new THREE.Group();
		this.particleGroup.name = "粒子组";
		this.particleGroup.userData.groupName = "粒子组";
		this.scene.add(this.particleGroup);
		this._groupList.push(this.particleGroup);

		this.helperLineGroup = new THREE.Group();
		this.helperLineGroup.name = "辅助线组";
		this.helperLineGroup.userData.groupName = "辅助线组";
		this.scene.add(this.helperLineGroup);
		this._groupList.push(this.helperLineGroup);

		// 用于保存辅助线和辅助标记的组
		this.sceneMarks = new THREE.Scene();
		this.sceneMarks.name = "sceneMarks";
		this.labelGroup = new THREE.Group();
		this.labelGroup.name = "标签组";
		this.sceneMarks.add(this.labelGroup);




		this.container.appendChild(this.renderer.domElement);

		// 回调函数注册
		this.callbackList = this.#_createCallbackList();

		// 模块
		this.history = new History(this);
		this.selector = new Selector(this);
		this.loader = new Loader(this);
		// Marker removed: offline mode

		// 动画相关
		this.animateManager = new AnimateManager(this);
		this.mixer = this.animateManager.mixer;
		this.animations = [];

		/**
* 数据格式化
*/
		this.format = new Format(this);
		this.composer = this.#createComposer();

		this.viewportCamera = this.camera;

		// 状态管理
		this.stateManager = new StateManager(this);

		// 事件绑定
		this.eventBinder = new EventBinder(this);
		// 模型处理
		this.processManager = new ProcessManager(this);
		// 着色器管理
		this.shaderManager = new ShaderManager(this);
		// 材质管理器视口
		this.materialViewport = new MaterialViewport(this);
		// 材质管理
		this.materialManager = new MaterialManager(this);
		// 粒子管理
		this.particleManager = new ParticleManager(this);

		// 插件函数派发器
		this.pluginDispatcher = new PluginDispatcher(this);




		/**@type {THREE.Object3D} */
		this.selected = null;
		/**@type {THREE.Material} */
		this.selectedMaterial = null;

		/**@type {{[key:string]:THREE.Helper}} */
		this.helpers = {};
		/**@type {{[key:string]:THREE.Camera}} */
		this.cameras = {};
		/**@type {THREE.Light[]}*/
		this.lights = [];

				this.mcpClient = null;

	}

	/**
 * 注册回调
 * @param {{[key:string]:()=>void}} object 
 */
	register = (object) => {

		const keys = Reflect.ownKeys(object);

		keys.forEach(key => {

			if (Reflect.has(this.callbackList,key) && typeof object[key] === "function") {

				this.callbackList[key] = object[key];

			}

		});

	};

	/**@param {THREE.Object3D} object 被选中对象 */
	select(object) {

		this.selectedMaterial && (this.selectedMaterial = null);

		this.selector.select(object);
	}

	/** 取消选中 */
	deselect() {
		this.selector.deselect();
	}


	/**
	 * @param {THREE.Object3D} object
	 * @param {THREE.Object3D} parent
	 * @param {number} index
	 */
	addObject(object,parent = undefined,index = 0) {
		const scope = this;
		const materialManager = scope.materialManager;
		const particleManager = scope.particleManager;

		object.traverse((child) => {

			// 文本模型的材质不被材质管理记录，也不可在页面被选中
			if (child.material !== undefined && !child.isText) {
				materialManager.addMaterial(child.material);
			}

			if (child.isParticle) {

				particleManager.addParticle(child);
			}

			scope.addCamera(child);
			scope.addHelper(child);
		});

		if (object.isLight) {
			this.lights.push(object);
			parent = this.lightGroup;
		}




		this.editorEM.addObject.dispatch(object,parent,index);
		this.editorEM.sceneGraphChanged.dispatch();

		// 添加后选择模型

		if (this.loadLength < 1) {

			this.loadLength = 0;

			this.select(object);
		}


	}
	removeObject(object) {
		if (object.parent === null) return; // avoid deleting the camera or scene

		// Marker removed: offline mode

		const scope = this;
		const materialManager = scope.materialManager;
		const particleManager = scope.particleManager;

		object.traverse(function (child) {
			scope.removeCamera(child);
			scope.removeHelper(child);

			if (child.material !== undefined) materialManager.removeMaterial(child.material);
			if (child.isParticle) {

				particleManager.removeParticle(child);
			}

		});


		// 移除行为是可以撤销的，所以在缓存中依然保留数据，不需要执行dispose，只需要将目标移出父节点即可
		object.parent.remove(object);

		this.editorEM.removeObject.dispatch(object);
		this.editorEM.sceneGraphChanged.dispatch();

		// 移除后取消模型选择

		this.deselect();

	}
	/**
	 * @param {THREE.Camera} camera
	 */
	addCamera(camera) {
		if (camera.isCamera) {
			this.cameras[camera.uuid] = camera;
		}
	}

	/**
	 * @param {THREE.Camera} camera
	 */
	removeCamera(camera) {
		if (this.cameras[camera.uuid] !== undefined) {
			delete this.cameras[camera.uuid];
		}
	}
	/**
	 * @param {THREE.Object3D} object
	 * @param {THREE.Helper|undefined} helper
	 */
	addHelper(object,helper) {
		if (helper === undefined) {
			if (object.isCamera) {
				helper = new THREE.CameraHelper(object);
			} else if (object.isPointLight) {
				helper = new THREE.PointLightHelper(object);
			} else if (object.isDirectionalLight) {
				helper = this.helpers[object.id] || new THREE.DirectionalLightHelper(object);
				const camera = object.shadow.camera;

				// 直线光内的相机特殊处理
				// 当在编辑器内修改直线光阴影相机参数时，相机helper会被清除然后重新生成
				// 每一次属性被修改时都会执行该流程

				if (this.helpers[camera.uuid]) {
					const cameraHelper = this.helpers[camera.uuid];
					cameraHelper.parent.remove(cameraHelper);
					delete this.helpers[camera.uuid];
				}

				const cameraHelper = new THREE.CameraHelper(camera);
				helper.add(cameraHelper);
				this.helpers[camera.uuid] = cameraHelper;

			} else if (object.isSpotLight) {
				helper = new THREE.SpotLightHelper(object);
			} else if (object.isHemisphereLight) {
				helper = new THREE.HemisphereLightHelper(object);
			} else if (object.isSkinnedMesh) {

				// todo 当前项目没有控制骨骼需求，骨骼由于会影响交互，先取消骨骼生成
				helper = new THREE.SkeletonHelper(object.skeleton.bones[0]);
			} else if (
				object.isBone === true &&
				object.parent &&
				object.parent.isBone !== true
			) {
				helper = new THREE.SkeletonHelper(object);
			} else {
				// 该类型的对象没有特定的helper，无需添加
				return;
			}

			const picker = new THREE.Mesh(HELPER_GEOMETRY,HELPER_MATERIAL);
			picker.name = "picker";
			picker.userData.object = object;
			helper.add(picker);

		}

		if (helper instanceof THREE.SkeletonHelper) {

			// todo 当前项目没有控制骨骼需求，骨骼由于会影响交互，先取消骨骼生成
			this.sceneHelpers.add(helper);

		} else {
			// helper.visible = false;
			this.lightHelpersGroup.add(helper);
		}
		this.helpers[object.id] = helper;
	}
	/**
	 * @param {THREE.Object3D} object
	 */
	removeHelper(object) {
		const helper = this.helpers[object.id];
		if (helper !== undefined) {
			helper.parent.remove(helper);
			delete this.helpers[object.id];
		}

		// todo 直线光内的helper特殊处理
		if (object.isDirectionalLight) {
			const camera = object.shadow.camera;
			if (this.helpers[camera.uuid]) {
				const cameraHelper = this.helpers[camera.uuid];
				cameraHelper.parent.remove(cameraHelper);
				delete this.helpers[camera.uuid];
			}
		}
	}

	/**
	 * @param {Command} cmd
	 * @param {string} optName
	 */
	execute(cmd,optName) {
		this.history.execute(cmd,optName);
	}
	historyUndo() {
		this.history.undo();
	}
	historyRedo() {
		this.history.redo();
	}
	/**
	 * todo 如果当前版本有任何需要过滤的组 可以在此处添加过滤条件
	* 获取scene节点数据,对节点数据进行过滤处理
	*/
	getSceneData() {
		const sceneData = this.sceneData;

		const children = sceneData.children;
		for (let i = 0; i < children.length; i++) {

			const child = children[i];
			if (child.name === '网格组') {
				children.splice(i,1);
			}

		}
		return sceneData;
	}

	/**
 * 根据uuid选择三维对象
 * @param {string} uuid
 */
	selectByUuid(uuid) {

		const obj = this.getObjectByUuid(uuid);

		if (!obj) return;

		if (obj.isLocked) return false;

		this.select(obj);

	}
	/**
* 根据uuid获取三维对象
* @param {string} uuid
*/
	getObjectByUuid(uuid) {

		/// 场景数据映射表
		const objMap = this.format.objectMap;

		// 如果不存在，可能是相机
		if (!objMap.has(uuid)) return;

		const node = objMap.get(uuid);

		return node.object;

	}
	/**
* 根据uuid获取三维对象的节点
* @param {string} uuid
*/
	getNodeByUuid(uuid) {

		/// 场景数据映射表
		const objMap = this.format.objectMap;

		// 如果不存在，可能是相机
		if (!objMap.has(uuid)) return;

		const node = objMap.get(uuid);

		return node;

	}



	/**
* 根据uuid选择材质
* @param {string} uuid
*/

	selectMaterial(uuid) {

		// 选择材质时如果选择了模型，要取消选择
		this.deselect();

		const material = this.materialManager.getMaterialByUuid(uuid);

		if (!material) return;

		this.selectedMaterial = material;

		this.editorEM.materialSelected.dispatch(material);

	}


	/** 
	 * 释放对象内存
	 * @param {THREE.Object3D|THREE.Material|THREE.BufferGeometry} object
	 */
	dispose(object,removeFromParent = false) {


		// 根据不同的object需要运行不同的dispose
		Memory.dispose(object,removeFromParent);
	}

	getObjectMaterial(object,slot) {

		if (!object) return null;

		var material = object.material;

		if (Array.isArray(material) && slot !== undefined) {
			material = material[slot];
		}
		return material;
	}

	setObjectMaterial(object,slot,newMaterial) {

		if (Array.isArray(object.material) && slot !== undefined) {
			const old = object.material[slot];
			if (old.uuid !== newMaterial.uuid) {
				object.material[slot] = newMaterial;
				this.materialManager.addMaterial(newMaterial);
				this.materialManager.removeMaterial(old);
			}
		} else {
			const old = object.material;
			if (old.uuid !== newMaterial.uuid) {
				object.material = newMaterial;
				this.materialManager.addMaterial(newMaterial);
				this.materialManager.removeMaterial(old);
			}
		}

	}

	lockControl() {
		this.controls.enabled = false;
	}
	unlockControl() {
		this.controls.enabled = true;
	}

	updateFromConfig() {
		this.#_updateCamera();
		this.#_updateControls();

		this.#_updateScene();
		this.#_updateRenderer();
		this.#_updateComposer();
		this.editorEM.rendererChanged.dispatch();
	}


	async save(type = "scene") {

		if (type === "scene") {

			this.editorEM.saveScene.dispatch(this.scene);
		}
		if (type === "config") {
			this.callbackList.fileConfig(this.config.getTransformConfig());
		}
	}



	/** 根据配置文件创建合成器composer */
	#createComposer() {
		const setting = {
			hue: Config.getKey("hue"),
			contrast: Config.getKey("contrast"),
			brightness: Config.getKey("brightness"),
			saturation: Config.getKey("saturation"),
		};

		const composer = new Composer(this.renderer,this.scene,this.camera,setting);
		return composer;
	}
	/** 根据配置文件创建新渲染器，销毁旧渲染器 */
	#createRenderer() {

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			logarithmicDepthBuffer: true,
			precision: "highp",
		});
		renderer.setSize(this.container.offsetWidth,this.container.offsetHeight);
		renderer.shadowMap.enabled = Config.getKey("shadow_enable");
		renderer.info.autoReset = false;

		renderer.domElement.removeAttribute("data-engine");


		return renderer;
	}
	#_updateRenderer() {
		const renderer = this.renderer;
		renderer.shadowMap.enabled = Config.getKey("shadow_enable");

		renderer.domElement.removeAttribute("data-engine");
	}

	/** 
	 * 根据配置文件创建相机，如果存在相机，则更新相机
	 * @returns {THREE.PerspectiveCamera}
	 */
	#_updateCamera() {
		const camera = this.camera ? this.camera : new THREE.PerspectiveCamera();

		camera.far = Config.getKey("far",'camera');
		camera.near = Config.getKey("near",'camera');
		camera.fov = Config.getKey("fov",'camera');
		camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
		camera.position.set(...Config.getKey("position",'camera'));
		camera.updateProjectionMatrix();
		camera.lookAt(...Config.getKey("center",'camera'));



		return camera;
	}

	#_updateControls() {
		console.log(this.controls);
		this.controls.center.set(...Config.getKey("center",'camera'));
	}
	#_updateComposer() {
		const setting = {
			hue: Config.getKey("hue"),
			contrast: Config.getKey("contrast"),
			brightness: Config.getKey("brightness"),
			saturation: Config.getKey("saturation"),
		};
		this.composer.updatePass(setting);
	}

	/** 根据配置文件创建场景，如果存在场景，则更新场景 */
	#_updateScene() {
		const background = Config.getKey("background");
		const scene = this.scene;
		scene.backgroundBlurriness = Config.getKey("backgroundBlurriness");
		scene.environmentIntensity = Config.getKey("environmentIntensity");
		if (typeof background === "number" || typeof background === 'string' && background[0] === '#') {
			scene.background = new THREE.Color(background);
			Config.setKey("background",scene.background);

		} else if (background.isColor) {
			scene.background = background;
			Config.setKey("background",scene.background);
		} else {

			Util.toTexture(background).then(texture => {

				if (texture) {
					texture.mapping = THREE.EquirectangularReflectionMapping;
					texture.colorSpace = THREE.SRGBColorSpace;
					scene.background = texture;

				}
				if (typeof background === "string") {
					Config.setKey("background",background);
				} else if (background instanceof File) {
					Config.setKey("background",background);
				}

				this.editorEM.rendererChanged.dispatch();


			}).catch(err => {
				console.log(err);
			});
		}

		const environment = Config.getKey("environment");

		if (environment) {
			Util.toTexture(environment).then(texture => {

				if (texture) {
					texture.mapping = THREE.EquirectangularReflectionMapping;
					texture.colorSpace = THREE.SRGBColorSpace;
					scene.environment = texture;

				}

				this.editorEM.rendererChanged.dispatch();


			}).catch(err => {
				console.log(err);
			});
		}
	}
	#_createCallbackList() {
		return {
			/** 获取模型树结构 */
			modelData: () => { },

			/** 模型文件流 */
			fileBuffer: () => { },
			/**保存config文件 */
			fileConfig: () => { },

			/** 删除模型回调 */
			delete: () => { },

			/** 选中模型回调 */
			selected: () => { },

			/** 加载进度 */
			loadProgress: () => { },

			/** 三维通知前端更新视图 */
			updateView: () => { },

			/** 三维更新渲染器信息 */
			updateRenderInfo: () => { },

			/**三维通知前端更新左侧列表数据 */
			updateSceneData: () => { },

			/** 三维通知前端更新右侧属性面板数据 */
			updateVisible: () => { },

			/** 用于二次确认的弹窗 */
			tipFun: () => { },

		};
	}

}
