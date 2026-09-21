import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import i18next from 'eslint-plugin-i18next';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      i18next,
    },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          markupOnly: true, // Only flag hardcoded strings inside JSX elements
          ignoreAttribute: [
            'className',
            'style',
            'type',
            'key',
            'id',
            'name',
            'alt',
            'src',
            'href',
            'aria-*',
          ],
        },
      ],
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
