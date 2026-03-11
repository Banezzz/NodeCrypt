/**
 * NodeCrypt Security Utilities
 * 安全工具模块 - 截图保护与隐私增强
 *
 * Note: True screenshot prevention is technically impossible on web platforms.
 * These measures provide deterrents and make casual screenshotting harder.
 * 注意：在Web平台上真正阻止截图在技术上是不可能的。
 * 这些措施提供威慑，使随意截图变得更困难。
 */

// Track if screenshot protection is active
let isProtectionActive = false;

/**
 * Initialize screenshot protection measures
 * 初始化截图保护措施
 */
export function initScreenshotProtection() {
	if (isProtectionActive) return;
	isProtectionActive = true;

	// Disable common screenshot keyboard shortcuts
	// 禁用常见的截图键盘快捷键
	document.addEventListener('keydown', handleKeyboardShortcuts);

	// Detect when page loses focus (potential screenshot)
	// 检测页面失去焦点（可能的截图行为）
	document.addEventListener('visibilitychange', handleVisibilityChange);

	// Disable drag and drop of images
	// 禁用图片拖放
	document.addEventListener('dragstart', handleDragStart);

	// Add print protection
	// 添加打印保护
	window.addEventListener('beforeprint', handleBeforePrint);
	window.addEventListener('afterprint', handleAfterPrint);

	console.log('[Security] Screenshot protection initialized');
}

/**
 * Handle keyboard shortcuts that could be used for screenshots
 * 处理可能用于截图的键盘快捷键
 */
function handleKeyboardShortcuts(e) {
	// PrintScreen key
	if (e.key === 'PrintScreen') {
		e.preventDefault();
		showSecurityNotice('screenshot');
		return false;
	}

	// Ctrl/Cmd + P (Print)
	if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
		e.preventDefault();
		showSecurityNotice('print');
		return false;
	}

	// Ctrl/Cmd + Shift + S (Some screenshot tools)
	if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
		e.preventDefault();
		showSecurityNotice('screenshot');
		return false;
	}

	// Ctrl/Cmd + Shift + 3/4 (macOS screenshot)
	if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '3' || e.key === '4')) {
		e.preventDefault();
		showSecurityNotice('screenshot');
		return false;
	}

	// F12 (DevTools - can be used to inspect/copy content)
	if (e.key === 'F12') {
		// Allow in development, block in production
		if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
			e.preventDefault();
			return false;
		}
	}
}

/**
 * Handle visibility change (tab switching, app switching)
 * 处理可见性变化（切换标签页、切换应用）
 */
function handleVisibilityChange() {
	if (document.hidden) {
		// Page is hidden - potential screenshot happening
		// 页面被隐藏 - 可能正在截图
		addSecurityOverlay();
	} else {
		// Page is visible again
		// 页面再次可见
		removeSecurityOverlay();
	}
}

/**
 * Handle drag start to prevent image dragging
 * 处理拖动开始以防止图片拖动
 */
function handleDragStart(e) {
	if (e.target.tagName === 'IMG' && e.target.closest('.chat-area')) {
		e.preventDefault();
		return false;
	}
}

/**
 * Handle before print event
 * 处理打印前事件
 */
function handleBeforePrint() {
	const chatArea = document.querySelector('.chat-area');
	if (chatArea) {
		chatArea.classList.add('print-protected');
	}
}

/**
 * Handle after print event
 * 处理打印后事件
 */
function handleAfterPrint() {
	const chatArea = document.querySelector('.chat-area');
	if (chatArea) {
		chatArea.classList.remove('print-protected');
	}
}

/**
 * Add a security overlay when page loses focus
 * 当页面失去焦点时添加安全覆盖层
 */
function addSecurityOverlay() {
	// Only add overlay if there are private messages visible
	// 仅在有可见的私聊消息时添加覆盖层
	const privateMessages = document.querySelectorAll('.bubble.private-message');
	if (privateMessages.length === 0) return;

	let overlay = document.getElementById('security-overlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'security-overlay';
		overlay.innerHTML = `
			<div class="security-overlay-content">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
				</svg>
				<span>Content Protected</span>
			</div>
		`;
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.95);
			z-index: 99999;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #f97316;
			font-family: var(--font-mono, monospace);
			font-size: 18px;
			flex-direction: column;
			gap: 16px;
		`;
		document.body.appendChild(overlay);
	}
	overlay.style.display = 'flex';
}

/**
 * Remove the security overlay
 * 移除安全覆盖层
 */
function removeSecurityOverlay() {
	const overlay = document.getElementById('security-overlay');
	if (overlay) {
		overlay.style.display = 'none';
	}
}

/**
 * Show a security notice to the user
 * 向用户显示安全提示
 * @param {string} type - Type of security event
 */
function showSecurityNotice(type) {
	// Create a toast notification
	let toast = document.getElementById('security-toast');
	if (!toast) {
		toast = document.createElement('div');
		toast.id = 'security-toast';
		toast.style.cssText = `
			position: fixed;
			bottom: 100px;
			left: 50%;
			transform: translateX(-50%) translateY(20px);
			background: linear-gradient(135deg, #f97316, #ea580c);
			color: white;
			padding: 12px 24px;
			border-radius: 10px;
			font-family: var(--font-mono, monospace);
			font-size: 13px;
			z-index: 100000;
			box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
			opacity: 0;
			transition: opacity 0.3s ease, transform 0.3s ease;
			display: flex;
			align-items: center;
			gap: 8px;
		`;
		document.body.appendChild(toast);
	}

	const messages = {
		screenshot: 'Screenshot protection active',
		print: 'Print function disabled'
	};

	toast.innerHTML = `
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
		</svg>
		${messages[type] || 'Security protection active'}
	`;

	toast.style.opacity = '1';
	toast.style.transform = 'translateX(-50%) translateY(0)';

	// Hide after 2 seconds
	setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transform = 'translateX(-50%) translateY(20px)';
	}, 2000);
}

/**
 * Apply screenshot protection to specific elements
 * 将截图保护应用到特定元素
 * @param {HTMLElement} element - Element to protect
 */
export function protectElement(element) {
	if (!element) return;

	element.classList.add('screenshot-protected');
	element.style.userSelect = 'none';
	element.style.webkitUserSelect = 'none';
	element.style.webkitTouchCallout = 'none';
}

/**
 * Disable screenshot protection
 * 禁用截图保护
 */
export function disableScreenshotProtection() {
	document.removeEventListener('keydown', handleKeyboardShortcuts);
	document.removeEventListener('visibilitychange', handleVisibilityChange);
	document.removeEventListener('dragstart', handleDragStart);
	window.removeEventListener('beforeprint', handleBeforePrint);
	window.removeEventListener('afterprint', handleAfterPrint);

	isProtectionActive = false;
	console.log('[Security] Screenshot protection disabled');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initScreenshotProtection);
} else {
	initScreenshotProtection();
}
