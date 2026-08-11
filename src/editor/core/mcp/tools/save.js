/**
 * MCP 保存操作工具（离线版：保存到 IndexedDB）
 */

/**
 * 保存项目（等待实际写入完成后才返回）
 * @param {import('../Editor').Editor} editor - 编辑器实例
 * @param {string} type - 保存类型：'scene' 或 'config'
 * @returns {Promise<{ success: boolean, message?: string, error?: object }>}
 */
export async function saveProject(editor,type = 'scene') {
    try {
        if (type !== 'scene' && type !== 'config') {
            return {
                success: false,
                error: {
                    code: 'INVALID_TYPE',
                    message: `无效的保存类型: ${type}，必须是 'scene' 或 'config'`
                }
            };
        }

        // 包装 Promise：拦截 callbackList 回调以感知异步保存完成
        const result = await new Promise((resolve,reject) => {
            const origFileBuffer = editor.callbackList.fileBuffer;
            const origFileConfig = editor.callbackList.fileConfig;

            const restore = () => {
                editor.callbackList.fileBuffer = origFileBuffer;
                editor.callbackList.fileConfig = origFileConfig;
            };

            // 超时保护（30s）
            const timeout = setTimeout(() => {
                restore();
                reject(new Error('保存超时（30s）'));
            },30000);

            editor.callbackList.fileBuffer = async (files,config) => {
                try {
                    await origFileBuffer.call(editor.callbackList,files,config);
                    clearTimeout(timeout);
                    restore();
                    resolve('场景已保存到 IndexedDB');
                } catch (e) {
                    clearTimeout(timeout);
                    restore();
                    reject(e);
                }
            };

            editor.callbackList.fileConfig = async (config) => {
                try {
                    await origFileConfig.call(editor.callbackList,config);
                    clearTimeout(timeout);
                    restore();
                    resolve('配置已保存到 IndexedDB');
                } catch (e) {
                    clearTimeout(timeout);
                    restore();
                    reject(e);
                }
            };

            // 触发保存（异步流程最终会调用上面拦截的回调）
            editor.save(type);
        });

        return { success: true,message: result };
    } catch (error) {
        console.error('saveProject error:',error);
        return {
            success: false,
            error: {
                code: 'SAVE_FAILED',
                message: error.message
            }
        };
    }
}
