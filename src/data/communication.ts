// 仕様: docs/spec/pbi-004-communication-section.md#受入基準 (AC-16)
// コミュニケーション節(見出し4つ・本文9項目)の唯一の定義元。
// 文言は「前提」節の確定文言と1文字も変えない(全角の「％」を含む。半角%への置換禁止。AC-6)。
// マークアップ側(CommunicationSection.astro)には文言を直書きしない。
export type CommunicationSubsection = {
	readonly heading: string;
	readonly items: readonly [string, string, string];
};

export type CommunicationContent = {
	readonly heading: string;
	readonly subsections: readonly [
		CommunicationSubsection,
		CommunicationSubsection,
		CommunicationSubsection,
	];
};

export const communication: CommunicationContent = {
	heading: "僕のコミュニケーション方法",
	subsections: [
		{
			heading: "目に見えるコミュニケーション手段を使っています",
			items: [
				"第一言語は日本語で、目で見て伝えられる「日本語対応手話」を日常のコミュニケーションで一番よく使っています",
				"音声の内容は、発話者のマイクと音声認識をつないで文字化し、精度98％以上ならスムーズに理解できます",
				"自分から発言するときは、手話のほかテキスト入力からの音声読み上げも、相手や場面に応じて使い分けています",
			],
		},
		{
			heading: "音声中心の環境では、こういうつまずきが起こりやすいです",
			items: [
				"文字起こしには数秒の遅れがあるため、内容を読んで発言したいと思った頃には話題が次へ進んでいることがあります",
				"複数人の会話では「誰が誰に何を話しているか」の把握に脳のリソースを使い、発言のタイミングを逃しやすくなります",
				"文字起こし精度が95％未満になると、前後の文脈から内容を推測しながら読む必要があり、理解に負荷がかかります",
			],
		},
		{
			heading: "こうしてもらえると、お互い関わりやすいです",
			items: [
				"一人ずつ話し、話し始めに手を挙げるなど、誰が話しているか目で分かるようにしてもらえると会話へ参加しやすいです",
				"セミナーや説明の場では、発話者のマイクと音声認識をつなぎ、精度98％以上の文字起こしがあると理解しやすいです",
				"交流や議論では手話通訳が理想ですが、難しい場合も文字起こしや話者交代など、使える方法を一緒に相談できると嬉しいです",
			],
		},
	],
};
