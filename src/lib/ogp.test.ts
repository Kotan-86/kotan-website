// 仕様: docs/spec/pbi-009-outputs-section.md#受入基準 (AC-12, AC-13, AC-14, AC-31, AC-32)
// ネットワーク・ファイルには触れない。fetch / store はスタブ、timeoutMs は小さい値。
import { describe, expect, it, vi } from "vitest";
import { outputs } from "../data/outputs";
import {
	OGP_TIMEOUT_MS,
	extractOgImage,
	fetchThumbnail,
	fetchThumbnails,
	formatFailureLog,
	toCardView,
	type FetchLike,
	type OgpDeps,
	type StoreImage,
} from "./ogp";

const PAGE = "https://example.com/talk";
const IMAGE = "https://img.example.com/og.png";
const STORED = "/kotan-website/ogp/og.png";
const HTML_WITH_OG = `<html><head><meta property="og:image" content="${IMAGE}"></head></html>`;

const htmlResponse = (html: string, status = 200) =>
	new Response(html, { status, headers: { "content-type": "text/html" } });
const imageResponse = (status = 200) =>
	new Response(new Uint8Array([1, 2, 3]), { status, headers: { "content-type": "image/png" } });

const okStore: StoreImage = async () => STORED;

// 常に応答しない fetch。signal を守る版と、無視する版。
const hangingIgnoringSignal: FetchLike = () => new Promise<Response>(() => {});
const hangingHonoringSignal: FetchLike = (_input, init) =>
	new Promise<Response>((_resolve, reject) => {
		init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
	});

const deps = (fetch: FetchLike, extra: Partial<OgpDeps> = {}): OgpDeps => ({
	fetch,
	store: okStore,
	timeoutMs: 100,
	log: () => {},
	...extra,
});

// ページ URL ごとに HTML、画像 URL に画像を返す fetch
const routedFetch =
	(routes: Record<string, () => Response | Promise<Response>>): FetchLike =>
	async (input) => {
		const route = routes[input];
		if (!route) throw new Error(`unexpected fetch: ${input}`);
		return route();
	};

describe("AC-31 OGP の解釈 (extractOgImage)", () => {
	it("AC-31(1): property -> content の順の meta から画像 URL が得られる", () => {
		const html = `<meta property="og:image" content="${IMAGE}">`;
		expect(extractOgImage(html, PAGE)).toBe(IMAGE);
	});

	it("AC-31(2): content -> property の順の meta からも同じ画像 URL が得られる", () => {
		const html = `<meta content="${IMAGE}" property="og:image">`;
		expect(extractOgImage(html, PAGE)).toBe(IMAGE);
	});

	it("AC-31(3): content の HTML 文字参照 (&amp;) がデコードされる", () => {
		const html = `<meta property="og:image" content="https://img.example.com/a.jpg?w=1&amp;h=2&amp;s=abc">`;
		expect(extractOgImage(html, PAGE)).toBe("https://img.example.com/a.jpg?w=1&h=2&s=abc");
	});

	it("AC-31: 属性の順が違っても、文字参照を含んでも結果が同じ (content -> property + &amp;)", () => {
		const html = `<meta content='https://img.example.com/a.jpg?w=1&amp;h=2' property='og:image' />`;
		expect(extractOgImage(html, PAGE)).toBe("https://img.example.com/a.jpg?w=1&h=2");
	});

	it("AC-31: 他の meta があっても og:image を選ぶ", () => {
		const html = `<meta property="og:title" content="t"><meta name="description" content="d"><meta property="og:image" content="${IMAGE}">`;
		expect(extractOgImage(html, PAGE)).toBe(IMAGE);
	});

	it("公開IF: 相対 URL は pageUrl を基準に絶対 URL になる", () => {
		const html = `<meta property="og:image" content="/img/og.png">`;
		expect(extractOgImage(html, "https://example.com/a/b")).toBe("https://example.com/img/og.png");
	});

	it("公開IF: og:image が無い・空・URL として不正なら null", () => {
		expect(extractOgImage("<html><head></head></html>", PAGE)).toBeNull();
		expect(extractOgImage(`<meta property="og:image" content="">`, PAGE)).toBeNull();
		expect(extractOgImage(`<meta property="og:image" content="http://[bad">`, PAGE)).toBeNull();
	});
});

describe("AC-12 取得できないときの結果 (fetchThumbnail)", () => {
	it("取得できたとき: store が返したパスのサムネイルになり、画像が store に渡される", async () => {
		const store = vi.fn<StoreImage>(async () => STORED);
		const fetch = routedFetch({
			[PAGE]: () => htmlResponse(HTML_WITH_OG),
			[IMAGE]: () => imageResponse(),
		});
		const result = await fetchThumbnail(PAGE, deps(fetch, { store }));
		expect(result).toEqual({ kind: "thumbnail", src: STORED });
		expect(store).toHaveBeenCalledTimes(1);
		const arg = store.mock.calls[0][0];
		expect(arg.sourceUrl).toBe(IMAGE);
		expect(Array.from(arg.bytes)).toEqual([1, 2, 3]);
		expect(arg.contentType).toBe("image/png");
	});

	it("AC-12(1): HTML の取得で接続が失敗する -> none / connection (reject しない)", async () => {
		const fetch: FetchLike = async () => {
			throw new TypeError("fetch failed");
		};
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "connection" });
	});

	it("AC-12(2): HTML の応答がエラー (404) -> none / http-error", async () => {
		const fetch = routedFetch({ [PAGE]: () => htmlResponse("not found", 404) });
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "http-error" });
	});

	it("AC-12(3): HTML に og:image が無い -> none / no-og-image", async () => {
		const fetch = routedFetch({ [PAGE]: () => htmlResponse("<html><head><title>x</title></head></html>") });
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "no-og-image" });
	});

	it("AC-12(4): 画像の取得が reject する -> none / image", async () => {
		const fetch = routedFetch({
			[PAGE]: () => htmlResponse(HTML_WITH_OG),
			[IMAGE]: () => Promise.reject(new TypeError("fetch failed")),
		});
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "image" });
	});

	it("AC-12(4): 画像の応答がエラー (404) -> none / image", async () => {
		const fetch = routedFetch({
			[PAGE]: () => htmlResponse(HTML_WITH_OG),
			[IMAGE]: () => imageResponse(404),
		});
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "image" });
	});

	it("AC-12(4): store が reject する -> none / image", async () => {
		const fetch = routedFetch({
			[PAGE]: () => htmlResponse(HTML_WITH_OG),
			[IMAGE]: () => imageResponse(),
		});
		const store: StoreImage = async () => {
			throw new Error("disk full");
		};
		await expect(fetchThumbnail(PAGE, deps(fetch, { store }))).resolves.toEqual({ kind: "none", failure: "image" });
	});

	it("AC-12(5): HTML の取得が応答しない (signal を守る fetch) -> timeoutMs で none / timeout", async () => {
		await expect(fetchThumbnail(PAGE, deps(hangingHonoringSignal))).resolves.toEqual({
			kind: "none",
			failure: "timeout",
		});
	});

	it("AC-12(5): 注入された fetch が signal を無視して応答しなくても、timeoutMs で none / timeout を返す", async () => {
		const started = Date.now();
		const result = await fetchThumbnail(PAGE, deps(hangingIgnoringSignal));
		expect(result).toEqual({ kind: "none", failure: "timeout" });
		expect(Date.now() - started).toBeLessThan(1000);
	});

	it("AC-12(5): fetch に signal が渡される", async () => {
		let received: AbortSignal | undefined;
		const fetch: FetchLike = (_input, init) => {
			received = init?.signal;
			return hangingIgnoringSignal(_input, init);
		};
		await fetchThumbnail(PAGE, deps(fetch));
		expect(received).toBeInstanceOf(AbortSignal);
	});

	it("AC-12(5): 画像の取得の段階で応答しなくても timeout (打ち切りが image より優先)", async () => {
		const fetch = routedFetch({
			[PAGE]: () => htmlResponse(HTML_WITH_OG),
			[IMAGE]: () => new Promise<Response>(() => {}),
		});
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "timeout" });
	});

	it("AC-12(5): 打ち切りは HTML と画像の合計 (各段階が timeoutMs 未満でも、合計が達したら timeout)", async () => {
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		const fetch = routedFetch({
			[PAGE]: async () => {
				await sleep(70);
				return htmlResponse(HTML_WITH_OG);
			},
			[IMAGE]: async () => {
				await sleep(70);
				return imageResponse();
			},
		});
		// 各 70ms、合計 140ms > timeoutMs 100ms
		await expect(fetchThumbnail(PAGE, deps(fetch))).resolves.toEqual({ kind: "none", failure: "timeout" });
	});

	it("AC-12(5): 既定の打ち切り時間は 10 秒", () => {
		expect(OGP_TIMEOUT_MS).toBe(10_000);
	});
});

describe("AC-13 失敗のログ", () => {
	it("formatFailureLog は URL と失敗の種類を含む、改行を含まない1行", () => {
		const line = formatFailureLog(PAGE, "timeout");
		expect(line).toContain(PAGE);
		expect(line).toContain("timeout");
		expect(line).not.toMatch(/[\r\n]/);
	});

	it("formatFailureLog は失敗の種類ごとに識別子を含む", () => {
		for (const kind of ["connection", "http-error", "no-og-image", "image", "timeout"] as const) {
			expect(formatFailureLog(PAGE, kind)).toContain(kind);
		}
	});

	it("失敗したときだけ log が1回呼ばれ、引数は formatFailureLog の結果", async () => {
		const log = vi.fn<(line: string) => void>();
		const fetch = routedFetch({ [PAGE]: () => htmlResponse("nope", 404) });
		await fetchThumbnail(PAGE, deps(fetch, { log }));
		expect(log).toHaveBeenCalledTimes(1);
		expect(log).toHaveBeenCalledWith(formatFailureLog(PAGE, "http-error"));
	});

	it("タイムアウトでも log は1回、URL と timeout を含む", async () => {
		const log = vi.fn<(line: string) => void>();
		await fetchThumbnail(PAGE, deps(hangingIgnoringSignal, { log }));
		expect(log).toHaveBeenCalledTimes(1);
		const line = log.mock.calls[0][0];
		expect(line).toContain(PAGE);
		expect(line).toContain("timeout");
	});

	it("成功したときは log を呼ばない", async () => {
		const log = vi.fn<(line: string) => void>();
		const fetch = routedFetch({
			[PAGE]: () => htmlResponse(HTML_WITH_OG),
			[IMAGE]: () => imageResponse(),
		});
		await fetchThumbnail(PAGE, deps(fetch, { log }));
		expect(log).not.toHaveBeenCalled();
	});

	it("fetchThumbnails: 失敗した URL ごとに1行ずつ、その URL を含むログが出る", async () => {
		const a = "https://example.com/a";
		const b = "https://example.com/b";
		const lines: string[] = [];
		const fetch = routedFetch({
			[a]: () => htmlResponse("x", 500),
			[b]: () => htmlResponse("<html></html>"),
		});
		await fetchThumbnails([a, b], deps(fetch, { log: (l) => lines.push(l) }));
		expect(lines).toHaveLength(2);
		expect(lines.filter((l) => l.includes(a))).toHaveLength(1);
		expect(lines.filter((l) => l.includes(b))).toHaveLength(1);
	});
});

describe("AC-14 文言は OGP の取得結果に左右されない (toCardView)", () => {
	const item = outputs.items[0];

	it("サムネイルありのとき: 文言と URL は item のまま、thumbnailSrc は src", () => {
		expect(toCardView(item, { kind: "thumbnail", src: STORED })).toEqual({
			url: item.url,
			title: item.title,
			summary: item.summary,
			thumbnailSrc: STORED,
		});
	});

	it("失敗の種類のどれでも: 文言と URL は item のまま、thumbnailSrc は null", () => {
		for (const failure of ["connection", "http-error", "no-og-image", "image", "timeout"] as const) {
			expect(toCardView(item, { kind: "none", failure })).toEqual({
				url: item.url,
				title: item.title,
				summary: item.summary,
				thumbnailSrc: null,
			});
		}
	});

	it("OGP のタイトル・説明を含む HTML を取得しても、カードの文言は item のまま", async () => {
		const html = `<meta property="og:title" content="OGPの題名"><meta property="og:description" content="OGPの説明"><meta property="og:image" content="${IMAGE}">`;
		const fetch = routedFetch({
			[item.url]: () => htmlResponse(html),
			[IMAGE]: () => imageResponse(),
		});
		const result = await fetchThumbnail(item.url, deps(fetch));
		const view = toCardView(item, result);
		expect(view.title).toBe(item.title);
		expect(view.summary).toBe(item.summary);
		expect(view.thumbnailSrc).toBe(STORED);
	});
});

describe("AC-32 並列の取得 (fetchThumbnails)", () => {
	const urls = outputs.items.map((i) => i.url);

	it("全件が応答しない取得 (signal を無視する) でも、全体が timeoutMs の2倍未満で終わり、全件 timeout", async () => {
		const timeoutMs = 150;
		const started = Date.now();
		const results = await fetchThumbnails(urls, deps(hangingIgnoringSignal, { timeoutMs }));
		const elapsed = Date.now() - started;
		expect(results).toHaveLength(6);
		for (const r of results) expect(r).toEqual({ kind: "none", failure: "timeout" });
		expect(elapsed).toBeLessThan(timeoutMs * 2);
	});

	it("全件が応答しない取得 (signal を守る) でも、全体が timeoutMs の2倍未満", async () => {
		const timeoutMs = 150;
		const started = Date.now();
		const results = await fetchThumbnails(urls, deps(hangingHonoringSignal, { timeoutMs }));
		expect(Date.now() - started).toBeLessThan(timeoutMs * 2);
		expect(results.every((r) => r.kind === "none" && r.failure === "timeout")).toBe(true);
	});

	it("1件ずつ順に待たない: 各 fetch が 60ms かかっても、6件の全体は順次(約720ms)より十分に短い", async () => {
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		const fetch: FetchLike = async (input) => {
			await sleep(60);
			return urls.includes(input) ? htmlResponse(HTML_WITH_OG) : imageResponse();
		};
		const started = Date.now();
		const results = await fetchThumbnails(urls, deps(fetch, { timeoutMs: 2000 }));
		expect(Date.now() - started).toBeLessThan(500);
		expect(results.every((r) => r.kind === "thumbnail")).toBe(true);
	});

	it("入力と同じ順で返し、一部が失敗しても reject しない", async () => {
		const a = "https://example.com/a";
		const b = "https://example.com/b";
		const c = "https://example.com/c";
		const fetch = routedFetch({
			[a]: () => htmlResponse(HTML_WITH_OG),
			[b]: () => htmlResponse("gone", 404),
			[c]: () => htmlResponse("<html></html>"),
			[IMAGE]: () => imageResponse(),
		});
		const results = await fetchThumbnails([a, b, c], deps(fetch));
		expect(results).toEqual([
			{ kind: "thumbnail", src: STORED },
			{ kind: "none", failure: "http-error" },
			{ kind: "none", failure: "no-og-image" },
		]);
	});

	it("空の入力は空の配列", async () => {
		await expect(fetchThumbnails([], deps(hangingIgnoringSignal))).resolves.toEqual([]);
	});
});
