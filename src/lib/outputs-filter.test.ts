// 仕様: docs/spec/pbi-009-outputs-section.md#受入基準 (AC-21, AC-17)
import { describe, expect, it } from "vitest";
import { allFilter, outputCategories, outputFilters, outputs } from "../data/outputs";
import { filterOutputs, isVisible, splitIntoColumns } from "./outputs-filter";

const titles = (items: readonly { title: string }[]) => items.map((i) => i.title);

describe("AC-21 絞り込みの判定 (isVisible)", () => {
	it("「すべて」ではどのカテゴリも表示される", () => {
		for (const category of outputCategories) {
			expect(isVisible(category, allFilter)).toBe(true);
		}
	});

	it("カテゴリのチップでは、同じカテゴリだけ表示される", () => {
		for (const filter of outputCategories) {
			for (const category of outputCategories) {
				expect(isVisible(category, filter)).toBe(category === filter);
			}
		}
	});
});

describe("AC-21 絞り込み (filterOutputs)", () => {
	it("「すべて」で6件が確定表の順のまま", () => {
		const result = filterOutputs(outputs.items, allFilter);
		expect(titles(result)).toEqual(titles(outputs.items));
		expect(result).toHaveLength(6);
	});

	it("「登壇」で3件(ScrumFestSendai2024, AgilePBL祭り2024, RSGT2023)が確定表の順", () => {
		expect(titles(filterOutputs(outputs.items, "登壇"))).toEqual([
			"ScrumFestSendai2024",
			"AgilePBL祭り2024",
			"RSGT2023",
		]);
	});

	it("「ブログ」で2件、確定表の順", () => {
		const result = filterOutputs(outputs.items, "ブログ");
		expect(titles(result)).toEqual([
			"アジャイル開発を完全に理解したチームのお話",
			"AI開発チームを設計する ― 役割分担・権限分離・コンテキスト設計",
		]);
	});

	it("「ピッチコンテスト」で1件(技育展2024)", () => {
		expect(titles(filterOutputs(outputs.items, "ピッチコンテスト"))).toEqual(["技育展2024"]);
	});

	it("チップの全フィルターで、結果が入力の部分列 (順を保つ) になる", () => {
		for (const filter of outputFilters) {
			const result = filterOutputs(outputs.items, filter);
			const indexes = result.map((r) => outputs.items.indexOf(r));
			expect(indexes).toEqual([...indexes].sort((x, y) => x - y));
			expect(result.every((r) => isVisible(r.category, filter))).toBe(true);
		}
	});

	it("入力を変更しない", () => {
		const input = [...outputs.items];
		filterOutputs(input, "登壇");
		expect(input).toEqual([...outputs.items]);
	});

	it("該当が無ければ空の配列", () => {
		expect(filterOutputs([{ category: "登壇" as const }], "ブログ")).toEqual([]);
	});
});

describe("AC-17/AC-21 2列への振り分け (splitIntoColumns)", () => {
	it("6件: 1・3・5件目が左、2・4・6件目が右 (各列は元の順)", () => {
		const { left, right } = splitIntoColumns([1, 2, 3, 4, 5, 6]);
		expect(left).toEqual([1, 3, 5]);
		expect(right).toEqual([2, 4, 6]);
	});

	it("奇数件: 左が1件多い", () => {
		expect(splitIntoColumns(["a", "b", "c"])).toEqual({ left: ["a", "c"], right: ["b"] });
	});

	it("1件: 左だけ。0件: 両方空", () => {
		expect(splitIntoColumns(["a"])).toEqual({ left: ["a"], right: [] });
		expect(splitIntoColumns([])).toEqual({ left: [], right: [] });
	});

	it("絞り込み後の表示中のカードで振り分ける (「登壇」なら 1件目と3件目が左、2件目が右)", () => {
		const { left, right } = splitIntoColumns(filterOutputs(outputs.items, "登壇"));
		expect(titles(left)).toEqual(["ScrumFestSendai2024", "RSGT2023"]);
		expect(titles(right)).toEqual(["AgilePBL祭り2024"]);
	});

	it("6件のときの文書の順 (左の列 -> 右の列) は 1,3,5,2,4,6", () => {
		const { left, right } = splitIntoColumns([1, 2, 3, 4, 5, 6]);
		expect([...left, ...right]).toEqual([1, 3, 5, 2, 4, 6]);
	});
});
