// 仕様: docs/spec/pbi-008-sticky-header.md#後続PBIへ残す約束 (リンク先の名前は変えない)
// ヘッダーのリンクの href とセクションの id の両方が、ここだけを参照する(名前の文字列を別の場所に書かない)。
export const sectionIds = {
	hobbies: "hobbies",
	activities: "activities",
	communication: "communication",
	thoughts: "thoughts",
} as const;

export type SectionId = (typeof sectionIds)[keyof typeof sectionIds];
