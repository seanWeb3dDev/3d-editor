/**
 * MCP 状态操作工具
 * 处理 set_state 和 delete_state 命令
 */

/**
 * 设置物体状态
 * @param {import('../Editor').Editor} editor - 编辑器实例
 * @param {string} objectId - 物体 UUID
 * @param {object} state - 状态对象 { key, type, value }
 * @returns {object} - { success: boolean, error?: string }
 */
export function setState(editor,objectId,state) {
    try {
        // 通过 objectId 获取物体
        const node = editor.format.get(objectId);
        if (!node) {
            return { success: false,error: '找不到指定物体' };
        }

        const object = node.object;

        // 直接调用 editorEM.setState.dispatch
        editor.editorEM.setState.dispatch(state,object);

        // 判断当前选中物体是否是该物体
        if (editor.selected !== object) {
            editor.select(object);
        } else {
            // 已选中该物体，刷新属性面板
            editor.editorEM.attributeChanged.dispatch(objectId);
        }

        return { success: true };
    } catch (error) {
        console.error('setState error:',error);
        return { success: false,error: error.message };
    }
}

/**
 * 删除物体状态
 * @param {import('../Editor').Editor} editor - 编辑器实例
 * @param {string} objectId - 物体 UUID
 * @param {string} key - 状态名称
 * @returns {object} - { success: boolean, error?: string }
 */
export function deleteState(editor,objectId,key) {
    try {
        // 通过 objectId 获取物体
        const node = editor.format.get(objectId);
        if (!node) {
            return { success: false,error: '找不到指定物体' };
        }

        const object = node.object;

        // 直接调用 editorEM.deleteState.dispatch
        editor.editorEM.deleteState.dispatch(key,object);

        // 判断当前选中物体是否是该物体`
        if (editor.selected !== object) {
            editor.select(object);
        } else {
            // 已选中该物体，刷新属性面板
            editor.editorEM.attributeChanged.dispatch(objectId);
        }

        return { success: true };
    } catch (error) {
        console.error('deleteState error:',error);
        return { success: false,error: error.message };
    }
}