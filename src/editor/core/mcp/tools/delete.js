/**
 * 删除物体
 */

import * as CMD from '../../commands/index.js';

/**
 * 删除场景中的物体
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId 物体 UUID
 * @returns {{ success: boolean, objectId?: string, error?: string }}
 */
export function deleteObject(editor,objectId) {
	// 获取物体
	const node = editor.format.get(objectId);
	if (!node) {
		return { success: false,error: '找不到该物体' };
	}

	const object = node.object;

	// 检查锁定状态
	if (node.isLocked) {
		return { success: false,error: '该物体已被锁定，无法删除' };
	}

	// 执行删除命令
	editor.execute(new CMD.RemoveObjectCommand(editor,object));

	return { success: true,objectId };
}

/**
 * 清除场景中所有物体
 * @param {import('../../Editor').Editor} editor
 * @returns {{ success: boolean, data?: { removedCount: number } }}
 */
export function clearScene(editor) {
	editor.editorEM.removeAllObject.dispatch();
	editor.editorEM.sceneGraphChanged.dispatch();



	return {
		success: true,
		data: {
			message: '已清除场景中所有物体',
		},
	};
}