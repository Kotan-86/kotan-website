// 仕様: docs/spec/pbi-007-thoughts-future.md#カード本文の文言確定文言 (AC-6, AC-10)
// いま考えていること・これから(見出し1つ・カード3件。各カードはタイトルと本文)の唯一の定義元。
// 文言は仕様の確定文言を1文字も変えずに、1つの文字列として定義する(連結・分割で組み立てない)。
// カード2の「？」は全角(U+FF1F)で、その直後は全角空白(U+3000)1つ。
// マークアップ側(ThoughtsSection.astro)には文言を直書きしない。
export type ThoughtCard = {
	readonly title: string;
	readonly body: string;
};

export type ThoughtsContent = {
	readonly heading: string;
	readonly cards: readonly [ThoughtCard, ThoughtCard, ThoughtCard];
};

export const thoughts: ThoughtsContent = {
	heading: "いま考えていること・これから",
	cards: [
		{
			title: "入社後にやってみたいこと",
			body: "入社したら、仕事部屋を整備するところから始めてみたいです。スポーツ自転車はまだ買っていないので、入社後にお金を貯めて買いたいと思っています。買えたら、スポーツ自転車で小旅行するほか、通勤もしてみたいです。",
		},
		{
			title: "いま気になっていること",
			body: "職場の雰囲気ってどんなものだろう？　スキルアップ、ちゃんとできるのだろうか？　入社後、どう楽しみながら仕事をしていくかが気になっています。",
		},
		{
			title: "同期と一緒にやってみたいこと",
			body: "たまには、一緒にランチしたいです。そのときに、入社後のことや、お互いがいま考えていることを話せたら嬉しいです。",
		},
	],
};
