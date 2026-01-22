// Crypto API mocks for testing
// 加密API模拟用于测试

import { vi } from 'vitest';

/**
 * Create a mock for Web Crypto API subtle methods
 * 创建Web Crypto API subtle方法的模拟
 */
export function createCryptoMock() {
	return {
		subtle: {
			generateKey: vi.fn().mockResolvedValue({
				publicKey: {},
				privateKey: {}
			}),
			importKey: vi.fn().mockResolvedValue({}),
			deriveKey: vi.fn().mockResolvedValue({}),
			deriveBits: vi.fn().mockResolvedValue(new ArrayBuffer(48)),
			encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
			decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
			verify: vi.fn().mockResolvedValue(true),
			digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
			exportKey: vi.fn().mockResolvedValue(new ArrayBuffer(97))
		},
		getRandomValues: vi.fn((array) => {
			for (let i = 0; i < array.length; i++) {
				array[i] = Math.floor(Math.random() * 256);
			}
			return array;
		})
	};
}

/**
 * Install crypto mock globally
 * 全局安装crypto模拟
 */
export function installCryptoMock() {
	const mock = createCryptoMock();
	global.crypto = mock;
	return mock;
}
