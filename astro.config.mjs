// @ts-check
// 仕様: docs/spec/pbi-001-site-exists.md#制約・関連機能
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// site/base は GitHub Pages のプロジェクトページ運用に合わせて固定する(仕様で確定・変更不可)。
// Tailwind CSS v4 は astro add tailwind (v3向け統合)を使わず、@tailwindcss/vite を vite.plugins に直接入れる。
export default defineConfig({
  site: 'https://kotan-86.github.io',
  base: '/kotan-website/',
  vite: {
    plugins: [tailwindcss()],
  },
});
