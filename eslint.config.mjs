// 仕様: docs/spec/pbi-001-site-exists.md#設計メモ-実装者への申し送り
// ESLint 9 フラット構成。kotan-portfolio (/Users/saitoukouki/kotan-portfolio) の構成を参考に、
// Astro 用に eslint-plugin-astro / astro-eslint-parser を追加している。
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
