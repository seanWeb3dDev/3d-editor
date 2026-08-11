/**
 * 辅助线相关工具
 */



/**
 * 基于辅助线生成物体
 * @param {import('../Editor').Editor} editor
 * @param {string} helperLineUuid - 辅助线 UUID
 * @param {string} generateType -生成类型：pipe/path/arrow/particle
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export function generateFromHelperLine(editor,helperLineUuid,generateType) {
    // 获取辅助线对象
    const object = editor.getObjectByUuid(helperLineUuid);

    if (!object) {
        return {
            success: false,error: `未找到物体: ${helperLineUuid}`
        };
    }

    // 验证是否是辅助线类型
    if (!object.isHelperLine) {
        return {
            success: false,
            error: '目标物体不是辅助线类型'
        };
    }

    // 验证生成类型
    const validTypes = ['pipe','path','arrow','particle'];
    if (!validTypes.includes(generateType)) {
        return {
            success: false,
            error: `不支持的生成类型: ${generateType}，支持的类型: ${validTypes.join(', ')}`
        };
    }

    // 通过插件调用链获取 generate 操作
    const operatePlugin = editor.pluginDispatcher.getPlugin("OperatePlugin");
    if (!operatePlugin) {
        return {
            success: false,
            error: '无法获取 OperatePlugin 插件'
        };
    }

    const generate = operatePlugin.generate;
    if (!generate) {
        return {
            success: false,
            error: '无法获取 generate 操作'
        };
    }

    // 调用生成方法
    generate.generateByHelperLine(object,generateType);

    return {
        success: true,
        data: {
            helperLineName: object.name || '辅助线',
            generateType
        }
    };
}