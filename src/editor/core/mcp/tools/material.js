/**
 * MCP 材质操作工具
 * 处理材质相关命令
 */

import * as MATERIAL from '../../material';
import { SetMaterialCommand } from '../../commands';

// 可创建的材质类型列表
const MATERIAL_TYPE_LIST = [
    { label: '基础材质', value: 'BasicMaterial' },
    { label: '标准材质', value: 'StandardMaterial' },
    { label: '玻璃材质', value: 'GlassMaterial' },
    { label: '高亮材质', value: 'BrightenMaterial' },
    { label: '渐隐材质', value: 'FadeMaterial' },
    { label: '高度着色材质', value: 'AltitudeMaterial' },
    { label: '菲涅尔材质', value: 'FresnelMaterial' },
    { label: '水体材质A', value: 'WaterAMaterial' },
    { label: '水体材质B', value: 'WaterBMaterial' },
    { label: '气流特效', value: 'AirFlowMaterial' },
    { label: '火焰特效', value: 'FireMaterial' },
    { label: '流光特效', value: 'FlowLightMaterial' },
    { label: '波纹特效', value: 'RippleMaterial' },
    { label: '箭头路径特效', value: 'ArrowPathMaterial' },
    { label: '雷达特效', value: 'RadarMaterial' },
    { label: '流动噪声纹理', value: 'FlowNoiseMaterial' },
    { label: '分型布朗纹理A', value: 'NoiseAMaterial' },
];

/**
 * 给物体设置材质
 * @param {import('../Editor').Editor} editor - 编辑器实例
 * @param {string} targetObjectUuid - 目标物体 UUID
 * @param {object} materialSource - 材质来源
 *   - { source: 'new', materialType: 'StandardMaterial' } 创建新材质
 *   - { source: 'object', sourceObjectUuid: 'xxx' } 从其他模型获取材质
 * @param {number} materialSlot - 材质索引（默认 0）
 * @returns {{ success: boolean, data?: object, error?: object }}
 */
export function setMaterial(editor, targetObjectUuid, materialSource, materialSlot = 0) {
    try {
        // 获取目标物体
        const targetNode = editor.format.get(targetObjectUuid);
        if (!targetNode) {
            return {
                success: false,
                error: {
                    code: 'TARGET_NOT_FOUND',
                    message: `未找到目标物体: ${targetObjectUuid}`
                }
            };
        }
        const targetObject = targetNode.object;

        // 检查目标物体是否是 Mesh
        if (!targetObject.isMesh) {
            return {
                success: false,
                error: {
                    code: 'TARGET_NOT_MESH',
                    message: '目标物体不是 Mesh 类型，无法设置材质'
                }
            };
        }

        // 根据材质来源获取材质
        let material = null;
        let materialInfo = {};

        if (materialSource.source === 'new') {
            // 创建新材质
            const materialType = materialSource.materialType;
            const validType = MATERIAL_TYPE_LIST.find(item => item.value === materialType);
            if (!validType) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_MATERIAL_TYPE',
                        message: `无效的材质类型: ${materialType}`,
                        validTypes: MATERIAL_TYPE_LIST.map(item => item.value)
                    }
                };
            }

            const MaterialClass = MATERIAL[materialType];
            if (!MaterialClass) {
                return {
                    success: false,
                    error: {
                        code: 'MATERIAL_CLASS_NOT_FOUND',
                        message: `材质类未找到: ${materialType}`
                    }
                };
            }

            material = new MaterialClass();
            materialInfo = {
                source: 'new',
                materialType: materialType,
                materialName: material.name || validType.label
            };

        } else if (materialSource.source === 'object') {
            // 从其他模型获取材质
            const sourceObjectUuid = materialSource.sourceObjectUuid;
            const sourceNode = editor.format.get(sourceObjectUuid);
            if (!sourceNode) {
                return {
                    success: false,
                    error: {
                        code: 'SOURCE_NOT_FOUND',
                        message: `未找到源物体: ${sourceObjectUuid}`
                    }
                };
            }
            const sourceObject = sourceNode.object;

            // 检查源物体是否有材质
            if (!sourceObject.isMesh || !sourceObject.material) {
                return {
                    success: false,
                    error: {
                        code: 'SOURCE_NO_MATERIAL',
                        message: '源物体没有材质'
                    }
                };
            }

            material = sourceObject.material;
            materialInfo = {
                source: 'object',
                sourceObjectName: sourceObject.name,
                materialName: material.name || '未命名材质'
            };

        } else {
            return {
                success: false,
                error: {
                    code: 'INVALID_SOURCE',
                    message: '无效的材质来源类型',
                    validSources: ['new', 'object']
                }
            };
        }

        // 使用 SetMaterialCommand 设置材质
        editor.execute(new SetMaterialCommand(editor, targetObject, material, materialSlot));

        return {
            success: true,
            data: {
                targetObjectName: targetObject.name,
                materialInfo: materialInfo
            }
        };

    } catch (error) {
        console.error('setMaterial error:', error);
        return {
            success: false,
            error: {
                code: 'SET_MATERIAL_FAILED',
                message: error.message
            }
        };
    }
}