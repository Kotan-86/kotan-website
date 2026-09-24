// 仕様: docs/spec/pbi-006-hobbies-daily.md#受入基準 (AC-6, AC-7)
// 趣味・日常(見出し1つ・項目4件。各項目は項目名と説明文)の唯一の定義元。
// 文言は「前提」節の issue の表記を「｜」の前後で分けたもので、1文字も変えない(句点を足さない。AC-6)。
// 「｜」は区切りの記法で、どのフィールドにも含めない(決定 Q1)。
// マークアップ側(HobbiesSection.astro)には文言を直書きしない。
export type Hobby = {
	readonly name: string;
	readonly description: string;
};

export type HobbiesContent = {
	readonly heading: string;
	readonly hobbies: readonly [Hobby, Hobby, Hobby, Hobby];
};

export const hobbies: HobbiesContent = {
	heading: "趣味・日常",
	hobbies: [
		{
			name: "スポーツ観戦",
			description: "戦術分析で「なぜこのプレーなのか」を理解しながら見ています",
		},
		{
			name: "印象派展",
			description: "当時の作者が感じたことを想像しながらゆっくり観覧します",
		},
		{
			name: "のんびり旅",
			description: "自然やゆっくりできる場所に行って、景色などを楽しむことが多いです",
		},
		{
			name: "読書",
			description: "技術書やビジネス教養書などを読んで、試してみることが多いです",
		},
	],
};
