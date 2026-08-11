/**
 * MCP 复制操作工具
 * 处理 duplicateObject 命令
 */


import * as CMD from '../../commands';

/**
 * 复制物体
 * @param {import('../Editor').Editor} editor - 编辑器实例
 * @param {string} objectId - 要复制的物体 UUID
 * @param {object} options - 复制选项
 * @param {boolean} options.deep - 是否深度复制材质
 * @param {object} options.position - 位置偏移 { x, y, z }
 * @returns {{ success: boolean, data?: object, error?: object }}
 */
export function duplicateObject(editor,objectId,options = {}) {
    try {
        const node = editor.format.get(objectId);
        if (!node) {
            return {
                success: false,
                error: {
                    code: 'OBJECT_NOT_FOUND',
                    message: `未找到物体: ${objectId}`
                }
            };
        }

        const object = node.object;

        // HelperDot（辅助点）：执行插入点的逻辑
        if (object.isHelperDot) {
            const dot = object.clone();
            const group = object.parent;
            object.position.clone(dot.position);

            const index = group.children.indexOf(object);
            editor.execute(new CMD.AddObjectCommand(editor,dot,group,index + 1));

            return {
                success: true,
                data: {
                    newObjectId: dot.uuid,
                    newName: dot.name || '辅助点'
                }
            };
        }

        // Reflector（镜面）不能复制
        if (object.isReflector) {
            return {
                success: false,
                error: {
                    code: 'OBJECT_NOT_DUPLICATABLE',
                    message: '镜面不能复制'
                }
            };
        }

        const { deep = false,position } = options;

        // 使用 result 对象传递结果
        const result = { uuid: null };
        editor.editorEM.duplicate.dispatch(objectId,undefined,deep,result);

        // 检查是否成功获取新物体 UUID
        if (!result.uuid) {
            return {
                success: false,
                error: {
                    code: 'DUPLICATE_FAILED',
                    message: '复制失败，未返回新物体UUID'
                }
            };
        }

        // 获取新物体
        const newNode = editor.format.get(result.uuid);
        if (!newNode) {
            return {
                success: false,
                error: {
                    code: 'DUPLICATE_FAILED',
                    message: '复制失败，未找到新物体'
                }
            };
        }

        const newObject = newNode.object;

        // 如果有位置偏移，设置新物体位置
        if (position) {
            const offset = {
                x: position.x || 0,
                y: position.y || 0,
                z: position.z || 0
            };
            newObject.position.x += offset.x;
            newObject.position.y += offset.y;
            newObject.position.z += offset.z;

            // 触发场景更新
            editor.editorEM.sceneGraphChanged.dispatch();
        }

        // 返回新物体信息
        return {
            success: true,
            data: {
                newObjectId: newObject.uuid,
                newName: newObject.name
            }
        };
    } catch (error) {
        console.error('duplicateObject error:',error);
        return {
            success: false,
            error: {
                code: 'DUPLICATE_FAILED',
                message: error.message
            }
        };
    }
}