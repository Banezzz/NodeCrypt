// Welcome wizard utility for first-time visitors
// 首次访问欢迎向导工具

import { t, getCurrentLanguage, setLanguage } from './util.i18n.js';
import { applyColorMode, resetColorModeToSystem } from './util.colorMode.js';

const FIRST_VISIT_KEY = 'nodecrypt.firstVisitDone';

/**
 * Check if this is the user's first visit
 * 检测是否是首次访问
 * @returns {boolean}
 */
export function isFirstVisit() {
	return !localStorage.getItem(FIRST_VISIT_KEY);
}

/**
 * Mark the user as having completed the welcome wizard
 * 标记用户已完成欢迎向导
 */
function markVisited() {
	localStorage.setItem(FIRST_VISIT_KEY, '1');
}

/**
 * Create the welcome modal HTML
 * 创建欢迎模态框 HTML
 * @returns {HTMLElement}
 */
function createWelcomeModal() {
	const modal = document.createElement('div');
	modal.className = 'welcome-modal';
	modal.id = 'welcome-modal';
	modal.setAttribute('role', 'dialog');
	modal.setAttribute('aria-modal', 'true');
	modal.setAttribute('aria-labelledby', 'welcome-title');

	modal.innerHTML = `
		<div class="welcome-modal-bg"></div>
		<div class="welcome-modal-card">
			<div class="welcome-logo">
				<img src="assets/favicon.svg" alt="NodeCrypt" />
			</div>
			<h2 id="welcome-title">${t('welcome.title', 'Welcome to NodeCrypt')}</h2>
			<p class="welcome-subtitle">${t('welcome.subtitle', 'Zero-Knowledge Encrypted Chat')}</p>

			<!-- Language Selection -->
			<div class="welcome-section">
				<label>${t('welcome.language', 'Language')}</label>
				<div class="welcome-options welcome-lang-options">
					<button class="welcome-option" data-lang="en">English</button>
					<button class="welcome-option" data-lang="zh">中文</button>
				</div>
			</div>

			<!-- Color Mode Selection -->
			<div class="welcome-section">
				<label>${t('welcome.appearance', 'Appearance')}</label>
				<div class="welcome-options welcome-color-options">
					<button class="welcome-option" data-color="light">☀️ ${t('welcome.light', 'Light')}</button>
					<button class="welcome-option" data-color="dark">🌙 ${t('welcome.dark', 'Dark')}</button>
					<button class="welcome-option active" data-color="system">🖥️ ${t('welcome.system', 'System')}</button>
				</div>
			</div>

			<button class="welcome-continue-btn" id="welcome-continue">
				${t('welcome.continue', 'Continue')}
			</button>
		</div>
	`;

	return modal;
}

/**
 * Update modal text when language changes
 * 当语言改变时更新模态框文本
 * @param {HTMLElement} modal
 */
function updateModalText(modal) {
	const title = modal.querySelector('#welcome-title');
	const subtitle = modal.querySelector('.welcome-subtitle');
	const langLabel = modal.querySelector('.welcome-section:first-of-type label');
	const appearanceLabel = modal.querySelector('.welcome-section:last-of-type label');
	const lightBtn = modal.querySelector('[data-color="light"]');
	const darkBtn = modal.querySelector('[data-color="dark"]');
	const systemBtn = modal.querySelector('[data-color="system"]');
	const continueBtn = modal.querySelector('#welcome-continue');

	if (title) title.textContent = t('welcome.title', 'Welcome to NodeCrypt');
	if (subtitle) subtitle.textContent = t('welcome.subtitle', 'Zero-Knowledge Encrypted Chat');
	if (langLabel) langLabel.textContent = t('welcome.language', 'Language');
	if (appearanceLabel) appearanceLabel.textContent = t('welcome.appearance', 'Appearance');
	if (lightBtn) lightBtn.innerHTML = `☀️ ${t('welcome.light', 'Light')}`;
	if (darkBtn) darkBtn.innerHTML = `🌙 ${t('welcome.dark', 'Dark')}`;
	if (systemBtn) systemBtn.innerHTML = `🖥️ ${t('welcome.system', 'System')}`;
	if (continueBtn) continueBtn.textContent = t('welcome.continue', 'Continue');
}

/**
 * Show the welcome modal
 * 显示欢迎模态框
 */
function showWelcomeModal() {
	const modal = createWelcomeModal();
	document.body.appendChild(modal);

	// Default select current language
	const currentLang = getCurrentLanguage();
	const langBtn = modal.querySelector(`[data-lang="${currentLang}"]`);
	if (langBtn) langBtn.classList.add('active');

	// Detect current color mode
	const storedColorMode = localStorage.getItem('nodecrypt-color-mode');
	const currentColorMode = storedColorMode || 'system';

	// Select current color mode button
	modal.querySelectorAll('[data-color]').forEach(btn => btn.classList.remove('active'));
	const colorBtn = modal.querySelector(`[data-color="${currentColorMode}"]`);
	if (colorBtn) colorBtn.classList.add('active');

	let selectedLang = currentLang;
	let selectedColor = currentColorMode;

	// Language selection
	modal.querySelectorAll('[data-lang]').forEach(btn => {
		btn.addEventListener('click', () => {
			modal.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			selectedLang = btn.dataset.lang;

			// Apply language immediately to update modal text
			setLanguage(selectedLang);
			updateModalText(modal);
		});
	});

	// Color Mode selection
	modal.querySelectorAll('[data-color]').forEach(btn => {
		btn.addEventListener('click', () => {
			modal.querySelectorAll('[data-color]').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			selectedColor = btn.dataset.color;

			// Preview color mode immediately
			if (selectedColor === 'system') {
				resetColorModeToSystem();
			} else {
				applyColorMode(selectedColor);
			}
		});
	});

	// Continue button
	modal.querySelector('#welcome-continue').addEventListener('click', () => {
		// 1. Apply and persist language
		setLanguage(selectedLang);
		try {
			const settingsStr = localStorage.getItem('settings');
			const settings = settingsStr ? JSON.parse(settingsStr) : {};
			settings.language = selectedLang;
			localStorage.setItem('settings', JSON.stringify(settings));
		} catch (e) {
			console.warn('Failed to save language setting:', e);
		}

		// 2. Apply Color Mode (already applied during preview, but ensure persistence)
		if (selectedColor === 'system') {
			resetColorModeToSystem();
		} else {
			applyColorMode(selectedColor);
		}

		// 3. Mark as visited
		markVisited();

		// 4. Remove blocking class and close modal
		document.body.classList.remove('welcome-active');
		modal.classList.add('closing');
		setTimeout(() => modal.remove(), 300);
	});

	// Show animation
	requestAnimationFrame(() => modal.classList.add('show'));
}

/**
 * Initialize welcome wizard (call in DOMContentLoaded)
 * 初始化欢迎向导（在 DOMContentLoaded 内调用）
 * @returns {boolean} Whether the welcome modal was shown
 */
export function initWelcome() {
	if (isFirstVisit()) {
		// Add blocking class to prevent login card interaction
		document.body.classList.add('welcome-active');
		// DOM is ready, show modal directly
		showWelcomeModal();
		return true;
	}
	return false;
}

/**
 * Open welcome modal on demand (for returning users)
 * 按需打开欢迎模态框（用于老用户）
 */
export function openWelcomeModal() {
	// Don't add blocking class for manual open
	showWelcomeModal();
}

/**
 * Setup preferences button click handler
 * 设置偏好设置按钮点击处理
 */
export function setupPreferencesButton() {
	document.getElementById('preferences-btn')?.addEventListener('click', openWelcomeModal);
}
