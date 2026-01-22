// Tests for room.js functionality
// room.js 功能测试

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../client/js/util.avatar.js', () => ({
	createAvatarSVG: vi.fn(() => '<svg></svg>')
}));

vi.mock('../../client/js/chat.js', () => ({
	renderChatArea: vi.fn(),
	addSystemMsg: vi.fn(),
	updateChatInputStyle: vi.fn()
}));

vi.mock('../../client/js/ui.js', () => ({
	renderMainHeader: vi.fn(),
	renderUserList: vi.fn()
}));

vi.mock('../../client/js/util.string.js', () => ({
	escapeHTML: (str) => str
}));

vi.mock('../../client/js/util.dom.js', () => ({
	$id: vi.fn(),
	createElement: vi.fn(() => document.createElement('div'))
}));

vi.mock('../../client/js/util.i18n.js', () => ({
	t: (key, fallback) => fallback
}));

describe('room message limit', () => {
	let roomModule;

	beforeEach(async () => {
		vi.resetModules();
		// Re-import to get fresh module state
		roomModule = await import('../../client/js/room.js');
	});

	it('should export pushMessage function', () => {
		expect(typeof roomModule.pushMessage).toBe('function');
	});

	it('should export getNewRoomData function', () => {
		expect(typeof roomModule.getNewRoomData).toBe('function');
	});

	it('getNewRoomData should return object with messages array', () => {
		const rd = roomModule.getNewRoomData();
		expect(Array.isArray(rd.messages)).toBe(true);
		expect(rd.messages.length).toBe(0);
	});

	it('pushMessage should add messages to room data', () => {
		const rd = roomModule.getNewRoomData();
		roomModule.pushMessage(rd, { type: 'test', text: 'Hello' });
		expect(rd.messages.length).toBe(1);
		expect(rd.messages[0].text).toBe('Hello');
	});

	it('pushMessage should trim messages when exceeding limit', () => {
		const rd = roomModule.getNewRoomData();

		// Add 510 messages
		for (let i = 0; i < 510; i++) {
			roomModule.pushMessage(rd, { type: 'test', text: `Message ${i}` });
		}

		// Should be trimmed to 500
		expect(rd.messages.length).toBe(500);
		// First message should be "Message 10" (oldest 10 were removed)
		expect(rd.messages[0].text).toBe('Message 10');
	});

	it('pushMessage should handle null rd gracefully', () => {
		// Should not throw
		expect(() => roomModule.pushMessage(null, { type: 'test' })).not.toThrow();
	});

	it('pushMessage should handle rd without messages gracefully', () => {
		const rd = { userList: [] };
		// Should not throw
		expect(() => roomModule.pushMessage(rd, { type: 'test' })).not.toThrow();
	});
});
