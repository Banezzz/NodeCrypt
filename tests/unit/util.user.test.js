// Tests for util.user.js
// util.user.js 测试

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveUserName, getUserDisplayName } from '../../client/js/util.user.js';

// Mock i18n
vi.mock('../../client/js/util.i18n.js', () => ({
	t: (key, fallback) => fallback
}));

describe('resolveUserName', () => {
	it('should return userName from message if present', () => {
		const msg = { userName: 'Alice', clientId: '123' };
		const rd = { userMap: { '123': { userName: 'Bob' } } };
		expect(resolveUserName(msg, rd)).toBe('Alice');
	});

	it('should look up userName in userMap by clientId', () => {
		const msg = { clientId: '123' };
		const rd = { userMap: { '123': { userName: 'Bob' } } };
		expect(resolveUserName(msg, rd)).toBe('Bob');
	});

	it('should fall back to username field in userMap', () => {
		const msg = { clientId: '123' };
		const rd = { userMap: { '123': { username: 'Charlie' } } };
		expect(resolveUserName(msg, rd)).toBe('Charlie');
	});

	it('should fall back to name field in userMap', () => {
		const msg = { clientId: '123' };
		const rd = { userMap: { '123': { name: 'Dave' } } };
		expect(resolveUserName(msg, rd)).toBe('Dave');
	});

	it('should return fallback if no name found', () => {
		const msg = { clientId: '123' };
		const rd = { userMap: {} };
		expect(resolveUserName(msg, rd)).toBe('Anonymous');
	});

	it('should return custom fallback if provided', () => {
		const msg = {};
		const rd = {};
		expect(resolveUserName(msg, rd, 'Unknown')).toBe('Unknown');
	});

	it('should handle null msg gracefully', () => {
		expect(resolveUserName(null, null)).toBe('Anonymous');
	});

	it('should handle null rd gracefully', () => {
		const msg = { clientId: '123' };
		expect(resolveUserName(msg, null)).toBe('Anonymous');
	});
});

describe('getUserDisplayName', () => {
	it('should return userName if present', () => {
		expect(getUserDisplayName({ userName: 'Alice' })).toBe('Alice');
	});

	it('should return username if userName not present', () => {
		expect(getUserDisplayName({ username: 'Bob' })).toBe('Bob');
	});

	it('should return name if userName and username not present', () => {
		expect(getUserDisplayName({ name: 'Charlie' })).toBe('Charlie');
	});

	it('should return fallback if no name found', () => {
		expect(getUserDisplayName({})).toBe('Anonymous');
	});

	it('should return custom fallback if provided', () => {
		expect(getUserDisplayName({}, 'Unknown')).toBe('Unknown');
	});

	it('should handle null user gracefully', () => {
		expect(getUserDisplayName(null)).toBe('Anonymous');
	});
});
