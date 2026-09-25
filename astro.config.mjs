// @ts-check
// 仕様: docs/spec/pbi-001-site-exists.md#制約・関連機能
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
// site/base は GitHub Pages のプロジェクトページ運用に合わせて固定する(仕様で確定・変更不可)。
// Tailwind CSS v4 は astro add tailwind (v3向け統合)を使わず、@tailwindcss/vite を vite.plugins に直接入れる。
export default defineConfig({
  site: 'https://kotan-86.github.io',
  base: '/kotan-website/',
  // 仕様: docs/spec/pbi-008-sticky-header.md#設計メモ (B-2, Q7)
  // Noto Sans JP は Astro 組み込みのフォント機能で読み込む(ヘッダーのみで使用)。
  // ヘッダーのアイコンは astro-icon + material-symbols-light のみ(B-1)。
  integrations: [icon({ include: { 'material-symbols-light': ['interests-outline', 'search-activity', 'communication', 'psychology-outline'] } })],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['japanese', 'latin'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
