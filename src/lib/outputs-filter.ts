// 仕様: docs/spec/pbi-009-outputs-section.md#設計メモ (AC-17, AC-21)
// アウトプットの絞り込みと2列への振り分けの判定(純関数。DOM に触れない)。
import { allFilter } from "../data/outputs";
import type { OutputCategory, OutputFilter } from "../data/outputs";

// 「すべて」なら常に表示、カテゴリのチップなら同じカテゴリだけ表示する(AC-21)
export function isVisible(category: OutputCategory, filter: OutputFilter): boolean {
	return filter === allFilter || category === filter;
}

// 入力の順を保って、表示するものだけを返す(入力は変更しない。AC-21)
export function filterOutputs<T extends { readonly category: OutputCategory }>(
	items: readonly T[],
	filter: OutputFilter,
): T[] {
	return items.filter((item) => isVisible(item.category, filter));
}

// 0始まりの偶数番目(1件目・3件目・5件目)を左、奇数番目を右へ、それぞれ元の順で振り分ける(AC-17)
export function splitIntoColumns<T>(items: readonly T[]): { left: T[]; right: T[] } {
	return {
		left: items.filter((_, index) => index % 2 === 0),
		right: items.filter((_, index) => index % 2 === 1),
	};
}
