import security from 'eslint-plugin-security';

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'coverage/**']
	},
	{
		files: ['client/js/**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				crypto: 'readonly',
				localStorage: 'readonly',
				WebSocket: 'readonly',
				URL: 'readonly',
				URLSearchParams: 'readonly',
				FileReader: 'readonly',
				Blob: 'readonly',
				btoa: 'readonly',
				atob: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearTimeout: 'readonly',
				clearInterval: 'readonly',
				prompt: 'readonly',
				location: 'readonly',
				navigator: 'readonly',
				Map: 'readonly',
				Set: 'readonly',
				BigInt: 'readonly',
				Uint8Array: 'readonly',
				DataView: 'readonly',
				TextEncoder: 'readonly',
				TextDecoder: 'readonly',
				Promise: 'readonly'
			}
		},
		plugins: {
			security
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'eqeqeq': ['error', 'always'],
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'security/detect-object-injection': 'warn',
			'security/detect-non-literal-regexp': 'warn',
			'security/detect-unsafe-regex': 'error'
		}
	},
	{
		files: ['worker/**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				console: 'readonly',
				crypto: 'readonly',
				Response: 'readonly',
				WebSocket: 'readonly',
				URL: 'readonly',
				Map: 'readonly',
				Set: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearTimeout: 'readonly',
				clearInterval: 'readonly'
			}
		},
		plugins: {
			security
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'eqeqeq': ['error', 'always'],
			'no-eval': 'error',
			'no-implied-eval': 'error'
		}
	},
	{
		files: ['tests/**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				vi: 'readonly',
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				crypto: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
		}
	}
];
