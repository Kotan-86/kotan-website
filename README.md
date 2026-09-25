# kotan-website

個人サイト（リニューアル）。内定同期・入社同期・社員向けに「こういう人間です」を伝える。

仕様の種: [docs/spec/website.md](docs/spec/website.md)

<!-- 仕様: docs/spec/pbi-001-site-exists.md#受入基準 (AC-17) -->

## 公開URL

https://kotan-86.github.io/kotan-website/

## 技術スタック

Astro（TypeScript）+ Tailwind CSS v4。静的サイトとしてビルドし、GitHub Pages で公開する。

ヘッダーのアイコンは astro-icon（アイコンセット: material-symbols-light）で描画する。ヘッダーの文字には Noto Sans JP（太さ 400・700）を使い、Astro の組み込みのフォント機能で読み込む（ヘッダー以外のフォントは変えない）。

<!-- 仕様: docs/spec/pbi-008-sticky-header.md#受入基準 (AC-28) -->

## ローカルでの開発

前提: Node.js 22系（LTS）以上、npm。

```bash
npm install       # 依存のインストール
npm run dev       # 開発サーバを起動（http://localhost:4321/kotan-website/ を開く）
```

## ビルド

```bash
npm run build     # 静的ビルド（出力先: dist/）
npm run preview   # ビルド結果をローカルで確認
```

ビルドにはネットワーク接続が必要である（Noto Sans JP を、ビルド時に提供元（fontsource）から取得して `dist/` に出力するため。一度取得したフォントは `node_modules/.astro/` にキャッシュされる）。

## 検査コマンド

```bash
npm run lint      # 静的解析（eslint .）
npm run check     # 型検査（astro check）
```

テストは本PBI時点では無し（動的なロジックを持つモジュールができた時点で、その単位でユニットテストを追加する）。

## デプロイの流れ

`main` ブランチへの push をきっかけに、GitHub Actions（`.github/workflows/deploy.yml`）が自動でビルドと GitHub Pages へのデプロイを行う（`workflow_dispatch` による手動実行も可能）。

このリポジトリの提出先ブランチは `develop` である。`develop` にマージされたのち、PO が `main` へ反映した時点で、上記ワークフローが起動し、公開URLに反映される。
