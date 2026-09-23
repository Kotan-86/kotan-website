// 仕様: docs/spec/pbi-003-hero-photo-and-sns-links.md#受入基準 (AC-12)
// SNSリンク4件の唯一の定義元。URLはここ以外に直書きしない
//（本PBIが後続PBIへ残す約束: 「本PBIが後続PBIへ残す約束」節を参照。
// 後続の「コンタクト」セクションからも、この定義を再利用する）。
export type SnsLink = {
	readonly id: "x" | "github" | "qiita" | "note";
	readonly name: string;
	readonly url: string;
};

// 順序: X → GitHub → Qiita → note（仕様「決着済みの質問」Q1、AC-12 の記載順）
export const snsLinks: readonly SnsLink[] = [
	{ id: "x", name: "X", url: "https://x.com/kotan1442" },
	{ id: "github", name: "GitHub", url: "https://github.com/Kotan-86" },
	{ id: "qiita", name: "Qiita", url: "https://qiita.com/Kotan-86" },
	{ id: "note", name: "note", url: "https://note.com/kotan_14" },
];
