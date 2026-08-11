import * as THREE from "three";
import *as QUARKS from "three.quarks";
import * as CMD from "./commands";
import { exportGLTF,exportGLTFAsync } from "../library/Exporter";
import * as Util from "./Util";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Editor } from "./Editor";
import { AddObjectCommand,SetPositionCommand,SetRotationCommand,SetScaleCommand,SetMaterialValueCommand } from "./commands";
import { ViewHelper } from "../library";
import { TransformControls } from "../library";


//todo
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { shaderUpdateTime } from "./material/constant";
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { particleBehaviorJSON } from "./Particle";


/**
 * @param {Editor} editor
 * @returns
 */

function Viewport(editor) {
	/**事件管理器 */
	const editorEM = editor.editorEM;
	/** 后处理渲染器 */
	const composer = editor.composer;

	const _FUNCS = editor._FUNCS;

	const scene = editor.scene;

	const camera = editor.camera;

	const controls = editor.controls;

	const container = editor.container;

	const sceneHelpers = editor.sceneHelpers;

	const selector = editor.selector;

	const marker = editor.marker;

	const mixer = editor.mixer;

	const format = editor.format;

	let autoUpdate = false;

	let shaderPreview = false;

	let pasteBoard = null;

	const materialViewport = editor.materialViewport;

	const materialManager = editor.materialManager;

	const particleManager = editor.particleManager;

	editor.render = render;


	let renderer = editor.renderer;
	renderer.setAnimationLoop(animate);


	// 辅助网格线
	const sceneGrid = new THREE.Group();
	sceneGrid.name = "网格组";
	sceneGrid.userData.groupName = "网格组";

	const grid1 = new THREE.GridHelper(30,30,0x888888);
	grid1.material.color.setHex(0x888888);
	grid1.material.vertexColors = false;
	grid1.layers.set(1);
	sceneGrid.add(grid1);

	scene.add(sceneGrid);


	// 视角辅助器
	const viewHelper = new ViewHelper(camera,container);
	viewHelper.center = controls.center;

	// 对象选择框
	const box = new THREE.Box3();
	const selectionBox = new THREE.Box3Helper(box); // boxHelper只有一个实例
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add(selectionBox);


	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	controls.addEventListener("change",function () {
		editorEM.cameraChanged.dispatch();
	});

	// 事件绑定

	editorEM.gridVisible.add((boolean) => {

		sceneGrid.visible = boolean;
		render();

	});

	editorEM.forTest.add(() => {
		console.log('测试专用');
	});
	editorEM.windowResize.add(() => {


		const { offsetWidth,offsetHeight } = editor.container;
		camera.aspect = offsetWidth / offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(offsetWidth,offsetHeight);

		composer.resize(offsetWidth,offsetHeight);

		materialViewport.resize(offsetWidth,offsetHeight);


		render();
	});

	editorEM.addObject.add(function (object,parent,index) {

		if (parent === undefined) {
			editor.scene.add(object);
		} else {
			parent.children.splice(index,0,object);
			object.parent = parent;
		}
		//模型添加后返回前端数据 该事件的代码在format类中

	},editor,Infinity);

	editorEM.addObject.add(function (object,parent,index) {
		// 处理辅助线添加点事件

		if (!object.isHelperDot) return;
		const line = parent.parent;
		line.refreshSegment();


	});

	editorEM.duplicate.add((uuid,index,isDeep = false,result = null) => {
		const objMap = format.objectMap;
		const node = objMap.get(uuid);

		if (!node) return;

		const obj = node.object;
		const copy = Util.hasSkeleton(obj) ? clone(obj) : obj.clone();

		if (!copy) return;

		if (obj.isLight && obj.isSpotLight) {
			const lightTarget = copy.target;
			copy.targetProcess(lightTarget);
		}

		if (isDeep) {
			// 遍历
			copy.traverse((child) => {
				if (Util.checkObjectType(child,["isMesh"])) {
					const copyMaterial = child.material.clone();
					editor.setObjectMaterial(child,0,copyMaterial);
				}
			});
		}


		editor.execute(new CMD.AddObjectCommand(editor,copy,obj.parent,index));

		// 返回新物体的 UUID
		if (result) {
			result.uuid = copy.uuid;
		}
	});

	editorEM.objectSelected.add((object) => {

		selectionBox.visible = false;
		transformControls.detach();

		if (object !== null && object !== scene && object !== camera) {

			box.setFromObject(object,true);

			if (box.isEmpty() === false) {

				selectionBox.visible = true;

			}
			transformControls.attach(object);

			// todo 新增轴向拾取功能在这里添加 在控制器中新方法然后在此处执行



		} else if (object === scene) {

			// 选择的对象是整个scene


		}

		render();


	});

	editorEM.objectFocused.add(object => {
		controls.focus(object);
	});
	editorEM.geometryChanged.add((object) => {
		if (object !== undefined) {
			box.setFromObject(object,true);
		}
		render();
	});
	editorEM.objectChanged.add((object) => {
		if (!object) return;

		if (editor.selected === object) {

			box.setFromObject(object,true);

		}

		if (object.isPerspectiveCamera) {

			object.updateProjectionMatrix();

		}
		// todo 阴影的helper特殊处理

		let id = object.id;
		if (object.isLightTarget) {
			id = object.lightId;
		}
		const helper = editor.helpers[id];


		if (helper !== undefined && helper.isSkeletonHelper !== true) {

			helper.update();

		}

		// todo postmessage 通知前端更新属性栏数据

		render();
	});
	editorEM.materialSelected.add((material) => {

		const node = format.createNode(material);

		const data = {
			material: node.toModifyJSON()
		};

		editor.callbackList.selected(data);

	});
	editorEM.materialReplaced.add((object) => {
		const uuid = object.uuid;

		const node = format.getNodeModifyJSON(uuid);

		editor.callbackList.selected(node);

		render();
	});
	editorEM.rendererCreated.add(() => {
		scene.traverse(function (child) {

			if (child.material !== undefined) {

				child.material.needsUpdate = true;

			}

		});

		render();
	});
	editorEM.sceneRendered.add((frameTime) => {
		const renderData = renderer.info.render;
		const obj = {
			frame: Number(frameTime).toFixed(2) + ' ms', //该帧渲染用时
			triangles: renderData.triangles, //三角面数
			calls: renderData.calls //每帧绘制调用次数
		};
		editor.callbackList.updateRenderInfo(obj);

	});

	editorEM.removeObject.add((object) => {

		if (object === transformControls.object) {
			transformControls.detach();
		} else {
			object.traverse((child) => {
				if (child === transformControls.object) {
					transformControls.detach();
				}
			});
		}

	});

	editorEM.removeObject.add((object) => {
		// 辅助点删除事件
		if (!object.isHelperDot) return;
		const fn = object.changeEvents.get('delete');
		fn();

	});
	editorEM.removeAllObject.add(() => {

		editor.deselect();

		const final = scene.children;


		for (let i = final.length - 1; i >= 0; i--) {
			const object = final[i];

			if (object === sceneGrid) {
				continue;
			}

			if (editor._groupList.includes(object)) { // 灯光组，文本组，粒子组
				const list = object.children;
				for (let j = list.length - 1; j >= 0; j--) {

					editor.removeObject(list[j]);
				}

			} else {

				editor.removeObject(object);
			}

		}

	});

	editorEM.lockObject.add((node,bool) => {


		const target = editor.selected;


		const obj = node.object;


		obj.traverse((child) => {
			child.isLocked = bool;
			if (target && target.uuid === child.uuid) {

				editor.deselect();
			}
		});
		editor.callbackList.modelData(node.toJSON());

	});

	// 生成数据节点
	editorEM.createNode.add((object) => {

	});
	editorEM.lightHelperVisible.add((boolean) => {
		editor.lightHelpersGroup.visible = boolean;
		if (editor.selected && editor.selected.isLight) {
			editor.deselect();
		}
		editorEM.sceneGraphChanged.dispatch();
	});

	editorEM.shaderPreview.add((boolean) => {

		shaderPreview = boolean;

	});

	editorEM.singleShow.add((boolean) => {
		const target = editor.selected;
		if (boolean) {
			// 仅显示target以及他的children
			// 隐藏Scene以下除了灯光组lightGroup以外的其他模型，仅显示target以及他的children

			// 构建从 target 到 scene 的层级链
			const hierarchyChain = new Set();
			if (target) {
				let current = target;
				while (current && current !== scene) {
					hierarchyChain.add(current);
					current = current.parent;
				}
			}

			// 遍历层级链中的每个对象，隐藏其不在层级链中的兄弟对象
			hierarchyChain.forEach((obj) => {
				const parent = obj.parent;
				if (!parent) return;

				const siblings = parent.children;
				for (let i = 0; i < siblings.length; i++) {
					const sibling = siblings[i];
					// 不在层级链中的兄弟对象需要隐藏
					if (!hierarchyChain.has(sibling)) {
						// 但如果是 scene 的子对象，需要排除 lightGroup、sceneGrid、sceneHelpers
						if (parent === scene) {
							if (sibling === editor.lightGroup || sibling === sceneGrid || sibling === sceneHelpers) continue;
						}
						sibling.visible = false;
						// todo 通知前端更新左侧视图
						editor.callbackList.updateVisible({ uuid: sibling.uuid,visible: false });
					}
				}
			});

			// 处理 scene 的顶层 children，隐藏不在层级链中的对象
			const topLevelChildren = scene.children;
			for (let i = 0; i < topLevelChildren.length; i++) {
				const obj = topLevelChildren[i];
				// lightGroup、sceneGrid、sceneHelpers 不处理
				if (obj === editor.lightGroup || obj === sceneGrid || obj === sceneHelpers) continue;
				// 在层级链中的不隐藏
				if (hierarchyChain.has(obj)) continue;

				// textGroup、particleGroup、helperLineGroup 不隐藏本身，但隐藏其子对象
				if (obj === editor.textGroup || obj === editor.particleGroup || obj === editor.helperLineGroup) {
					obj.traverse((child) => {
						if (child !== obj) {
							child.visible = false;
							// todo 通知前端更新左侧视图
							editor.callbackList.updateVisible({ uuid: child.uuid,visible: false });
						}
					});
					continue;
				}

				obj.visible = false;
				// todo 通知前端更新左侧视图
				editor.callbackList.updateVisible({ uuid: obj.uuid,visible: false });
			}
		} else {
			// 显示所有模型（lightGroup、sceneGrid、sceneHelpers 及其子对象不需要改变）
			const children = scene.children;
			for (let i = 0; i < children.length; i++) {
				const obj = children[i];
				// lightGroup、sceneGrid、sceneHelpers 不改变
				if (obj === editor.lightGroup || obj === sceneGrid || obj === sceneHelpers) continue;

				// 对需要操作的对象执行 traverse
				obj.traverse((child) => {
					child.visible = true;
					// todo 通知前端更新左侧视图
					editor.callbackList.updateVisible({ uuid: child.uuid,visible: true });
				});
			}
		}
		render();
	});



	editorEM.attributeChanged.add((uuid) => {

		if (!uuid) return;

		const node = format.getNodeModifyJSON(uuid);

		editor.callbackList.selected(node);
	});

	editorEM.cameraSetting.add((key,value) => {

		if (key === 'position') {
			camera.position.set(...value);
		} else if (key === "center") {
			camera.lookAt(new THREE.Vector3(...value));
		} else {
			camera[key] = value;
			camera.updateProjectionMatrix();
		}

		editor.config.setKey(key,value,'camera');

		render();
	});

	editorEM.backgroundChange.add((source) => {
		const reg = /^#([A-Fa-f0-9]{6})$/;
		if (reg.test(source)) {
			scene.background = new THREE.Color(source);
			render();
			editor.config.setKey('background',source);

		}


		Util.toTexture(source).then(texture => {

			if (texture !== null) {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				texture.colorSpace = THREE.SRGBColorSpace;

			} else {
				texture = new THREE.Color("#333333");
				source = "#333333";
			}
			scene.background = texture;
			render();
			editor.config.setKey('background',source);

		}).catch(err => {
			console.log(err);
		});
		render();

	});
	editorEM.environmentChange.add((source) => {


		Util.toTexture(source).then(texture => {

			if (texture !== null) {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				texture.colorSpace = THREE.SRGBColorSpace;
			}
			scene.environment = texture;
			render();
			editor.config.setKey('environment',source);

		}).catch(err => {
			console.log(err);
		});
		render();

	});
	editorEM.textureUvFlowChanged.add((material) => {
		const map = material.map;
		if (!map) return;

		if (!map.uvFlow) {
			map.uvFlow = new THREE.Vector2();
		}

		const uvFlow = map.uvFlow;

		if (uvFlow.x === 0 && uvFlow.y === 0) {
			// 没有uv流动
			materialManager.deleteUvFlowMaterial(material);
			map.name = "";
		} else {
			materialManager.addUvFlowMaterial(material);
			map.name = `uvFlow_${uvFlow.x}_${uvFlow.y}`;
		}
		map.offset.set(0,0);

	});

	// 保存场景
	editorEM.saveScene.add(async (scene) => {

		const final = scene.children;

		const fileList = {};

		const name = {

		};
		for (let i = 0; i < final.length; i++) {

			const target = final[i];
			if (["灯光组","文本组","粒子组","辅助线组"].includes(target.userData.groupName)
				&& target.children.length === 0
			) {
				// 灯光组或文本组为空，不导出glb
				continue;
			}

			if (["网格组"].includes(target.userData.groupName)) {
				// 网格组不导出glb
				continue;
			}

			const { buffer,filename } = await exportGLTFAsync(final[i]);


			// 解决filename重复问题
			let key = filename;

			if (!name[filename]) {

				name[filename] = 1;

			} else {


				while (key in name) {
					name[filename] += 1;

					key = name[filename] + "_" + filename;

				}
				name[key] = 1;
			}

			fileList[key] = buffer;

		}

		editor.callbackList.fileBuffer(fileList,editor.config.getTransformConfig());

	});


	/**动画帧函数 */

	let prevActionsInUse = 0;

	const clock = new THREE.Clock(); // only used for animations


	/**动画帧函数 */
	function animate() {
		const delta = clock.getDelta();
		autoUpdate = false;

		// todo Animatd 场景中带动画

		const actions = mixer.stats.actions;


		if (actions.inUse > 0 || prevActionsInUse > 0) {


			if (prevActionsInUse > 0 && actions.inUse === 0) {
				// 上一帧有动画播放，该帧无动画播放
				editorEM.cameraChanged.active = true;
			}

			if (prevActionsInUse === 0 && actions.inUse > 0) {
				// 上一帧无动画播放，该帧有动画播放
				editorEM.cameraChanged.active = false;
			}

			prevActionsInUse = actions.inUse;

			mixer.update(delta);

			autoUpdate = true;

			if (editor.selected !== null) {
				editor.selected.updateWorldMatrix(false,true); // avoid frame late effect for certain skinned meshes (e.g. Michelle.glb)
				selectionBox.box.setFromObject(editor.selected,true); // selection box should reflect current animation state
			}
		}




		// View Helper
		if (viewHelper.animating === true) {

			viewHelper.update(delta);
			autoUpdate = true;

		}

		if (shaderPreview) {
			const elapsedTime = clock.getElapsedTime();
			shaderUpdateTime(elapsedTime);
			particleManager.update(delta);
			materialManager.uvFlowUpdate(elapsedTime);
			autoUpdate = true;

		}
		if (autoUpdate === true) renderFrame();
	}

	/** 渲染函数 */

	let startTime = 0;
	let endTime = 0;

	function render() {
		//如果渲染器已经开启自动更新 如动画播放或者特效预览情况下，renderFrame会在帧动画内自动执行
		if (autoUpdate) return;
		renderFrame();
	}

	function renderFrame() {
		startTime = performance.now();

		composer.render();
		camera.layers.enableAll();

		if (camera === editor.viewportCamera) {
			renderer.autoClear = false;
			renderer.render(editor.sceneMarks,camera);
			// if (sceneGrid.visible === true) renderer.render(sceneGrid,camera);
			if (sceneHelpers.visible === true) renderer.render(sceneHelpers,camera);
			viewHelper.render(editor.renderer);
			materialViewport.visible && materialViewport.render();
			renderer.autoClear = true;

		}

		endTime = performance.now();


		editorEM.sceneRendered.dispatch(endTime - startTime);
		renderer.info.reset();
	}

	function updateAxisSphereLineGeometry() {

		const positions = axisSphereLine.geometry.attributes.position.array;
		positions[0] = axisSphereLineStart.x;
		positions[1] = axisSphereLineStart.y;
		positions[2] = axisSphereLineStart.z;
		positions[3] = axisSphereLineEnd.x;
		positions[4] = axisSphereLineEnd.y;
		positions[5] = axisSphereLineEnd.z;
		axisSphereLine.geometry.attributes.position.needsUpdate = true;
		axisSphereLine.geometry.computeBoundingSphere();

	}

	function updateAxisSphereLineFromPointer() {

		if (axisSphereLineActive !== true) return;

		const lineCamera = transformControls.camera || editor.viewportCamera || camera;
		axisSphereRaycaster.setFromCamera(axisSpherePointer,lineCamera);

		if (axisSphereRaycaster.ray.intersectPlane(axisSphereDragPlane,axisSpherePlaneHit)) {

			axisSphereLineEnd.copy(axisSpherePlaneHit);
			updateAxisSphereLineGeometry();
			render();

		}

	}

	// 转换控制器

	let objectPositionOnDown = null;
	let objectRotationOnDown = null;
	let objectScaleOnDown = null;
	const axisSpherePointer = new THREE.Vector2();
	const axisSphereRaycaster = new THREE.Raycaster();
	const axisSphereDragPlane = new THREE.Plane();
	const axisSphereLineStart = new THREE.Vector3();
	const axisSphereLineEnd = new THREE.Vector3();
	const axisSpherePlaneHit = new THREE.Vector3();
	let axisSphereLineActive = false;

	const axisSphereLineGeometry = new THREE.BufferGeometry();
	axisSphereLineGeometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0],3));
	const axisSphereLine = new THREE.Line(axisSphereLineGeometry,new THREE.LineBasicMaterial({
		color: 0xffff00,
		depthTest: false,
		depthWrite: false,
		transparent: true,
		opacity: 0.9
	}));
	axisSphereLine.visible = false;
	axisSphereLine.renderOrder = Infinity;
	sceneHelpers.add(axisSphereLine);
	const transformControls = new TransformControls(camera,container);

	editor.transformControls = transformControls;

	transformControls.addEventListener('objectChange',function () {

		// if ((elapsedTime.value * 10) & 1) return;

		editorEM.objectChanged.dispatch(transformControls.object);

	});
	transformControls.addEventListener('mouseDown',function () {

		const object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;

		if (transformControls._isAxisSphereDrag) {

			const start = transformControls.getAxisSphereDragStartWorldPosition(axisSphereLineStart);
			if (start) {

				const lineCamera = transformControls.camera || editor.viewportCamera || camera;
				lineCamera.updateMatrixWorld();
				lineCamera.getWorldDirection(axisSphereDragPlane.normal);
				axisSphereDragPlane.setFromNormalAndCoplanarPoint(axisSphereDragPlane.normal,axisSphereLineStart);
				axisSphereLineEnd.copy(axisSphereLineStart);
				updateAxisSphereLineGeometry();
				axisSphereLine.visible = true;
				axisSphereLineActive = true;
				render();

			}

		}

	});
	transformControls.addEventListener('mouseUp',function () {
		// 记录位移的最后一次指令，用于撤销功能
		const object = transformControls.object;

		if (object !== undefined) {

			switch (transformControls.getMode()) {

				case 'translate':

					if (!objectPositionOnDown.equals(object.position)) {


						editor.execute(new SetPositionCommand(editor,object,object.position,objectPositionOnDown));
						// 修改后发送新节点数据给前端

						editorEM.attributeChanged.dispatch(object.uuid);

					}

					break;

				case 'rotate':

					if (!objectRotationOnDown.equals(object.rotation)) {

						editor.execute(new SetRotationCommand(editor,object,object.rotation,objectRotationOnDown));

						// 修改后发送新节点数据给前端
						editorEM.attributeChanged.dispatch(object.uuid);
					}

					break;

				case 'scale':

					if (!objectScaleOnDown.equals(object.scale)) {

						editor.execute(new SetScaleCommand(editor,object,object.scale,objectScaleOnDown));

						// 修改后发送新节点数据给前端
						editorEM.attributeChanged.dispatch(object.uuid);

					}

					break;

			}

		}

		controls.enabled = true;
		axisSphereLineActive = false;
		axisSphereLine.visible = false;
		render();

	});

	sceneHelpers.add(transformControls);


	// 鼠标事件

	const onDownPosition = new THREE.Vector2();
	const onUpPosition = new THREE.Vector2();
	const onDoubleClickPosition = new THREE.Vector2();


	function getMousePosition(dom,x,y) {

		const rect = dom.getBoundingClientRect();
		return [(x - rect.left) / rect.width,(y - rect.top) / rect.height];

	}
	function handleClick() {
		// todo 点击事件位置，标点，元素拾取等
		if (onDownPosition.distanceTo(onUpPosition) !== 0) return;



		// todo 标记工具
		if (marker && marker.active) {
			const intersects = marker.getPointerIntersects(onUpPosition,camera);
			editorEM.markerDetected.dispatch(intersects);
			return;
		}
		const intersects = selector.getPointerIntersects(onUpPosition,camera);
		editorEM.selectorDetected.dispatch(intersects);

		render();
	}


	function onMouseDown(event) {

		// event.preventDefault();

		if (event.target !== renderer.domElement) return;

		const array = getMousePosition(container,event.clientX,event.clientY);
		onDownPosition.fromArray(array);
		axisSpherePointer.set(array[0] * 2 - 1,- (array[1] * 2) + 1);

		document.addEventListener('mouseup',onMouseUp);

	}

	function onMouseUp(event) {

		const array = getMousePosition(container,event.clientX,event.clientY);
		onUpPosition.fromArray(array);

		handleClick();

		document.removeEventListener('mouseup',onMouseUp);

	}

	function onMouseMove(event) {

		const array = getMousePosition(container,event.clientX,event.clientY);
		axisSpherePointer.set(array[0] * 2 - 1,- (array[1] * 2) + 1);
		updateAxisSphereLineFromPointer();

	}

	function onDoubleClick(event) {

		const array = getMousePosition(container,event.clientX,event.clientY);
		onDoubleClickPosition.fromArray(array);

		//todo 标记工具
		if (marker.active) {
			return;
		}

		const intersects = selector.getPointerIntersects(onDoubleClickPosition,camera);

		if (intersects.length > 0) {

			const intersect = intersects[0];
			editorEM.objectFocused.dispatch(intersect.object);


		}

	}

	container.addEventListener('mousedown',onMouseDown);
	container.addEventListener('mousemove',onMouseMove);
	container.addEventListener('dblclick',onDoubleClick);

	render();
	afterLoad();
	function afterLoad() {
		//todo 模型加载测试


		window.addEventListener('keyup',e => {
			const code = e.code;

			const activeDom = document.activeElement;
			const classList = [...activeDom.classList];
			if (classList.includes("el-dialog") ||
				classList.includes("rich-div") ||
				["text","number"].includes(activeDom.type)
			) {
				// 页面在弹框或者在文本输入框时不出发canvas事件
				return;
			}
			if (e.code === 'Digit6') {
			}
			// if (e.code === 'Digit7') {
			// 	plane.updateMatrix(); // 更新平面的变换矩阵
			// 	const pointA = new THREE.Vector3(pointArr[0],pointArr[1],pointArr[2]);
			// 	const pointB = new THREE.Vector3(pointArr[3],pointArr[4],pointArr[5]);
			// 	const pointC = new THREE.Vector3(pointArr[6],pointArr[7],pointArr[8]);
			// 	pointA.applyMatrix4(plane.matrixWorld);
			// 	pointB.applyMatrix4(plane.matrixWorld);
			// 	pointC.applyMatrix4(plane.matrixWorld);

			// 	mathPlane.setFromCoplanarPoints(pointC,pointB,pointA);

			// }
			// if (e.code === 'Digit8') {


			// 	editor.execute(new AddObjectCommand(editor,plane));

			// 	particle = new ParticleEmitter(set);
			// 	particle.position.set(0,4,0);
			// 	particle.rotation.set(1.218,0,0);

			// 	editor.execute(new AddObjectCommand(editor,particle,editor.particleGroup));




			// 	// console.log(scene);

			// }
			if (e.code === 'Digit9') {




			}


			// 键盘事件
			if (e.code === 'Delete') {
				const target = editor.selected;
				if (!target) return;
				editor.execute(new CMD.RemoveObjectCommand(editor,target));

			}

			if (e.ctrlKey === true) {
				if (e.code === "Digit0") {

					console.log(editor.getSceneData());


				}


				switch (code) {
					case "KeyB":
						break;
					case "KeyZ":
						editor.historyUndo();
						if (editor.selected) {
							editorEM.attributeChanged.dispatch(editor.selected.uuid);
						}
						break;
					case "KeyY":
						editor.historyRedo();
						if (editor.selected) {
							editorEM.attributeChanged.dispatch(editor.selected.uuid);
						}
						break;
					case "Slash":

						break;
					case "KeyC":
						if (editor.selected) {
							pasteBoard = editor.selected.uuid;
						}
						break;
					case "KeyV":

						editorEM.duplicate.dispatch(pasteBoard);

						break;

				}

			}
			if (e.altKey === true && transformControls.object) {

				switch (code) {
					case "KeyT":
						transformControls.setMode("translate");
						editor.callbackList.updateView({
							target: 'transformControls',
							param: "translate"
						});
						break;
					case "KeyR":
						transformControls.setMode("rotate");
						editor.callbackList.updateView({
							target: 'transformControls',
							param: "rotate"
						});
						break;
					case "KeyS":
						transformControls.setMode("scale");
						editor.callbackList.updateView({
							target: 'transformControls',
							param: "scale"
						});
						break;
					default:
						break;
				}
				render();
			}
		});
	}

}

export { Viewport };
