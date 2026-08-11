/**
 * 场景相关工具
 */

/**
 * 获取场景信息
 * @param {import('../../Editor').Editor} editor
 * @returns {{ success: boolean, data?: { sceneData: object, template: string|null }, error?: { code: string, message: string } }}
 */
export function getSceneInfo(editor) {
	const sceneData = editor.getSceneData();

	return {
		success: true,
		data: {
			template: editor._template || null,
			sceneData,
		},
	};
}

/**
 * 选中物体
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId
 * @returns {{ success: boolean, data?: { name: string }, error?: { code: string, message: string } }}
 */
export function selectObject(editor,objectId) {
	const object = editor.scene.getObjectByProperty('uuid',objectId);

	if (!object) {
		return {
			success: false,
			error: {
				code: 'OBJECT_NOT_FOUND',
				message: `未找到物体: ${objectId}`,
			},
		};
	}

	// 调用编辑器的选中方法
	editor.select(object);

	return {
		success: true,
		data: {
			name: object.name || object.type,
		},
	};
}

/**
 * 获取物体详情
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId
 * @returns {{ success: boolean, data?: object, error?: { code: string, message: string } }}
 */
export function getObjectDetail(editor,objectId) {
	const modifyData = editor.format.getNodeModifyJSON(objectId);

	if (!modifyData || Object.keys(modifyData).length === 0) {
		return {
			success: false,
			error: {
				code: 'OBJECT_NOT_FOUND',
				message: `未找到物体: ${objectId}`,
			},
		};
	}

	return {
		success: true,
		data: modifyData,
	};
}
