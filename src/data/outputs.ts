// 仕様: docs/spec/pbi-009-outputs-section.md#表示する文言の確定表 (AC-3, AC-4, AC-5)
// アウトプット(見出し1つ・6件。各件は URL・カテゴリ・題名・補足)の唯一の定義元。
// 並びがそのまま表示の順(確定表の順 = issue #5 の記載順)になる。
// 題名・補足・URL は確定表を1文字も変えずに、1つの文字列として定義する(連結・分割で組み立てない)。
// 補足は外側の括弧「」を含まない(D-4。補足の中の括弧は原文のまま)。
// マークアップ側(OutputsSection.astro / OutputCard.astro)には文言を直書きしない。
export const outputCategories = ["登壇", "ブログ", "ピッチコンテスト"] as const;

export type OutputCategory = (typeof outputCategories)[number];

export const allFilter = "すべて";

export type OutputFilter = typeof allFilter | OutputCategory;

// チップの表示文字列と順(AC-2)
export const outputFilters: readonly OutputFilter[] = [allFilter, ...outputCategories];

export type OutputItem = {
	readonly url: string;
	readonly category: OutputCategory;
	readonly title: string;
	readonly summary: string;
};

export type OutputsContent = {
	readonly heading: string;
	readonly items: readonly OutputItem[];
};

export const outputs: OutputsContent = {
	heading: "アウトプット",
	items: [
		{
			url: "https://speakerdeck.com/kotan86/keiken-shugi-to-shikou-de-gakuensai-unei-chimu-o-shiawase-ni-shitata",
			category: "登壇",
			title: "ScrumFestSendai2024",
			summary: "アジャイル開発のプラクティスを応用して学園祭本部を運営した話",
		},
		{
			url: "https://speakerdeck.com/kotan86/toujisha-ga-toujisha-kaihatsu-o-u-koto-no-tsuyomi",
			category: "登壇",
			title: "AgilePBL祭り2024",
			summary: "当事者自らが主体的に開発をするとどうなるかという話",
		},
		{
			url: "https://speakerdeck.com/hayato_ukuk/ting-jue-zhang-hai-noaruda-xue-sheng-timuniyoruyi-sanaifa-yan-huan-jing-noxing-cheng",
			category: "登壇",
			title: "RSGT2023",
			summary: "初めてのアジャイル開発演習で学んだことはたったの2つ。それでも大きな2つだったという話",
		},
		{
			url: "https://speakerdeck.com/kotan86/sekoe-waza-ikuten-2024-2-kaisen-purezen-shiryou",
			category: "ピッチコンテスト",
			title: "技育展2024",
			summary: "我々にとって『あったらいいな』を我々で作ったプロダクトを実際にプレゼンしてみた",
		},
		{
			url: "https://note.com/kotan_14/n/nca96840db785",
			category: "ブログ",
			title: "アジャイル開発を完全に理解したチームのお話",
			summary: "大学時代の同期3人と一緒にアジャイル開発手法を「完全に理解した」と思い込んで臨んだチーム開発の体験記",
		},
		{
			url: "https://qiita.com/Kotan-86/items/ccc5b6681aa940504aad",
			category: "ブログ",
			title: "AI開発チームを設計する ― 役割分担・権限分離・コンテキスト設計",
			summary: "AI開発チームをどのように作れば品質と実装スピードの両立が可能なのかを試した話",
		},
	],
};
