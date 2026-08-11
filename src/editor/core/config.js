import * as THREE from "three";

import { DataAgent } from "./nodes/agent/DataAgent";
import { getColorString } from "./Util";

// const path = import("path").then(e => {

// });

export const LanguageMap = {

	en: {
		// renderer
		抗锯齿: "antialias",
		阴影: "shadow_enable",
		阴影类型: "shadow_type", // PCF
		色调映射: "toneMapping", // NoToneMapping
		色调映射曝光度: "toneMappingExposure",
		对数缓冲区: "logarithmicDepthBuffer",

		// scene
		背景: "background",
		背景模糊: "backgroundBlurriness",
		环境贴图: "environment",
		环境系数: "environmentIntensity",

		// camera
		相机配置: "camera",
		相机坐标: "position",
		视觉中心: "center",
		近视面: "near",
		远视面: "far",
		相机视场角: "fov",

		// 灯光
		平行光: "DirectionalLight",
		聚光灯: "SpotLight",
		环境光: "AmbientLight",
		点光源: "PointLight",
		半球光: "HemiSphereLight",

		背景图: "map",
		天气: "weather",
		开启: "enable",
		等级: "level",
		范围: "range",
		雨: "rain",
		雪: "snow",
		星空: "stars",
		数量: "count",
		最小: "min",
		最大: "max",
		晴天背景纹理: "sunnyTexture",
		夜晚背景纹理: "nightTexture",
		阴天背景纹理: "cloudyTexture",
		夜晚阴天背景纹理: "nightCloudyTexture",
		小: "small",
		中: "middle",
		大: "heavy",

		亮度: 'brightness',
		对比度: 'contrast',
		色相: 'hue',
		饱和度: 'saturation',


		webSocket: 'socket',
		光追渲染: "pathTracer",
		环境模糊: "envBlur",
		光束量: "bounces",
		滤光: "filterGlossyFactor"



	},
	ch: {
		// renderer
		antialias: "抗锯齿",
		shadow_enable: "全局阴影",
		shadow_type: "阴影类型", // PCF
		toneMapping: "色调映射", // NoToneMapping
		toneMappingExposure: "色调映射曝光度",
		logarithmicDepthBuffer: "对数缓冲区",

		// scene
		background: "背景",
		backgroundBlurriness: "背景模糊",
		environment: "环境贴图",
		environmentIntensity: "环境系数",

		// camera
		camera: "相机配置",
		position: "相机坐标",
		center: " 视觉中心",
		near: "近视面",
		far: "远视面",
		fov: "视场角度",

		// 灯光
		DirectionalLight: "平行光",
		SpotLight: "聚光灯",
		AmbientLight: "环境光",
		PointLight: "点光源",
		HemiSphereLight: "半球光",

		map: "背景图",
		weather: "天气",
		enable: "开启",
		level: "等级",
		range: "范围",
		rain: "雨",
		snow: "雪",
		stars: "星空",
		count: "数量",
		min: "最小",
		max: "最大",
		sunnyTexture: "晴天背景纹理",
		nightTexture: "夜晚背景纹理",
		cloudyTexture: "阴天背景纹理",
		nightCloudyTexture: "夜晚阴天背景纹理",
		small: "小",
		middle: "中",
		heavy: "大",

		brightness: '亮度',
		contrast: '对比度',
		hue: '色相',
		saturation: '饱和度',

		socket: 'webSocket',
		pathTracer: "光追渲染",
		envBlur: "环境模糊",
		filterGlossyFactor: "滤光",
		bounces: "光束量"


	}

};

const closure = {
	// renderer
	shadow_enable: true,

	// scene
	background: "#333333",
	backgroundBlurriness: 0,
	environment: null,
	environmentIntensity: 0.2,


	camera: {
		position: [5,5,5],
		center: [0,0,0],
		near: 0.01,
		far: 50000,
		fov: 50,
	},

	brightness: 0,
	contrast: 0,
	hue: 0,
	saturation: 0,

	connect: {
		socket: ''
	},

	pathTracer: {
		enabled: false,
		envBlur: 0.1,
		filterGlossyFactor: 0.5,
		bounces: 10,
		renderDelay: 100
	}



};

const ShadowMapTransform = {
	0: "BasicShadowMap",
	1: "PCFShadowMap",
	2: "PCFSoftShadowMap",
	BasicShadowMap: 0,
	PCFShadowMap: 1,
	PCFSoftShadowMap: 2,
};

const ToneMappingTransform = {
	0: "NoToneMapping",
	1: "LinearToneMapping",
	2: "ReinhardToneMapping",
	3: "CineonToneMapping",
	4: "ACESFilmicToneMapping",
	NoToneMapping: 0,
	LinearToneMapping: 1,
	ReinhardToneMapping: 2,
	CineonToneMapping: 3,
	ACESFilmicToneMapping: 4
};

export const Config = {
	/**
	 * @param {keyof closure} key 
	 * @returns 
	 */
	getKey(key,group) {
		if (group) return closure[group][key];
		else return closure[key];

	},
	/**
	 * @param {keyof closure} key 
	 */
	setKey(key,value,group) {

		if (group) closure[group][key] = value;
		else
			closure[key] = value;
	},

	getCHConfig() {

		const config = {};

		Reflect.ownKeys(closure).forEach(key => {

			config[LanguageMap.ch[key]] = closure[key];

		});

		return config;

	},

	getConfig() {
		return closure;
	},

	getConfigAgent() {
		return getGlobalConfigAgent(closure);
		// return getConfigAgent(closure);
	},

	getTransformConfig() {

		const config = {};

		const defaultConfig = this.getConfig();

		const keys = Reflect.ownKeys(defaultConfig);

		keys.forEach((key) => {

			if (key === "toneMapping") {
				config[key] = ToneMappingTransform[defaultConfig[key]];
			} else if (key === "shadow_type") {
				config[key] = ShadowMapTransform[defaultConfig[key]];
			} else if (key === 'background') {
				config[key] = defaultConfig[key].isColor ? getColorString(defaultConfig[key]) : defaultConfig[key];

			} else {
				config[key] = defaultConfig[key];
			}

		});

		return config;

	},

	transform(object) {

		const config = {};

		const keys = Reflect.ownKeys(object);

		keys.forEach((key) => {

			if (key === "toneMapping") {
				config[key] = ToneMappingTransform[object[key]];
			} else if (key === "shadow_type") {
				config[key] = ShadowMapTransform[object[key]];
			} else {
				config[key] = object[key];
			}

		});

		return config;
	},

	ToneMappingTransform,
	ShadowMapTransform
};


export function getGlobalConfigAgent(_closure) {
	const setting = {};
	const camera = {};
	const connect = {};
	const pathTracer = {};
	setting.camera = camera;
	setting.shadow_enable = new DataAgent(_closure.shadow_enable,{ label: LanguageMap.ch['shadow_enable'],inputType: 'switch' });
	setting.brightness = new DataAgent(_closure.brightness,{ label: LanguageMap.ch['brightness'],inputType: 'slider',range: [-1,1] });
	setting.contrast = new DataAgent(_closure.contrast,{ label: LanguageMap.ch['contrast'],inputType: 'slider',range: [-1,1] });
	setting.saturation = new DataAgent(_closure.saturation,{ label: LanguageMap.ch['saturation'],inputType: 'slider',range: [-1,1] });
	// setting.hue = new DataAgent(_closure.hue,{ label: LanguageMap.ch['hue'],inputType: 'slider',range: [0,255] });
	setting.background = new DataAgent(_closure.background,{ inputType: "chartlet",label: '背景图' });
	setting.backgroundBlurriness = new DataAgent(_closure.backgroundBlurriness,{ label: LanguageMap.ch['backgroundBlurriness'],inputType: 'input' });
	setting.environment = new DataAgent(_closure.environment,{ inputType: "imageBitmap",label: '环境贴图' });
	setting.environmentIntensity = new DataAgent(_closure.environmentIntensity,{ label: LanguageMap.ch['environmentIntensity'],inputType: 'input' });


	const _camera = _closure.camera;
	camera.position = new DataAgent(_camera.position,{ label: LanguageMap.ch['position'],inputType: 'vec3' });
	camera.center = new DataAgent(_camera.center,{ label: LanguageMap.ch['center'],inputType: 'vec3' });
	camera.near = new DataAgent(_camera.near,{ label: LanguageMap.ch['near'] });
	camera.far = new DataAgent(_camera.far,{ label: LanguageMap.ch['far'] });
	camera.fov = new DataAgent(_camera.fov,{ label: LanguageMap.ch['fov'] });
	camera.label = LanguageMap.ch['camera'];
	camera.inputType = 'group';


	//非canvas配置
	const _connect = _closure.connect;
	setting.connect = connect;
	connect.inputType = 'group';
	// connect.socket = new DataAgent(_connect.socket,{ label: LanguageMap.ch['socket'] });

	const _pathTracer = _closure.pathTracer;
	setting.pathTracer = pathTracer;
	pathTracer.inputType = 'relate';
	pathTracer.label = "光追渲染";

	pathTracer.enabled = new DataAgent(_pathTracer.enabled,{ label: "光追渲染",inputType: 'switch' });
	pathTracer.envBlur = new DataAgent(_pathTracer.envBlur,{ label: "envBlur",inputType: 'number' });
	pathTracer.filterGlossyFactor = new DataAgent(_pathTracer.filterGlossyFactor,{ label: "glossy",inputType: 'number' });
	pathTracer.bounces = new DataAgent(_pathTracer.bounces,{ label: "bounces",inputType: 'number' });
	// pathTracer.renderDelay = new DataAgent(_pathTracer.renderDelay,{ label: "延迟",inputType: 'number' });



	return setting;
}



// 各个action数据案例
export const ACTION_EXAMPLE = {
	getClose: {
		trigger: "trigger",
		action: "getClose",
	},
	postMessage: {
		trigger: "trigger",
		action: "postMessage",
		cmd: "message接口",
		param: {} // 传入接口的参数
	},
	outline: { // 文本无outline事件
		trigger: "trigger",
		action: "outline",
	},
	stateChange: {
		trigger: "trigger",
		action: "stateChange",
		state: "stateName", // 被修改的状态的名称
		value: "newValue", // 修改的状态的新值 如果trigger为socket或者onMessage时，在监听事件中先修改value
	}
};

export const SHADER_EXAMPLE = {
	fresnel: {
		type: 'fresnel',
		strength: 2.5
	}
};