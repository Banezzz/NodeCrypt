// Color mode (dark/light) utility functions
// 颜色模式（深色/浅色）工具函数

const COLOR_MODE_KEY = 'nodecrypt-color-mode';

/**
 * Get the current color mode
 * 获取当前颜色模式
 * @returns {'light' | 'dark'} The current color mode
 */
export function getCurrentColorMode() {
	// Check localStorage first
	const saved = localStorage.getItem(COLOR_MODE_KEY);
	if (saved === 'dark' || saved === 'light') {
		return saved;
	}

	// Fall back to system preference
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	// Default to light
	return 'light';
}

/**
 * Apply color mode to the document
 * 应用颜色模式到文档
 * @param {'light' | 'dark'} mode - The color mode to apply
 */
export function applyColorMode(mode) {
	if (mode !== 'light' && mode !== 'dark') {
		console.warn(`Invalid color mode: ${mode}`);
		mode = 'light';
	}

	// Set the data-theme attribute on the root element
	document.documentElement.setAttribute('data-theme', mode);

	// Save to localStorage
	localStorage.setItem(COLOR_MODE_KEY, mode);

	// Update any toggle switches in the UI
	const toggles = document.querySelectorAll('[data-color-mode-toggle]');
	toggles.forEach(toggle => {
		if (toggle.type === 'checkbox') {
			toggle.checked = mode === 'dark';
		}
	});

	// Dispatch event for other components to react
	window.dispatchEvent(new CustomEvent('colorModeChange', { detail: { mode } }));

	return mode;
}

/**
 * Toggle between light and dark modes
 * 在浅色和深色模式之间切换
 * @returns {'light' | 'dark'} The new color mode
 */
export function toggleColorMode() {
	const current = getCurrentColorMode();
	const newMode = current === 'dark' ? 'light' : 'dark';
	return applyColorMode(newMode);
}

/**
 * Initialize color mode on page load
 * 页面加载时初始化颜色模式
 */
export function initColorMode() {
	// Apply the saved or system preference mode
	const mode = getCurrentColorMode();
	applyColorMode(mode);

	// Listen for system preference changes
	if (typeof window !== 'undefined' && window.matchMedia) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		// Only follow system preference if user hasn't explicitly set a preference
		const handleChange = (e) => {
			const saved = localStorage.getItem(COLOR_MODE_KEY);
			if (!saved) {
				applyColorMode(e.matches ? 'dark' : 'light');
			}
		};

		// Use the appropriate event listener method
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', handleChange);
		} else if (mediaQuery.addListener) {
			// Fallback for older browsers
			mediaQuery.addListener(handleChange);
		}
	}
}

/**
 * Reset color mode to system preference
 * 重置颜色模式为系统偏好
 */
export function resetColorModeToSystem() {
	// Remove saved preference first
	localStorage.removeItem(COLOR_MODE_KEY);

	if (typeof window !== 'undefined' && window.matchMedia) {
		const mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		// Apply mode but don't save to localStorage (applyColorMode saves by default)
		document.documentElement.setAttribute('data-theme', mode);
		// Dispatch event for other components to react
		window.dispatchEvent(new CustomEvent('colorModeChange', { detail: { mode } }));
	} else {
		document.documentElement.setAttribute('data-theme', 'light');
		window.dispatchEvent(new CustomEvent('colorModeChange', { detail: { mode: 'light' } }));
	}
}

/**
 * Check if the current mode matches the system preference
 * 检查当前模式是否与系统偏好匹配
 * @returns {boolean}
 */
export function isFollowingSystemPreference() {
	const saved = localStorage.getItem(COLOR_MODE_KEY);
	return !saved;
}

/**
 * Setup a toggle element to control color mode
 * 设置一个切换元素来控制颜色模式
 * @param {HTMLElement} element - The toggle element (checkbox or button)
 */
export function setupColorModeToggle(element) {
	if (!element) return;

	// Mark as color mode toggle
	element.setAttribute('data-color-mode-toggle', 'true');

	// Set initial state
	if (element.type === 'checkbox') {
		element.checked = getCurrentColorMode() === 'dark';
	}

	// Add event listener
	element.addEventListener('change', () => {
		if (element.type === 'checkbox') {
			applyColorMode(element.checked ? 'dark' : 'light');
		}
	});

	element.addEventListener('click', () => {
		if (element.type !== 'checkbox') {
			toggleColorMode();
		}
	});
}

// Export toggle function for global access
if (typeof window !== 'undefined') {
	window.toggleColorMode = toggleColorMode;
	window.applyColorMode = applyColorMode;
}
