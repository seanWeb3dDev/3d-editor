/**
 * WebSocket 客户端
 * 连接 MCP Server，接收命令并执行
 */

import { executeCommand } from './tools/index.js';

export class MCPClient {
	/** @type {WebSocket} */
	ws = null;

	/** @type {import('../Editor').Editor} */
	editor = null;

	/** @type {string} */
	projectId = null;

	/** @type {boolean} */
	isConnected = false;

	/** @type {function} */
	onConnected = null;

	/** @type {function} */
	onDisconnected = null;

	/** @type {function} */
	onError = null;

	/**
	 * @param {import('../Editor').Editor} editor
	 * @param {object} options
	 * @param {string} options.projectId - 项目 ID（必填）
	 * @param {string} options.url - MCP Server 地址
	 * @param {function} options.onConnected - 连接成功回调
	 * @param {function} options.onDisconnected - 断开连接回调
	 * @param {function} options.onError - 连接失败回调
	 */
	constructor(editor,options = {}) {
		this.editor = editor;
		this.projectId = options.projectId;
		this.baseUrl = options.url;
		this.onConnected = options.onConnected;
		this.onDisconnected = options.onDisconnected;
		this.onError = options.onError;

		if (!this.projectId) {
			console.warn('MCPClient: projectId is required');
		}
	}

	/**
	 * 连接 MCP Server
	 */
	connect() {
		if (this.ws) {
			console.warn('MCPClient: Already connected or connecting');
			return;
		}

		if (!this.projectId) {
			console.error('MCPClient: Cannot connect without projectId');
			return;
		}

		if (!this.baseUrl) {
			console.warn('MCPClient: No url provided, skip connection');
			return;
		}

		// 构建 URL，带上 projectId 参数
		const url = `${this.baseUrl}?projectId=${this.projectId}`;
		console.log(`MCPClient: Connecting to ${url}`);

		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			this.isConnected = true;
			console.log('MCPClient: Connected');
			// 把自身注入到 editor.mcpClient，供 pushLoadedModel 等内部推送事件
			if (this.editor) this.editor.mcpClient = this;
			this.onConnected?.();
		};

		this.ws.onclose = () => {
			this.isConnected = false;
			this.ws = null;
			if (this.editor && this.editor.mcpClient === this) {
				this.editor.mcpClient = null;
			}
			console.log('MCPClient: Disconnected');
			this.onDisconnected?.();
		};

		this.ws.onerror = (error) => {
			console.error('MCPClient: WebSocket error',error);
			this.onError?.();
		};

		this.ws.onmessage = (event) => {
			this.handleMessage(event.data);
		};
	}

	/**
	 * 断开连接
	 */
	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
			this.isConnected = false;
		}
	}

	/**
	 * 处理接收的消息
	 * @param {string} data
	 */
	async handleMessage(data) {
		try {
			const request = JSON.parse(data);
			console.log('MCPClient: Received command',request);

			// 使用导入的 executeCommand 函数
			const result = await executeCommand(this.editor,request.command,request.params);

			this.sendResponse(request.id,result);
		} catch (error) {
			console.error('MCPClient: Failed to handle message',error);
		}
	}

	/**
	 * 发送响应
	 * @param {string} id
	 * @param {{ success: boolean, data?: any, error?: { code: string, message: string } }} result
	 */
	sendResponse(id,result) {
		if (!this.ws || !this.isConnected) {
			console.warn('MCPClient: Cannot send response, not connected');
			return;
		}

		// MCP Server 期望的响应格式：{ id, result } 或 { id, error }
		const response = {
			id,
			// 使用 result 而不是 data，符合 MCP Server 的期望格式
			result: result.success ? result : undefined,
			error: result.success ? undefined : result.error,
		};

		this.ws.send(JSON.stringify(response));
		console.log('MCPClient: Sent response',response);
	}

	/**
	 * 主动向 MCP Server 推送事件（无 request/response 语义）
	 * 用于编辑器内部事件（如 model.loaded）通知 MCP Server 的订阅者
	 * @param {string} event 事件名（如 "model.loaded"）
	 * @param {object} data 事件数据
	 */
	sendEvent(event,data) {
		if (!this.ws || !this.isConnected) {
			// 未连接时静默失败，避免内部调用产生过多警告
			return;
		}

		const message = {
			type: 'event',
			projectId: this.projectId,
			event,
			data,
		};

		this.ws.send(JSON.stringify(message));
	}
}