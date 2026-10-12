// 仕様: docs/spec/pbi-009-outputs-section.md#設計メモ (AC-10, AC-11, AC-32。設計メモ1・4・5)
// 副作用あり(ネットワーク・ファイル書き出し)。ユニットテストの対象外。ロジックは ogp.ts。
// 方式A: Astro の画像機能(getImage)で取り込む。方式B(public/ への書き出し)は dist/ に載らなかった(D-5-T3-1)。
import { getImage } from "astro:assets";
import { outputs } from "../data/outputs";
import { fetchThumbnails, type StoreImage, type ThumbnailResult } from "./ogp";

// 自前の fetch で取得できた画像の URL だけが渡される(取得に失敗した画像は画像機能に渡さない。AC-12④)。
// 画像機能が dist/_astro/ に取り込み、サイト自身のパスを返す。失敗は reject(ogp.ts が「image」に分類する)。
const store: StoreImage = async ({ sourceUrl }) => {
	const image = await getImage({ src: sourceUrl, inferSize: true });
	return image.src;
};

// 初回の呼び出しで全件の取得を並列に1回だけ始め、結果を使い回す(開発サーバの再読み込みでも取り直さない)。
let all: Promise<Map<string, ThumbnailResult>> | undefined;

export async function getOutputThumbnail(pageUrl: string): Promise<ThumbnailResult> {
	all ??= (async () => {
		const urls = outputs.items.map((item) => item.url);
		const results = await fetchThumbnails(urls, { fetch: globalThis.fetch, store });
		return new Map(urls.map((url, i) => [url, results[i]]));
	})();
	return (await all).get(pageUrl) ?? { kind: "none", failure: "no-og-image" };
}
