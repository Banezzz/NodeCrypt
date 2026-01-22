// Global test setup
// 全局测试设置

import { beforeAll, afterAll, vi } from 'vitest';

// Mock Web Crypto API for testing
beforeAll(() => {
	// Setup global mocks if needed
	global.window = global.window || {};
	global.window.fileTransfers = new Map();
	global.window.activeRoomIndex = -1;
	global.window.roomsData = [];
});

afterAll(() => {
	// Cleanup after tests
	vi.restoreAllMocks();
});
