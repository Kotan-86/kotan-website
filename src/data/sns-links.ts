// 仕様: docs/spec/pbi-003-hero-photo-and-sns-links.md#受入基準 (AC-12)
//       docs/spec/website.md#ページ構成セクション (ヒーロー・主要SNS 5件)
// SNSリンク5件の唯一の定義元。URLはここ以外に直書きしない
//（本PBIが後続PBIへ残す約束: 「本PBIが後続PBIへ残す約束」節を参照。
// 後続の「コンタクト」セクションからも、この定義を再利用する）。
export type SnsLink = {
  readonly id: "x" | "github" | "qiita" | "note" | "speakerdeck";
  readonly name: string;
  readonly url: string;
};

// 順序: X → GitHub → Qiita → note → Speaker Desk
//（仕様 AC-12・website.md 第1項。Speaker Desk は 2026-09-25 の PO 決定で追加）
export const snsLinks: readonly SnsLink[] = [
  { id: "x", name: "X", url: "https://x.com/kotan1442" },
  { id: "github", name: "GitHub", url: "https://github.com/Kotan-86" },
  { id: "qiita", name: "Qiita", url: "https://qiita.com/Kotan-86" },
  { id: "note", name: "note", url: "https://note.com/kotan_14" },
  {
    id: "speakerdeck",
    name: "Speaker Desk",
    url: "https://speakerdeck.com/kotan86",
  },
];
