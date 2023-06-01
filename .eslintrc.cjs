// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import("eslint").Linter.Config} */
const config = {
	overrides: [
		{
			extends: [
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
				'eslint:recommended',
				'plugin:import/errors',
				'plugin:import/warnings',
				'plugin:import/typescript',
				'plugin:@typescript-eslint/recommended',
				'plugin:react-hooks/recommended',
				'plugin:jsx-a11y/recommended',
				'plugin:prettier/recommended',
				'plugin:jest-dom/recommended',
			],
			files: ['*.ts', '*.tsx'],
			parserOptions: {
				project: path.join(__dirname, 'tsconfig.json'),
			},
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: path.join(__dirname, 'tsconfig.json'),
	},
	ignorePatterns: ['node_modules/*'],
	plugins: ['@typescript-eslint'],
	extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
	rules: {
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{
				prefer: 'type-imports',
				fixStyle: 'inline-type-imports',
			},
		],
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'import/order': [
			'error',
			{
				groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
				'newlines-between': 'always',
				alphabetize: { order: 'asc', caseInsensitive: true },
			},
		],
		'prettier/prettier': ['error', { endOfLine: 'auto' }, { usePrettierrc: true }],
	},
};

module.exports = config;
