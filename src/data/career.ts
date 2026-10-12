// 仕様: docs/spec/pbi-011-career-section.md#受入基準 (AC-4, AC-6)
// 経歴のセクションの文言の唯一の定義元。CareerSection.astro は、ここだけを参照する(直書きしない)。
// セクションの見出し「経歴」はカテゴリ名の定義(categories.ts)を参照するため、ここには持たない。
// 項目は1件固定。将来増やすときは上が新しい順とする。
// 社名は1か所だけに定義する。実名への差し替え(正社員入社後の別PBI)は、この1か所の変更で済む。
export const careerCompanyName = "株式会社L";

export type CareerEntry = {
	readonly period: string;
	readonly role: string;
	readonly organization: string;
	readonly body: string;
};

export type CareerContent = {
	readonly intro: string;
	readonly entries: readonly [CareerEntry];
};

export const career: CareerContent = {
	intro: `2026年に${careerCompanyName}に内定者インターンとして参画。`,
	entries: [
		{
			period: "2026/10/01 - 現在",
			role: "エンジニア",
			organization: careerCompanyName,
			body: "生成AI基盤の整備などに従事。",
		},
	],
};
