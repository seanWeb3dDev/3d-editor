/**
 * 物体添加相关工具
 * 处理灯光、文本、粒子、模型、辅助线的添加
 */

import * as THREE from 'three';
import * as CMD from '../../commands';
import { createText } from '../../Text';
import { ParticleEmitter } from '../../Particle';
import { createMesh,createMirror,GEOMETRY_LIST } from '../../GeometryManager';
import { createHelperLine,createHelperDot } from '../../HelperLine';

// 支持的几何体类型（从 GEOMETRY_LIST 提取）
const SUPPORTED_GEOMETRY_TYPES = GEOMETRY_LIST.map(item => item.key);

/**
 * 添加物体
 * @param {import('../../Editor').Editor} editor
 * @param {object} params - 参数对象
 * @param {string} params.type - 类型：light / text / particle / model / helperLine
 * @param {string} params.subtype - 子类型
 * @param {string} [params.name] - 可选：物体名称（覆盖默认名称）
 * @param {string} [params.parentUuid] - 可选：父节点 UUID（覆盖默认父节点，支持任意 Object3D / Group / Scene）
 * @returns {{ success: boolean, data?: { objectId: string }, error?: { code: string, message: string } }}
 */
export function addObject(editor,params) {
	const { type,subtype,name,parentUuid } = params;

	if (!type || !subtype) {
		return {
			success: false,
			error: {
				code: 'MISSING_PARAMS',
				message: '缺少必要参数：type 或 subtype',
			},
		};
	}

	let object = null;
	let parent = null;

	try {
		switch (type) {
			case 'light':
				object = createLight(subtype);
				parent = editor.lightGroup;
				break;

			case 'text':
				object = createTextObject(subtype);
				parent = editor.textGroup;
				break;

			case 'particle':
				object = createParticleObject(subtype);
				parent = editor.particleGroup;
				break;

			case 'model':
				object = createModelObject(subtype,editor);
				parent = editor.scene;
				break;

			case 'helperLine':
				object = createHelperLineObject(subtype);
				parent = editor.helperLineGroup;
				break;

			default:
				return {
					success: false,
					error: {
						code: 'UNKNOWN_TYPE',
						message: `未知的类型: ${type}`,
					},
				};
		}

		if (!object) {
			return {
				success: false,
				error: {
					code: 'CREATE_FAILED',
					message: `无法创建物体: ${type}/${subtype}`,
				},
			};
		}

		// 统一处理名称覆盖（在创建后执行，保证所有类型都生效）
		if (name) {
			object.name = name;
		}

		// 如果指定了 parentUuid，用它覆盖默认父节点
		if (parentUuid) {
			if (parentUuid === object.uuid) {
				return {
					success: false,
					error: {
						code: 'SELF_PARENT',
						message: '不能把物体挂到自身下',
					},
				};
			}

			const customParent = editor.scene.getObjectByProperty('uuid',parentUuid);
			if (!customParent) {
				return {
					success: false,
					error: {
						code: 'PARENT_NOT_FOUND',
						message: `未找到父节点: ${parentUuid}`,
					},
				};
			}

			parent = customParent;
		}

		editor.execute(new CMD.AddObjectCommand(editor,object,parent));

		return {
			success: true,
			data: {
				objectId: object.uuid,
			},
		};
	} catch (e) {
		return {
			success: false,
			error: {
				code: 'EXECUTION_ERROR',
				message: e.message,
			},
		};
	}
}

/**
 * 创建灯光
 * @param {string} subtype - 子类型，支持预设格式如 "DirectionalLight_high"
 * @returns {THREE.Object3D | null}
 */
function createLight(subtype) {
	switch (subtype) {
		case 'group':
			return new THREE.Group();

		case 'AmbientLight':
			const ambient = new THREE.AmbientLight();
			ambient.name = '环境光';
			return ambient;

		case 'DirectionalLight':
			const directional = new THREE.DirectionalLight();
			directional.name = '直线光';
			directional.position.y = 10;
			const dShadow = directional.shadow;
			const dCamera = dShadow.camera;
			dShadow.bias = -0.0004;
			dCamera.left = -50;
			dCamera.right = 50;
			dCamera.top = 50;
			dCamera.bottom = -50;
			dCamera.far = 250;
			return directional;

		// 预设直线光 - 高精（大场景）
		case 'DirectionalLight_high':
			const highLight = new THREE.DirectionalLight(0xffffff,1.5);
			highLight.name = '高精直线光';
			highLight.castShadow = true;
			highLight.position.set(15,30,-30);
			const highShadow = highLight.shadow;
			highShadow.camera.near = 1;
			highShadow.camera.far = 500;
			highShadow.camera.right = 500;
			highShadow.camera.left = -500;
			highShadow.camera.top = 500;
			highShadow.camera.bottom = -500;
			highShadow.mapSize.width = 4096;
			highShadow.mapSize.height = 4096;
			highShadow.blurSamples = 16;
			highShadow.normalBias = 0.1;
			highShadow.bias = -0.0011;
			highShadow.radius = 0.25;
			return highLight;

		// 预设直线光 - 标准
		case 'DirectionalLight_medium':
			const mediumLight = new THREE.DirectionalLight(0xffffff,1.5);
			mediumLight.name = '标准直线光';
			mediumLight.castShadow = true;
			mediumLight.position.set(15,30,-30);
			const mediumShadow = mediumLight.shadow;
			mediumShadow.camera.near = 1;
			mediumShadow.camera.far = 500;
			mediumShadow.camera.right = 500;
			mediumShadow.camera.left = -500;
			mediumShadow.camera.top = 500;
			mediumShadow.camera.bottom = -500;
			mediumShadow.mapSize.width = 1024;
			mediumShadow.mapSize.height = 1024;
			mediumShadow.blurSamples = 8;
			mediumShadow.normalBias = 0;
			mediumShadow.bias = -0.003;
			mediumShadow.radius = 1;
			return mediumLight;

		// 预设直线光 - 小场景（室内）
		case 'DirectionalLight_room':
			const roomLight = new THREE.DirectionalLight(0xffffff,1.5);
			roomLight.name = '小场景直线光';
			roomLight.castShadow = true;
			roomLight.position.set(15,30,-30);
			const roomShadow = roomLight.shadow;
			roomShadow.camera.near = 1;
			roomShadow.camera.far = 200;
			roomShadow.camera.right = 50;
			roomShadow.camera.left = -50;
			roomShadow.camera.top = 50;
			roomShadow.camera.bottom = -50;
			roomShadow.mapSize.width = 512;
			roomShadow.mapSize.height = 512;
			roomShadow.blurSamples = 8;
			roomShadow.normalBias = 0;
			roomShadow.bias = -0.0001;
			roomShadow.radius = 2;
			return roomLight;

		case 'SpotLight':
			const spot = new THREE.SpotLight();
			spot.name = '聚光灯';
			const target = spot.target;
			target.position.y += 1;
			spot.targetProcess(target);
			return spot;

		// 预设聚光灯 - 范围光（一般聚光灯）
		case 'SpotLight_normal':
			const normalSpot = new THREE.SpotLight(0xffffff,1.5);
			normalSpot.name = '范围光';
			normalSpot.angle = Math.PI / 4;
			normalSpot.penumbra = 0.5;
			normalSpot.decay = 2;
			normalSpot.distance = 30;
			normalSpot.castShadow = true;
			normalSpot.position.set(0,10,0);
			const normalTarget = normalSpot.target;
			normalTarget.position.set(0,0,0);
			normalSpot.targetProcess(normalTarget);
			return normalSpot;

		// 预设聚光灯 - 射灯（垂直向下照射）
		case 'SpotLight_spot':
			const spotSpot = new THREE.SpotLight(0xffffff,2);
			spotSpot.name = '射灯';
			spotSpot.angle = Math.PI / 6;
			spotSpot.penumbra = 0.1;
			spotSpot.decay = 2;
			spotSpot.distance = 20;
			spotSpot.castShadow = true;
			spotSpot.position.set(0,5,0);
			const spotTarget = spotSpot.target;
			spotTarget.position.set(0,0,0);
			spotSpot.targetProcess(spotTarget);
			return spotSpot;

		case 'PointLight':
			const point = new THREE.PointLight();
			point.name = '点光源';
			return point;

		case 'HemisphereLight':
			const hemisphere = new THREE.HemisphereLight();
			hemisphere.name = '半球光';
			return hemisphere;

		default:
			return null;
	}
}

/**
 * 创建文本对象
 * @param {string} subtype
 * @returns {THREE.Object3D | null}
 */
function createTextObject(subtype) {
	switch (subtype) {
		case 'group':
			return new THREE.Group();

		case 'text':
			return createText();

		default:
			return null;
	}
}

/**
 * 创建粒子对象
 * @param {string} subtype
 * @returns {THREE.Object3D | null}
 */
function createParticleObject(subtype) {
	switch (subtype) {
		case 'group':
			return new THREE.Group();

		case 'particle':
			return new ParticleEmitter();

		default:
			return null;
	}
}

/**
 * 创建模型对象
 * @param {string} subtype
 * @param {import('../../Editor').Editor} editor
 * @returns {THREE.Object3D | null}
 */
function createModelObject(subtype,editor) {
	// 组类型
	if (subtype === 'group') {
		return new THREE.Group();
	}

	// 检查是否是支持的几何体类型
	if (!SUPPORTED_GEOMETRY_TYPES.includes(subtype)) {
		return null;
	}

	// 镜面类型处理
	if (subtype.includes('_mirror')) {
		const geometryType = subtype.split('_')[0];
		const options = {
			textureHeight: editor.container.offsetWidth,
			textureWidth: editor.container.offsetHeight,
		};
		return createMirror(geometryType,options);
	}

	// 普通几何体
	const mesh = createMesh(subtype);
	if (!mesh) {
		// createMesh 返回 null 表示不支持，禁止加载外部 URL
		return null;
	}

	return mesh;
}

/**
 * 创建辅助线对象
 * @param {string} subtype
 * @returns {THREE.Object3D | null}
 */
function createHelperLineObject(subtype) {
	switch (subtype) {
		case 'group':
			return new THREE.Group();

		case 'helperLine':
			const line = createHelperLine();
			const dot = createHelperDot(line);
			line.dotGroup.add(dot);
			const dot2 = createHelperDot(line);
			line.dotGroup.add(dot2);
			line.refreshSegment();
			return line;

		default:
			return null;
	}
}