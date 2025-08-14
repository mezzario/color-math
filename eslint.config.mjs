import js from '@eslint/js';

export default [
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'lib/**',
      'es/**',
      'src/parser.js',
      'src/parser.generated.js',
      'src/parser.template.js',
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
        console: 'readonly',
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
      
      // Disallow namespace imports (import * as)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportNamespaceSpecifier',
          message: 'Use named imports instead of namespace imports (import * as). If you need the entire module as an object, export a default object from the module.'
        },
        {
          selector: 'ImportDeclaration[source.value=/^\\..*$/] ImportDefaultSpecifier',
          message: 'Use named imports instead of default imports for internal modules (starting with ./ or ../). External libraries are allowed to use default imports.'
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports instead of default exports.'
        }
      ],
    },
  },
  {
    files: ['vite*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals for config files
        process: 'readonly',
        require: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Config files can use default exports
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportNamespaceSpecifier',
          message: 'Use named imports instead of namespace imports (import * as). If you need the entire module as an object, export a default object from the module.'
        },
        {
          selector: 'ImportDeclaration[source.value=/^\\..*$/] ImportDefaultSpecifier',
          message: 'Use named imports instead of default imports for internal modules (starting with ./ or ../). External libraries are allowed to use default imports.'
        }
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      curly: 'error',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals for scripts
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
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
