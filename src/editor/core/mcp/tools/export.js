/**
 * MCP 导出工具
 * 处理 exportObject 命令
 */
import { exportGLTF } from "@/editor/library/Exporter";
// import { exportGLTF } from '../../library/Exporter';

/**
 * 导出物体
 * @param {import('../Editor').Editor} editor - 编辑器实例
 * @param {string} objectId - 要导出的物体 UUID
 * @param {string} format - 导出格式 'glb' 或 'gltf'
 * @returns {{ success: boolean, data?: object, error?: object }}
 */
export function exportObject(editor,objectId,format = 'glb') {
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
        const sceneUuid = editor.scene.uuid;

        // 确定导出目标（根据物体类型判断）
        let target = null;
        let exportName = '';

        // 场景根节点下的物体 → 导出该物体
        if (object.parent.uuid === sceneUuid) {
            target = object;
            exportName = object.name;
        }

        // 文本 → 导出整个文本组
        if (object.isText) {
            target = editor.textGroup;
            exportName = '文本组';
        }

        // 灯光 → 导出整个灯光组
        if (object.isLight) {
            target = editor.lightGroup;
            exportName = '灯光组';
        }

        // 粒子 → 导出整个粒子组
        if (object.isParticle) {
            target = editor.particleGroup;
            exportName = '粒子组';
        }

        // 辅助线 → 导出整个辅助线组
        if (object.isHelperLine) {
            target = editor.helperLineGroup;
            exportName = '辅助线组';
        }

        if (!target) {
            return {
                success: false,
                error: {
                    code: 'NOT_EXPORTABLE',
                    message: '该物体不支持导出'
                }
            };
        }

        // 执行导出（触发浏览器下载）
        const binary = format === 'glb';
        const filename = `${exportName}.${format}`;

        exportGLTF(target,binary,filename);

        return {
            success: true,
            data: {
                targetName: exportName,
                format: format,
                filename: filename
            }
        };
    } catch (error) {
        console.error('exportObject error:',error);
        return {
            success: false,
            error: {
                code: 'EXPORT_FAILED',
                message: error.message
            }
        };
    }
}