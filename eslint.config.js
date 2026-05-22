import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/.svelte-kit/**']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      'no-undef': 'off',

      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],

      curly: ['error', 'all'],

      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never'
        }
      ],

      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypePredicate',
          message:
            'Type predicates (value is Type) are not allowed. Use type guards with explicit type checking instead.'
        },
        {
          selector: 'Identifier[name="undefined"]',
          message: 'undefined is not allowed. Use null or proper type checking instead.'
        },
        {
          selector: 'TSUndefinedKeyword',
          message: 'undefined type is not allowed. Use null instead.'
        },
        {
          selector: 'CallExpression[callee.name="$effect"]',
          message: '$effect is not allowed. Use a different reactive pattern instead.'
        }
      ]
    }
  }
];
