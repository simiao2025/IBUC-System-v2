import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'backend/**', 'node_modules/**', '**/*.backup.tsx'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app',
        },
        {
          type: 'pages',
          pattern: 'src/pages',
        },
        {
          type: 'widgets',
          pattern: 'src/widgets',
        },
        {
          type: 'features',
          pattern: 'src/features',
        },
        {
          type: 'entities',
          pattern: 'src/entities',
        },
        {
          type: 'shared',
          pattern: 'src/shared',
        },
      ],
    },
    rules: {
      ...react.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Boundaries Rules (FSD)
      'boundaries/no-unknown': 'off', // Allow loose file structure for now during migration
      'boundaries/no-unknown-files': 'off',
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'shared',
              disallow: ['app', 'pages', 'widgets', 'features', 'entities'],
              message: 'Shared layer cannot import from upper layers',
            },
            {
              from: 'entities',
              disallow: ['app', 'pages', 'widgets', 'features'],
              message: 'Entities layer cannot import from upper layers',
            },
            {
              from: 'features',
              disallow: ['app', 'pages', 'widgets'],
              message: 'Features layer cannot import from upper layers',
            },
            {
              from: 'widgets',
              disallow: ['app', 'pages'],
              message: 'Widgets layer cannot import from upper layers',
            },
            {
              from: 'pages',
              disallow: ['app'],
              message: 'Pages layer cannot import from App layer',
            },
            // Sideways Coupling Prevention (The Critical "Golden Rule")
            {
              from: 'features',
              disallow: [['features', { 'import': true }]], 
              message: 'Feature cannot import another Feature directly (Sideways Coupling)',
            }
          ],
        },
      ],
    },
  }
);
