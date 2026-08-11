/**
 * 物体操作相关工具
 * 处理属性修改、几何体修改、材质修改等
 */

import * as THREE from 'three';
import * as CMD from '../../commands';

/**
 * 获取物体包围盒信息
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId - 物体 UUID
 * @returns {{ success: boolean, data?: object, error?: { code: string, message: string } }}
 */
export function getBoundingBox(editor,objectId) {
	const object = editor.getObjectByUuid(objectId);

	if (!object) {
		return {
			success: false,
			error: {
				code: 'OBJECT_NOT_FOUND',
				message: `未找到物体: ${objectId}`,
			},
		};
	}

	// 计算世界坐标包围盒
	const box = new THREE.Box3();
	box.setFromObject(object);

	const center = new THREE.Vector3();
	box.getCenter(center);

	const size = new THREE.Vector3();
	box.getSize(size);

	return {
		success: true,
		data: {
			center: [center.x,center.y,center.z],
			min: [box.min.x,box.min.y,box.min.z],
			max: [box.max.x,box.max.y,box.max.z],
			size: [size.x,size.y,size.z],
		},
	};
}

/**
 * 更新物体属性
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId - 物体 UUID
 * @param {object} updates - 属性更新对象 { "属性路径": 值 }
 * @returns {{ success: boolean, data?: { results: array, updatedCount: number }, error?: { code: string, message: string } }}
 */
export function updateObject(editor,objectId,updates) {
	const object = editor.getObjectByUuid(objectId);

	if (!object) {
		return {
			success: false,
			error: {
				code: 'OBJECT_NOT_FOUND',
				message: `未找到物体: ${objectId}`,
			},
		};
	}

	const results = [];

	for (const [path,value] of Object.entries(updates)) {
		const result = handleAttribute(editor,object,path,value);
		results.push({ path,...result });
	}

	const updatedCount = results.filter(r => r.success).length;

	// 如果当前选中的就是被修改的物体，刷新右侧属性面板
	if (updatedCount > 0 && editor.selected && editor.selected.uuid === objectId) {

		editor.editorEM.attributeChanged.dispatch(objectId);
	}

	return {
		success: true,
		data: {
			results,
			updatedCount,
		},
	};
}

/**
 * 处理单个属性
 * @param {import('../../Editor').Editor} editor
 * @param {THREE.Object3D} object
 * @param {string} path - 属性路径
 * @param {any} value - 新值
 * @returns {{ success: boolean, error?: string }}
 */
function handleAttribute(editor,object,path,value) {
	try {
		// 文本模型专属属性
		if (object.isText) {
			const editorEM = editor.editorEM;
			// 需要调用 syncRender.dispatch() 的属性
			const syncRenderProps = ['preText','fontSize','maxWidth','letterSpacing','font'];
			// 需要转换为 THREE.Color 的属性
			const colorProps = ['color','outlineColor'];
			// 所有支持的文本属性
			const textProps = ['overflowWrap','preText','fontSize','maxWidth','letterSpacing',
				'outlineWidth','outlineBlur','lineHeight','color','outlineColor','font'];

			if (textProps.includes(path)) {
				if (colorProps.includes(path)) {
					editor.execute(new CMD.SetValueCommand(editor,object,path,new THREE.Color(value)));
				} else {
					editor.execute(new CMD.SetValueCommand(editor,object,path,value));
					if (syncRenderProps.includes(path)) {
						editorEM.syncRender.dispatch();
					}
				}
				// 右侧面板刷新由 updateObject 统一处理，这里不再重复 dispatch
				return { success: true };
			}
			// 不是文本属性，继续走后续流程
		}

		// 灯光类型
		if (object.isLight) {
			// target 属性 - 修改 light.target 位置（仅 SpotLight/DirectionalLight）
			if (path === 'target') {
				editor.execute(new CMD.SetPositionCommand(editor,object.target,new THREE.Vector3(...value)));
				return { success: true };
			}

			// Shadow 层处理
			if (path.startsWith('shadow.')) {
				const shadow = object.shadow;
				if (!shadow) {
					return { success: false,error: '灯光没有阴影配置' };
				}

				// shadow.camera.* 属性
				if (path.startsWith('shadow.camera.')) {
					const camera = shadow.camera;
					if (!camera) {
						return { success: false,error: '阴影没有相机配置' };
					}
					const attr = path.replace('shadow.camera.','');
					editor.execute(new CMD.SetValueCommand(editor,camera,attr,value));
					editor.addHelper(object);
					editor.editorEM.sceneGraphChanged.dispatch();
					return { success: true };
				}

				// shadow.* 属性
				const attr = path.replace('shadow.','');
				if (attr === 'mapSize') {
					editor.execute(new CMD.SetShadowMapSizeCommand(editor,shadow,new THREE.Vector2(...value),shadow.mapSize.clone()));
				} else {
					editor.execute(new CMD.SetValueCommand(editor,shadow,attr,value));
				}
				return { success: true };
			}

			// 灯光普通属性
			const lightProps = ['color','intensity','angle','distance','penumbra','decay'];
			if (lightProps.includes(path)) {
				if (path === 'color') {
					editor.execute(new CMD.SetValueCommand(editor,object,path,new THREE.Color(value)));
				} else {
					editor.execute(new CMD.SetValueCommand(editor,object,path,value));
				}
				return { success: true };
			}
			// 不是灯光专属属性，继续走公共层流程
		}
		// Geometry 层处理
		if (path.startsWith('geometry.')) {
			const attr = path.replace('geometry.','');
			editor.execute(new CMD.SetGeometryCommand(editor,object,attr,value));
			// 右侧面板刷新由 updateObject 统一处理
			return { success: true };
		}

		// Material 层处理
		if (path.startsWith('material.')) {
			const material = object.material;
			if (!material) {
				return { success: false,error: '物体没有材质' };
			}

			// 着色器材质 uniforms 属性
			if (path.startsWith('material.uniforms.')) {
				const attr = path.replace('material.uniforms.','');
				if (attr.toLowerCase().includes('color')) {
					editor.execute(new CMD.SetUniformColorCommand(editor,material,attr,value));
				} else {
					editor.execute(new CMD.SetUniformValueCommand(editor,material,attr,value));
				}
				return { success: true };
			}

			// 贴图属性 - 通过 URL 设置贴图（仅支持 map）
			if (path === 'material.map') {
				editor.execute(new CMD.SetMaterialMapCommand(editor,material,'map',value));
				return { success: true };
			}

			// 贴图子属性处理
			if (path.startsWith('material.map.')) {
				const map = material.map;
				if (!map) {
					return { success: false,error: '材质没有贴图，请先手动添加贴图' };
				}
				const attr = path.replace('material.map.','');
				switch (attr) {
					case 'wrapS':
					case 'wrapT':
					case 'mapping':
						editor.execute(new CMD.SetMaterialMapValueCommand(editor,map,attr,value));
						return { success: true };
					case 'offset':
					case 'repeat':
						editor.execute(new CMD.SetVectorCommand(editor,object,map[attr],new THREE.Vector2(...value),map[attr].clone()));
						map.needsUpdate = true;
						editor.editorEM.materialChanged.dispatch();
						return { success: true };
					case 'uvFlow':
						editor.execute(new CMD.SetVectorCommand(editor,object,map.uvFlow,new THREE.Vector2(...value),map.uvFlow.clone()));
						editor.editorEM.textureUvFlowChanged.dispatch(material);
						return { success: true };
					default:
						return { success: false,error: `未支持的贴图属性: ${attr}` };
				}
			}

			// 普通材质属性
			const attr = path.replace('material.','');
			const colorProps = ['color','emissive'];
			if (colorProps.includes(attr)) {
				editor.execute(new CMD.SetMaterialColorCommand(editor,material,attr,value));
			} else {
				editor.execute(new CMD.SetMaterialValueCommand(editor,material,attr,value));
			}
			return { success: true };
		}

		// 粒子系统属性处理
		if (object.type === 'Particle' && path.startsWith('particleSetting.')) {
			const particleSystem = object.particleSystem;
			if (!particleSystem) {
				return { success: false,error: '物体没有粒子系统' };
			}

			// 将路径转换为属性名：particleSetting.startColor.type -> startColor_type
			const attr = path.replace('particleSetting.','').replace(/\./g,'_');

			// 禁止修改的属性
			if (attr === 'model') {
				return { success: false,error: '粒子模型属性无法通过 AI 修改，请在编辑器中手动设置' };
			}

			// 需要 restart 的普通属性
			const restartProps = ['duration','looping','renderMode'];
			if (restartProps.includes(attr)) {
				editor.execute(new CMD.SetValueCommand(editor,particleSystem,attr,value));
				particleSystem.restart();
				return { success: true };
			}

			// SetParticleValueCommand 属性
			const particleValueProps = ['startLife','startSize','startSpeed','emissionOverTime'];
			if (particleValueProps.includes(attr)) {
				editor.execute(new CMD.SetParticleValueCommand(editor,object,attr,value));
				return { success: true };
			}

			// SetParticleMultiValueCommand 属性
			const particleMultiValueProps = ['startRotation','startColor_type','startColor_a','startColor_b'];
			if (particleMultiValueProps.includes(attr)) {
				editor.execute(new CMD.SetParticleMultiValueCommand(editor,object,attr,value));
				return { success: true };
			}

			// emitterShape_type
			if (attr === 'emitterShape_type') {
				editor.execute(new CMD.SetParticleShapeCommand(editor,object,attr,value));
				return { success: true };
			}

			// emitterShape 子属性
			if (attr.startsWith('emitterShape_')) {
				const key = attr.replace('emitterShape_','');
				editor.execute(new CMD.SetValueCommand(editor,particleSystem.emitterShape,key,value));
				return { success: true };
			}

			// behaviors 属性
			if (attr.startsWith('behaviors_')) {
				// 解析 behaviors_behavior0_gravity -> [index=0, key=['gravity']]
				const arr = attr.replace('behaviors_behavior','').split('_');
				const index = arr.shift();
				editor.execute(new CMD.SetParticleBehaviorValueCommand(editor,object,index,arr,value));
				return { success: true };
			}

			// renderOrder
			if (attr === 'renderOrder') {
				editor.execute(new CMD.SetValueCommand(editor,particleSystem,attr,value));
				return { success: true };
			}

			return { success: false,error: `未支持的粒子属性: ${attr}` };
		}

		// 公共层属性
		switch (path) {
			case 'position':
				editor.execute(new CMD.SetPositionCommand(editor,object,new THREE.Vector3(...value)));
				return { success: true };

			case 'rotation':
				editor.execute(new CMD.SetRotationCommand(editor,object,new THREE.Euler(...value)));
				return { success: true };

			case 'scale':
				editor.execute(new CMD.SetScaleCommand(editor,object,new THREE.Vector3(...value)));
				return { success: true };

			case 'name':
				editor.execute(new CMD.SetValueCommand(editor,object,path,value));

				editor.callbackList.updateSceneData({ uuid: object.uuid,key: "label",value: value });
				return { success: true };

			case 'visible':
				editor.execute(new CMD.SetValueCommand(editor,object,path,value));

				editor.callbackList.updateSceneData({ uuid: object.uuid,key: "visible",value: value });
				return { success: true };
			case 'renderOrder':
			case 'castShadow':
			case 'receiveShadow':
				editor.execute(new CMD.SetValueCommand(editor,object,path,value));
				return { success: true };

			default:
				return { success: false,error: `未支持的属性: ${path}` };
		}
	} catch (e) {
		return { success: false,error: e.message };
	}
}

/**
 * 移动物体到指定父节点下（修改层级结构）
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId - 要移动的物体 UUID
 * @param {string} parentUuid - 目标父节点 UUID
 * @param {number} [index=-1] - 插入到父节点 children 的索引，-1 或省略表示追加到末尾
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export function moveObject(editor,objectId,parentUuid,index) {
	const object = editor.getObjectByUuid(objectId);
	if (!object) {
		return { success: false,error: `找不到要移动的物体: ${objectId}` };
	}

	const parent = editor.getObjectByUuid(parentUuid);
	if (!parent) {
		return { success: false,error: `找不到目标父节点: ${parentUuid}` };
	}

	// 安全检查：不能把祖先节点移动到子孙节点下，也不能移动到自己下
	if (parent === object) {
		return { success: false,error: `不能把物体移动到自身下` };
	}
	let isDescendant = false;
	object.traverse((child) => {
		if (child === parent) isDescendant = true;
	});
	if (isDescendant) {
		return { success: false,error: `不能把物体移动到其子孙节点下` };
	}

	const oldParent = object.parent;
	const oldIndex = oldParent ? oldParent.children.indexOf(object) : -1;

	// 决定插入索引：-1 或未定义时追加到末尾
	let insertIndex = index;
	if (insertIndex === undefined || insertIndex === null || insertIndex < 0) {
		// 追加到末尾：先计算移除后的 children 长度
		const currentLen = parent.children.length;
		insertIndex = (parent === oldParent) ? Math.max(0,currentLen - 1) : currentLen;
	} else {
		// 指定索引：限制在 [0, 移除后长度] 范围内，防止越界
		const maxIndex = (parent === oldParent)
			? Math.max(0,parent.children.length - 1)
			: parent.children.length;
		if (insertIndex > maxIndex) insertIndex = maxIndex;
	}

	try {
		editor.execute(new CMD.MoveObjectCommand(editor,object,parent,insertIndex));

		// MCP 路径触发移动时，前端不知道这次操作，需要主动通知前端刷新左侧树结构：
		// 先通知前端从旧父节点下删除该节点，再以新父节点+新索引的位置重新插入
		try {
			editor.callbackList.delete?.(object.uuid);
			const node = editor.getNodeByUuid(object.uuid);
			if (node && editor.callbackList.modelData) {
				const json = node.toJSON();
				// 关键：前端 Index.js loadInfo 回调直接取 obj.parent 当作父节点 UUID 传给左侧树组件；
				// 而 Three.js toJSON() 已经把 parent 序列化为 UUID 字符串，无需再取 .uuid。
				// 此处显式确保 parent 字段为 UUID 字符串，避免前端拿到 Object3D 导致 parentUid 为 undefined。
				json.parent = object.parent ? object.parent.uuid : null;
				editor.callbackList.modelData(json,insertIndex);
				console.log(json);
			}
		} catch (notifyErr) {
			// 通知失败不影响移动结果，仅记录日志
			console.warn('[moveObject] 通知前端刷新树结构失败:',notifyErr);
		}

		return {
			success: true,
			data: {
				objectId,
				parentUuid,
				oldParentUuid: oldParent ? oldParent.uuid : null,
				oldIndex,
				newIndex: insertIndex,
			},
		};
	} catch (e) {
		return { success: false,error: e.message };
	}
}