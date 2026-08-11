/**
 * MCP 模块入口
 * 提供 WebSocket 客户端，连接 MCP Server
 */

import { MCPClient } from './ws-client.js';

export { MCPClient };

/**
 * 创建 MCP 客户端并连接
 * @param {import('../Editor').Editor} editor
 * @param {object} options
 * @param {string} options.projectId - 项目 ID（必填）
 * @param {string} options.url - MCP Server 地址（可选）
 * @returns {MCPClient}
 */
export function createMCPClient(editor, options = {}) {
	const client = new MCPClient(editor, options);

	// 自动连接
	client.connect();

	return client;
}