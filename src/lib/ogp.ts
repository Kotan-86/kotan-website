// 仕様: docs/spec/pbi-009-outputs-section.md#設計メモ (AC-12, AC-13, AC-14, AC-31, AC-32)
// OGP の取得と解釈。純関数(fetch・store・log は注入。ネットワーク・ファイルに直接触れない)。
import type { OutputItem } from "../data/outputs";

export const OGP_TIMEOUT_MS = 10_000;

export type OgpFailureKind = "connection" | "http-error" | "no-og-image" | "image" | "timeout";

export type ThumbnailResult =
	| { readonly kind: "thumbnail"; readonly src: string }
	| { readonly kind: "none"; readonly failure: OgpFailureKind };

export type FetchLike = (input: string, init?: { signal?: AbortSignal }) => Promise<Response>;

export type StoreImage = (image: {
	readonly sourceUrl: string;
	readonly bytes: Uint8Array;
	readonly contentType: string | null;
}) => Promise<string>;

export interface OgpDeps {
	fetch: FetchLike;
	store: StoreImage;
	timeoutMs?: number;
	log?: (line: string) => void;
}

const namedEntities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
		if (body[0] === "#") {
			const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
			return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
		}
		return namedEntities[body.toLowerCase()] ?? whole;
	});
}

export function extractOgImage(html: string, pageUrl: string): string | null {
	for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
		const attrs = new Map<string, string>();
		for (const m of tag.matchAll(/([^\s"'=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
			attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? "");
		}
		if (attrs.get("property")?.trim().toLowerCase() !== "og:image") continue;
		const content = decodeEntities(attrs.get("content") ?? "").trim();
		if (content === "") continue;
		try {
			const url = new URL(content, pageUrl);
			if (url.protocol === "http:" || url.protocol === "https:") return url.href;
		} catch {
			// URL として不正: 次の候補へ
		}
	}
	return null;
}

export function formatFailureLog(pageUrl: string, failure: OgpFailureKind): string {
	return `[ogp] サムネイルなし: ${pageUrl} (${failure})`;
}

// 1件の取得全体(HTML + 画像)で1つの打ち切り。fetch が signal を無視しても timeoutMs で結果を返す。
export async function fetchThumbnail(pageUrl: string, deps: OgpDeps): Promise<ThumbnailResult> {
	const timeoutMs = deps.timeoutMs ?? OGP_TIMEOUT_MS;
	const log = deps.log ?? ((line: string) => console.warn(line));
	const controller = new AbortController();
	let timedOut = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const fail = (failure: OgpFailureKind): ThumbnailResult => ({
		kind: "none",
		failure: timedOut ? "timeout" : failure,
	});

	const work = async (): Promise<ThumbnailResult> => {
		let html: string;
		try {
			const res = await deps.fetch(pageUrl, { signal: controller.signal });
			if (!res.ok) return fail("http-error");
			html = await res.text();
		} catch {
			return fail("connection");
		}
		const imageUrl = extractOgImage(html, pageUrl);
		if (imageUrl === null) return fail("no-og-image");
		try {
			const res = await deps.fetch(imageUrl, { signal: controller.signal });
			if (!res.ok) return fail("image");
			const bytes = new Uint8Array(await res.arrayBuffer());
			const src = await deps.store({ sourceUrl: imageUrl, bytes, contentType: res.headers.get("content-type") });
			return { kind: "thumbnail", src };
		} catch {
			return fail("image");
		}
	};

	const deadline = new Promise<ThumbnailResult>((resolve) => {
		timer = setTimeout(() => {
			timedOut = true;
			resolve({ kind: "none", failure: "timeout" });
			controller.abort();
		}, timeoutMs);
	});

	try {
		const result = await Promise.race([work(), deadline]);
		if (result.kind === "none") log(formatFailureLog(pageUrl, result.failure));
		return result;
	} finally {
		clearTimeout(timer);
	}
}

// 全件を同時に始め、入力と同じ順で返す(AC-32)。
export function fetchThumbnails(pageUrls: readonly string[], deps: OgpDeps): Promise<ThumbnailResult[]> {
	return Promise.all(pageUrls.map((url) => fetchThumbnail(url, deps)));
}

export type OutputCardView = {
	readonly url: string;
	readonly title: string;
	readonly summary: string;
	readonly thumbnailSrc: string | null;
};

// 文言と URL は常に item から取る(OGP のタイトル・説明は使わない。AC-14)。
export function toCardView(item: OutputItem, thumbnail: ThumbnailResult): OutputCardView {
	return {
		url: item.url,
		title: item.title,
		summary: item.summary,
		thumbnailSrc: thumbnail.kind === "thumbnail" ? thumbnail.src : null,
	};
}
