import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      'no-undef': 'off',
      // Use unused-imports so `generate:types` can auto-strip type-crafter's dead
      // imports via `eslint --fix` (no-unused-imports is autofixable; the core rule is not).
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      // Require curly braces for all control statements (no bracketless if/else/while/for)
      curly: ['error', 'all'],

      // Disallow the 'as' operator (type assertions)
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never'
        }
      ],

      // Disallow TypeScript type predicates (value is SomeType) and undefined
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
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    }
  }
);
