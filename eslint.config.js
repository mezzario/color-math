import js from '@eslint/js';

export default [
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'lib/**',
      'es/**',
      'src/parser.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals for library that runs in Node
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Browser globals for UMD build
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      // Code quality rules (not handled by Prettier)
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '__',
          ignoreRestSiblings: true,
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      curly: 'error',

      // Allow console for library/CLI usage
      'no-console': 'off',
    },
  },
];
