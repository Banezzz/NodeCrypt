// Global error handling utilities
// 全局错误处理工具

/**
 * Global error handler for consistent error management
 * 全局错误处理器，用于一致的错误管理
 */
export class ErrorHandler {
	static handlers = new Map();
	static debug = false;

	/**
	 * Register a handler for a specific error category
	 * 为特定错误类别注册处理器
	 * @param {string} category - Error category name
	 * @param {Function} handler - Handler function(error, context)
	 */
	static register(category, handler) {
		this.handlers.set(category, handler);
	}

	/**
	 * Handle an error with the appropriate handler
	 * 使用适当的处理器处理错误
	 * @param {Error} error - The error object
	 * @param {string} category - Error category ('general', 'network', 'crypto', etc.)
	 * @param {Object} context - Additional context about the error
	 */
	static handle(error, category = 'general', context = {}) {
		if (this.debug) {
			console.error(`[ErrorHandler:${category}]`, error, context);
		}

		const handler = this.handlers.get(category) || this.handlers.get('general');
		if (handler) {
			try {
				handler(error, context);
			} catch (handlerError) {
				console.error('[ErrorHandler] Handler threw an error:', handlerError);
			}
		}
	}

	/**
	 * Enable or disable debug mode
	 * 启用或禁用调试模式
	 * @param {boolean} enabled
	 */
	static setDebug(enabled) {
		this.debug = enabled;
	}

	/**
	 * Create a wrapped function that catches and handles errors
	 * 创建一个捕获并处理错误的包装函数
	 * @param {Function} fn - Function to wrap
	 * @param {string} category - Error category for this function
	 * @returns {Function} Wrapped function
	 */
	static wrap(fn, category = 'general') {
		return (...args) => {
			try {
				const result = fn(...args);
				if (result instanceof Promise) {
					return result.catch(error => {
						this.handle(error, category, { args });
						throw error;
					});
				}
				return result;
			} catch (error) {
				this.handle(error, category, { args });
				throw error;
			}
		};
	}
}

// Set up global error listeners (only in browser environment)
// 设置全局错误监听器（仅在浏览器环境中）
if (typeof window !== 'undefined') {
	// Catch uncaught errors
	window.addEventListener('error', (event) => {
		ErrorHandler.handle(event.error || new Error(event.message), 'uncaught', {
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno
		});
	});

	// Catch unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		ErrorHandler.handle(event.reason, 'promise', {
			promise: event.promise
		});
	});
}

// Register default general handler
ErrorHandler.register('general', (error, context) => {
	console.error('[General Error]', error.message || error, context);
});

// Register network error handler
ErrorHandler.register('network', (error, context) => {
	console.error('[Network Error]', error.message || error, context);
	// Could trigger UI notification here
	if (window.addSystemMsg) {
		window.addSystemMsg(`Network error: ${error.message}`);
	}
});

// Register crypto error handler
ErrorHandler.register('crypto', (error, context) => {
	console.error('[Crypto Error]', error.message || error, context);
});
