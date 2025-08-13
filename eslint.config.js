import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import babelParser from '@babel/eslint-parser'

export default [
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'lib/**',
      'es/**',
      'src/parser.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-class-properties']
        }
      },
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        window: 'readonly',
        document: 'readonly'
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      'quotes': [
        'error',
        'single',
        {
          'avoidEscape': true,
          'allowTemplateLiterals': true
        }
      ],
      'indent': [
        'error',
        2,
        {
          'SwitchCase': 1
        }
      ],
      'semi': [
        'error',
        'never'
      ],
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          'varsIgnorePattern': '__',
          'ignoreRestSiblings': true
        }
      ],
      'comma-dangle': [
        'error',
        {
          'arrays': 'always-multiline',
          'objects': 'always-multiline',
          'imports': 'always-multiline',
          'exports': 'always-multiline',
          'functions': 'ignore'
        }
      ],
      'array-bracket-spacing': [
        'error',
        'never'
      ],
      'object-curly-spacing': [
        'error',
        'never'
      ],
      'object-shorthand': [
        'error',
        'always'
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'brace-style': [
        'error',
        '1tbs',
        {
          'allowSingleLine': true
        }
      ],
      'curly': 'error',
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'comma-spacing': 'error',
      'arrow-spacing': 'error',
      'key-spacing': [
        'error',
        {
          'mode': 'minimum'
        }
      ],
      'semi-spacing': 'error',
      'space-in-parens': [
        'error',
        'never'
      ],
      'space-infix-ops': 'error',
      'import/no-named-as-default-member': 'off'
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx']
        }
      }
    }
  }
]