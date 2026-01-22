import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		include: ['tests/**/*.test.js'],
		globals: true,
		setupFiles: ['./tests/setup.js'],
		deps: {
			interopDefault: true
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'html'],
			include: ['client/js/**/*.js', 'worker/**/*.js'],
			exclude: ['**/node_modules/**', '**/dist/**']
		}
	},
	esbuild: {
		target: 'esnext'
	}
});
