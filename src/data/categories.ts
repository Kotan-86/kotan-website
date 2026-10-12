// 仕様: docs/spec/pbi-010-category-pages.md#共有IF (カテゴリの定義、サイト名の定義は1か所: AC-7, AC-8)
// サイト名とカテゴリ(名前・並び・ページのパス・アイコン)の唯一の定義元。
// ヘッダー、各ページ、ページの題名は、ここだけを参照する(文言・パスを別の場所に書かない)。
export const siteName = "こーたんプロフィールサイト";

// "career" は内部の識別子。`career/` のページは作らない(経歴はトップ)。
export type CategoryId = "career" | "now" | "past" | "future" | "daily";

export interface Category {
	readonly id: CategoryId;
	readonly label: string;
	// base を除くパス(末尾スラッシュ付き。経歴は空)。
	readonly path: "" | "now/" | "past/" | "future/" | "daily/";
	// astro-icon の完全名。
	readonly icon: string;
}

export const categories: readonly Category[] = [
	{ id: "career", label: "経歴", path: "", icon: "material-symbols-light:badge-outline" },
	{ id: "now", label: "いま", path: "now/", icon: "material-symbols-light:today-outline" },
	{ id: "past", label: "これまで", path: "past/", icon: "material-symbols-light:history" },
	{ id: "future", label: "これから", path: "future/", icon: "material-symbols-light:trending-up" },
	{ id: "daily", label: "日常", path: "daily/", icon: "material-symbols-light:interests-outline" },
];

export function getCategory(id: CategoryId): Category {
	const category = categories.find((c) => c.id === id);
	if (category === undefined) {
		throw new Error(`unknown category: ${id}`);
	}
	return category;
}

// base は呼び出し側が import.meta.env.BASE_URL を渡す(base を直書きしない: PBI-001)。
// 末尾スラッシュが無い base は、スラッシュを補って連結する。
export function categoryHref(category: Category, base: string): string {
	const normalizedBase = base.endsWith("/") ? base : `${base}/`;
	return `${normalizedBase}${category.path}`;
}

// 経歴(トップ)はサイト名のみ、他は「<カテゴリ名> | <サイト名>」(AC-7)。
export function categoryPageTitle(category: Category): string {
	return category.id === "career" ? siteName : `${category.label} | ${siteName}`;
}
