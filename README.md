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

また、アウトプットのカードのサムネイルのため、ビルド時に各リンク先の OGP 画像（`og:image`）を取得し、`dist/` に取り込む（閲覧者のブラウザは外部の画像を読みに行かない）。1件あたり 10 秒で打ち切り、取得できなかったカードはサムネイルなしで表示される（ビルドは失敗せず、失敗した URL と理由がビルドのログに出る）。

プロキシ環境でビルドするときは、環境変数 `NODE_USE_ENV_PROXY=1`（Node 22.21 以降・24 以降）を付ける（例: `NODE_USE_ENV_PROXY=1 npm run build`。PowerShell では `$env:NODE_USE_ENV_PROXY = "1"; npm run build` と書く。dev も同様。設定は同じウィンドウで有効で、解除は `Remove-Item Env:NODE_USE_ENV_PROXY`）。付けないと OGP の取得が打ち切られ、サムネイルなしになる（ビルドは成功する）。

## 検査コマンド

```bash
npm run lint      # 静的解析（eslint .）
npm run check     # 型検査（astro check）
npm test          # ユニットテスト（vitest run。ネットワークには接続しない）
```

## デプロイの流れ

`main` ブランチへの push をきっかけに、GitHub Actions（`.github/workflows/deploy.yml`）が自動でビルドと GitHub Pages へのデプロイを行う（`workflow_dispatch` による手動実行も可能）。

このリポジトリの提出先ブランチは `develop` である。`develop` にマージされたのち、PO が `main` へ反映した時点で、上記ワークフローが起動し、公開URLに反映される。
