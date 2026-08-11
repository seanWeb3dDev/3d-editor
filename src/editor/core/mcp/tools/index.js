/**
 * 工具统一导出（离线版精简：移除 event/resourceLibrary/pointTable/wait）
 */

import { getSceneInfo,selectObject,getObjectDetail } from './scene.js';
import { updateObject,getBoundingBox,moveObject } from './operate.js';
import { addObject } from './add.js';
import { deleteObject,clearScene } from './delete.js';
import { setState,deleteState } from './state.js';
import { duplicateObject } from './duplicate.js';
import { saveProject } from './save.js';
import { exportObject } from './export.js';
import { setMaterial } from './material.js';
import { generateFromHelperLine } from './helperLine.js';
import { toggleTool,toggleModelAnimation } from './toolbar.js';

/**
 * 命令处理映射
 */
export const commandHandlers = {
	getSceneInfo: getSceneInfo,
	selectObject: selectObject,
	getObjectDetail: getObjectDetail,
	updateObject: updateObject,
	getBoundingBox: getBoundingBox,
	moveObject: moveObject,
	addObject: addObject,
	deleteObject: deleteObject,
	clearScene: clearScene,
	setState: setState,
	deleteState: deleteState,
	duplicateObject: duplicateObject,
	saveProject: saveProject,
	exportObject: exportObject,
	setMaterial: setMaterial,
	generateFromHelperLine: generateFromHelperLine,
	toggleTool: toggleTool,
	toggleModelAnimation: toggleModelAnimation,
};

/**
 * 执行命令
 * @param {import('../../Editor').Editor} editor
 * @param {string} command
 * @param {object} params
 * @returns {Promise<{ success: boolean, data?: any, error?: { code: string, message: string } }>}
 */
export async function executeCommand(editor,command,params) {
	const handler = commandHandlers[command];

	if (!handler) {
		return {
			success: false,
			error: {
				code: 'UNKNOWN_COMMAND',
				message: `未知的命令: ${command}`,
			},
		};
	}

	switch (command) {
		case 'getSceneInfo':
			return handler(editor);
		case 'selectObject':
			return handler(editor,params.objectId);
		case 'getObjectDetail':
			return handler(editor,params.objectId);
		case 'getBoundingBox':
			return handler(editor,params.objectId);
		case 'moveObject':
			return handler(editor,params.objectId,params.parentUuid,params.index);
		case 'updateObject':
			return handler(editor,params.objectId,params.updates);
		case 'addObject':
			return handler(editor,params);
		case 'deleteObject':
			return handler(editor,params.objectId);
		case 'clearScene':
			return handler(editor);
		case 'setState':
			return handler(editor,params.objectId,params.state);
		case 'deleteState':
			return handler(editor,params.objectId,params.key);
		case 'saveProject':
			return await handler(editor,params.type);
		case 'duplicateObject':
			return handler(editor,params.objectId,params.options);
		case 'exportObject':
			return handler(editor,params.objectId,params.format);
		case 'setMaterial':
			return handler(editor,params.targetObjectUuid,params.materialSource,params.materialSlot);
		case 'generateFromHelperLine':
			return handler(editor,params.helperLineUuid,params.generateType);
		case 'toggleTool':
			return handler(editor,params.toolKey,params.value);
		case 'toggleModelAnimation':
			return handler(editor,params.objectId,params.clipUuids);
		default:
			return handler(editor,params);
	}
}
