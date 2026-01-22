// User-related utility functions
// 用户相关工具函数

import { t } from './util.i18n.js';

/**
 * Resolve username with priority: msg.userName > userMap > fallback
 * 解析用户名，优先级：msg.userName > userMap > fallback
 * @param {Object} msg - Message object that may contain userName and clientId
 * @param {Object} rd - Room data object containing userMap
 * @param {string} fallback - Fallback value if no name is found
 * @returns {string} The resolved username
 */
export function resolveUserName(msg, rd, fallback = 'Anonymous') {
	// Priority 1: Direct userName from message
	if (msg?.userName) return msg.userName;

	// Priority 2: Look up in userMap by clientId
	if (rd && msg?.clientId && rd.userMap?.[msg.clientId]) {
		const user = rd.userMap[msg.clientId];
		return user.userName || user.username || user.name || t('ui.anonymous', fallback);
	}

	// Priority 3: Return localized fallback
	return t('ui.anonymous', fallback);
}

/**
 * Get display name for a user object
 * 获取用户对象的显示名称
 * @param {Object} user - User object with various name properties
 * @param {string} fallback - Fallback value if no name is found
 * @returns {string} The display name
 */
export function getUserDisplayName(user, fallback = 'Anonymous') {
	if (!user) return t('ui.anonymous', fallback);
	return user.userName || user.username || user.name || t('ui.anonymous', fallback);
}
