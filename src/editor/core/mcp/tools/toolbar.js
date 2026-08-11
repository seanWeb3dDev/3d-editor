/**
 * 工具栏操作
 */

const TOOL_FN_MAP = {
    toggleLightHelper: 'lightVisible',
    toggleGrid: 'gridVisible',
    toggleShaderPreview: 'shaderPreview',
    toggleAnimation: 'allAnimation',
    toggleSingleShow: 'singleShow',
};

/**
 * 切换工具栏开关
 * @param {import('../../Editor').Editor} editor
 * @param {string} toolKey 工具标识
 * @param {boolean} value 开关值
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export function toggleTool(editor,toolKey,value) {
    const fn = TOOL_FN_MAP[toolKey];
    if (!fn) {
        return { success: false,error: `未知的工具: ${toolKey}` };
    }

    const func = editor._FUNCS?.[fn];
    if (typeof func !== 'function') {
        return { success: false,error: `工具函数未找到: ${fn}` };
    }

    func(value);

    // MCP 调用后通知 Vue 同步 UI 状态
    editor.callbackList.updateView({
        target: 'toolToggle',
        param: { fn,value },
    });

    return {
        success: true,
        data: { tool: toolKey,value },
    };
}

/**
 * 切换单个模型的指定动画播放/暂停
 * @param {import('../../Editor').Editor} editor
 * @param {string} objectId 模型 UUID
 * @param {string[]} clipUuids 动画 clip UUID 列表
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export function toggleModelAnimation(editor,objectId,clipUuids) {
    const animateManager = editor.animateManager;
    if (!animateManager) {
        return { success: false,error: 'AnimateManager 未找到' };
    }

    const object = editor.scene.getObjectByProperty('uuid',objectId);
    if (!object) {
        return { success: false,error: `未找到物体: ${objectId}` };
    }

    if (!object.actions || Object.keys(object.actions).length === 0) {
        return { success: false,error: `模型 "${object.name}" 没有动画` };
    }

    const results = [];

    for (const clipUuid of clipUuids) {
        const action = animateManager.getAction(clipUuid);
        if (!action) {
            results.push({ clipUuid,success: false,error: '动画 clip 未找到' });
            continue;
        }

        if (action.isRunning()) {
            action.stop();
            results.push({ clipUuid,name: action.name,play: false });
        } else {
            action.play();
            results.push({ clipUuid,name: action.name,play: true });
        }
    }

    // 如果当前选中的模型就是被控制的模型，刷新右侧面板动画状态
    if (editor.selected && editor.selected.uuid === objectId) {
        editor.editorEM.attributeChanged.dispatch(objectId);
    }

    return {
        success: true,
        data: { objectId,animations: results },
    };
}
