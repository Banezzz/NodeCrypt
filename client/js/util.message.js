// Unified message sending utilities
// 统一的消息发送工具

import { t } from './util.i18n.js';

/**
 * Send an encrypted message (private or public)
 * 发送加密消息（私聊或公聊）
 * @param {Object} rd - Room data object containing chat instance
 * @param {string} messageType - Type of message ('text', 'image', 'file_start', etc.)
 * @param {*} messageContent - Content to send (string, object, etc.)
 * @param {Object} options - Options including isPrivate flag
 * @returns {{ success: boolean, error?: string }}
 */
export function sendEncryptedMessage(rd, messageType, messageContent, options = {}) {
	const { isPrivate = false } = options;

	if (!rd?.chat) {
		return { success: false, error: 'no_chat_instance' };
	}

	const type = isPrivate ? `${messageType}_private` : messageType;

	if (isPrivate && rd.privateChatTargetId) {
		const targetClient = rd.chat.channel[rd.privateChatTargetId];
		if (!targetClient?.shared) {
			return {
				success: false,
				error: 'user_not_connected',
				message: `${t('system.private_message_failed', 'Cannot send private message to')} ${rd.privateChatTargetName}. ${t('system.user_not_connected', 'User might not be fully connected.')}`
			};
		}

		// Encrypt for private chat
		const clientPayload = { a: 'm', t: type, d: messageContent };
		const encryptedClient = rd.chat.encryptClientMessage(clientPayload, targetClient.shared);
		const serverPayload = { a: 'c', p: encryptedClient, c: rd.privateChatTargetId };
		const encryptedServer = rd.chat.encryptServerMessage(serverPayload, rd.chat.serverShared);
		rd.chat.sendMessage(encryptedServer);

		return { success: true };
	} else if (!isPrivate) {
		// Public channel message
		rd.chat.sendChannelMessage(messageType, messageContent);
		return { success: true };
	}

	return { success: false, error: 'invalid_state' };
}

/**
 * Check if private chat is available for the current room
 * 检查当前房间是否可以进行私聊
 * @param {Object} rd - Room data object
 * @returns {boolean}
 */
export function isPrivateChatAvailable(rd) {
	if (!rd?.privateChatTargetId || !rd?.chat) return false;
	const targetClient = rd.chat.channel[rd.privateChatTargetId];
	return !!(targetClient?.shared);
}
