// 仕様: docs/spec/pbi-009-outputs-section.md#設計メモ-pbi-009 (AC-27, AC-28, D-5)
// Vitest の設定。Astro の getViteConfig は使わない(純関数のユニットテストだけ)。グローバルは使わない。
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["src/**/*.test.ts"],
	},
});
