// Tests for util.colorMode.js
// util.colorMode.js 测试

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
	let store = {};
	return {
		getItem: vi.fn((key) => store[key] || null),
		setItem: vi.fn((key, value) => { store[key] = value; }),
		removeItem: vi.fn((key) => { delete store[key]; }),
		clear: vi.fn(() => { store = {}; })
	};
})();

// Mock matchMedia
const createMatchMedia = (matches) => {
	return vi.fn().mockImplementation((query) => ({
		matches,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));
};

// Setup global mocks before importing the module
beforeEach(() => {
	vi.stubGlobal('localStorage', localStorageMock);
	vi.stubGlobal('matchMedia', createMatchMedia(false));
	localStorageMock.clear();

	// Mock document
	vi.stubGlobal('document', {
		documentElement: {
			setAttribute: vi.fn(),
			getAttribute: vi.fn()
		},
		querySelectorAll: vi.fn().mockReturnValue([])
	});

	// Mock window.dispatchEvent
	vi.stubGlobal('dispatchEvent', vi.fn());
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe('getCurrentColorMode', () => {
	it('should return saved mode from localStorage', async () => {
		localStorageMock.getItem.mockReturnValue('dark');
		const { getCurrentColorMode } = await import('../../client/js/util.colorMode.js');
		expect(getCurrentColorMode()).toBe('dark');
	});

	it('should return light mode from localStorage', async () => {
		localStorageMock.getItem.mockReturnValue('light');
		const { getCurrentColorMode } = await import('../../client/js/util.colorMode.js');
		expect(getCurrentColorMode()).toBe('light');
	});

	it('should detect system dark mode preference when no saved preference', async () => {
		localStorageMock.getItem.mockReturnValue(null);
		vi.stubGlobal('matchMedia', createMatchMedia(true));
		const { getCurrentColorMode } = await import('../../client/js/util.colorMode.js');
		expect(getCurrentColorMode()).toBe('dark');
	});

	it('should detect system light mode preference when no saved preference', async () => {
		localStorageMock.getItem.mockReturnValue(null);
		vi.stubGlobal('matchMedia', createMatchMedia(false));
		const { getCurrentColorMode } = await import('../../client/js/util.colorMode.js');
		expect(getCurrentColorMode()).toBe('light');
	});

	it('should default to light if localStorage has invalid value', async () => {
		localStorageMock.getItem.mockReturnValue('invalid');
		const { getCurrentColorMode } = await import('../../client/js/util.colorMode.js');
		expect(getCurrentColorMode()).toBe('light');
	});
});

describe('applyColorMode', () => {
	it('should set data-theme attribute on document', async () => {
		const { applyColorMode } = await import('../../client/js/util.colorMode.js');
		applyColorMode('dark');
		expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
	});

	it('should save mode to localStorage', async () => {
		const { applyColorMode } = await import('../../client/js/util.colorMode.js');
		applyColorMode('dark');
		expect(localStorageMock.setItem).toHaveBeenCalledWith('nodecrypt-color-mode', 'dark');
	});

	it('should dispatch colorModeChange event', async () => {
		const { applyColorMode } = await import('../../client/js/util.colorMode.js');
		applyColorMode('dark');
		expect(window.dispatchEvent).toHaveBeenCalled();
	});

	it('should default to light for invalid mode', async () => {
		const { applyColorMode } = await import('../../client/js/util.colorMode.js');
		const result = applyColorMode('invalid');
		expect(result).toBe('light');
		expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
	});

	it('should return the applied mode', async () => {
		const { applyColorMode } = await import('../../client/js/util.colorMode.js');
		expect(applyColorMode('dark')).toBe('dark');
		expect(applyColorMode('light')).toBe('light');
	});
});

describe('toggleColorMode', () => {
	it('should toggle from light to dark', async () => {
		localStorageMock.getItem.mockReturnValue('light');
		vi.resetModules();
		const { toggleColorMode } = await import('../../client/js/util.colorMode.js');
		const result = toggleColorMode();
		expect(result).toBe('dark');
	});

	it('should toggle from dark to light', async () => {
		localStorageMock.getItem.mockReturnValue('dark');
		vi.resetModules();
		const { toggleColorMode } = await import('../../client/js/util.colorMode.js');
		const result = toggleColorMode();
		expect(result).toBe('light');
	});
});

describe('resetColorModeToSystem', () => {
	it('should remove saved preference from localStorage', async () => {
		const { resetColorModeToSystem } = await import('../../client/js/util.colorMode.js');
		resetColorModeToSystem();
		expect(localStorageMock.removeItem).toHaveBeenCalledWith('nodecrypt-color-mode');
	});

	it('should apply system preference after reset', async () => {
		vi.stubGlobal('matchMedia', createMatchMedia(true));
		vi.resetModules();
		const { resetColorModeToSystem } = await import('../../client/js/util.colorMode.js');
		resetColorModeToSystem();
		expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
	});
});

describe('isFollowingSystemPreference', () => {
	it('should return true when no saved preference', async () => {
		localStorageMock.getItem.mockReturnValue(null);
		const { isFollowingSystemPreference } = await import('../../client/js/util.colorMode.js');
		expect(isFollowingSystemPreference()).toBe(true);
	});

	it('should return false when preference is saved', async () => {
		localStorageMock.getItem.mockReturnValue('dark');
		const { isFollowingSystemPreference } = await import('../../client/js/util.colorMode.js');
		expect(isFollowingSystemPreference()).toBe(false);
	});
});
