// Cryptographic utilities for share link encryption
// 分享链接加密的加密工具

const SHARE_KEY_SEED = 'NodeCrypt-Share-v1';

/**
 * Derive a key from the share seed using PBKDF2
 * 使用PBKDF2从分享种子派生密钥
 * @returns {Promise<CryptoKey>}
 */
async function deriveShareKey() {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(SHARE_KEY_SEED),
		'PBKDF2',
		false,
		['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: encoder.encode('share'),
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypt share data using AES-GCM
 * 使用AES-GCM加密分享数据
 * @param {string} text - Text to encrypt
 * @returns {Promise<string>} URL-safe base64 encoded encrypted data
 */
export async function encryptShareData(text) {
	const key = await deriveShareKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(text);
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		encoded
	);

	// Combine IV + ciphertext
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(encrypted), iv.length);

	// Convert to URL-safe base64
	return btoa(String.fromCharCode(...combined))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

/**
 * Decrypt share data using AES-GCM
 * 使用AES-GCM解密分享数据
 * @param {string} encoded - URL-safe base64 encoded encrypted data
 * @returns {Promise<string>} Decrypted text
 */
export async function decryptShareData(encoded) {
	// Convert from URL-safe base64
	const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
	const padding = (4 - (base64.length % 4)) % 4;
	const combined = Uint8Array.from(
		atob(base64 + '='.repeat(padding)),
		c => c.charCodeAt(0)
	);

	const iv = combined.slice(0, 12);
	const ciphertext = combined.slice(12);
	const key = await deriveShareKey();
	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		key,
		ciphertext
	);
	return new TextDecoder().decode(decrypted);
}

/**
 * Decrypt legacy share data (Caesar cipher + base64)
 * 解密旧版分享数据（凯撒密码 + base64）
 * @param {string} encrypted - Legacy encrypted string
 * @returns {string} Decrypted text or empty string on failure
 */
export function decryptShareDataLegacy(encrypted) {
	if (!encrypted) return '';
	try {
		// Reverse character shifting and decode base64
		const shifted = encrypted.split('').map(char => {
			const code = char.charCodeAt(0);
			return String.fromCharCode(code - 3);
		}).join('');
		return decodeURIComponent(escape(atob(shifted)));
	} catch {
		return '';
	}
}

/**
 * Unified decryption entry point - tries new format first, falls back to legacy
 * 统一解密入口 - 先尝试新格式，失败则回退到旧格式
 * @param {string} encoded - Encrypted share data
 * @returns {Promise<string>} Decrypted text
 */
export async function decryptShareUrl(encoded) {
	try {
		return await decryptShareData(encoded);
	} catch {
		return decryptShareDataLegacy(encoded);
	}
}
