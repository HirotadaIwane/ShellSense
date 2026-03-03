# Test Story — Phase 10 / Unit 1 / Bolt 1

> 入力コンテキスト: `Phase10/Unit1/Bolt1/design.md` (Correctness Properties P1-P8)

---

## Scenario 1: emoji.json が現行 formatter.json と値一致（P1）

- **Property**: P1（emoji.json 値一致）
- **Validates**: US-1

**Given** `config/styles/emoji.json` と現行 `config/formatter.json`（Phase 9 時点の FormatterConfig）が存在する場合
**When** 両ファイルを JSON として読み込み、`version`, `emoji`, `labels`, `layout` を比較すると
**Then** 全ての値が完全に一致すること

---

## Scenario 2: minimal.json の絵文字除去（P2）

- **Property**: P2（minimal 絵文字除去）
- **Validates**: US-2

**Given** `config/styles/minimal.json` を読み込んだ場合
**When** `emoji.risk` の各値（low, medium, high, critical）を検査すると
**Then** 全て空文字 `""` であること

**Given** `config/styles/minimal.json` を読み込んだ場合
**When** `emoji.label` の各値（riskLevel, chainNote, unknownRisk）を検査すると
**Then** 全て空文字 `""` であること

**Given** `config/styles/minimal.json` を読み込んだ場合
**When** `emoji.operator` の各値を検査すると
**Then** `&&` が `"-->>"`, `||` が `"--X>"`, `|` が `"--|>"`, `;` が `"--->"` であること

**Given** `config/styles/minimal.json` を読み込んだ場合
**When** `labels.ja.sectionHeader` と `labels.en.sectionHeader` を検査すると
**Then** 両方 `"---"` であること

**Given** `config/styles/minimal.json` を読み込んだ場合
**When** `layout.commandDelimiter` を検査すると
**Then** `" -- "` であること

---

## Scenario 3: ascii.json の ASCII 限定（P3）

- **Property**: P3（ascii ASCII 限定）
- **Validates**: US-2

**Given** `config/styles/ascii.json` を読み込んだ場合
**When** `emoji.risk` の各値を検査すると
**Then** `low` が `"[OK]"`, `medium` が `"[?]"`, `high` が `"[!]"`, `critical` が `"[!!]"` であること

**Given** `config/styles/ascii.json` を読み込んだ場合
**When** `emoji.label` の各値を検査すると
**Then** `riskLevel` が `"[!]"`, `chainNote` が `"[i]"`, `unknownRisk` が `"[?]"` であること

**Given** `config/styles/ascii.json` を読み込んだ場合
**When** `labels.ja.sectionHeader` と `labels.en.sectionHeader` を検査すると
**Then** 両方 `"==="` であること

**Given** `config/styles/ascii.json` の全文字列値を再帰的に収集した場合
**When** 各文字の Unicode コードポイントを検査すると
**Then** 全て U+007F 以下（ASCII 範囲内）であること

---

## Scenario 4: pro.json の短縮ラベル（P4）

- **Property**: P4（pro 短縮ラベル）
- **Validates**: US-2

**Given** `config/styles/pro.json` を読み込んだ場合
**When** `labels.ja.risk` と `labels.en.risk` の各 `label` 値を検査すると
**Then** 括弧 `(` や `（` を含まないこと（短縮形）

**Given** `config/styles/pro.json` を読み込んだ場合
**When** `layout.compactTemplate` を検査すると
**Then** `"{riskShort} {commands}"` であること

---

## Scenario 5: formatter.json メタ設定構造（P5）

- **Property**: P5（メタ設定構造）
- **Validates**: US-3

**Given** `config/formatter.json` を読み込んだ場合
**When** トップレベルのキーを検査すると
**Then** `style` が `"emoji"` であること
**AND** `overrides` が空オブジェクト `{}` であること
**AND** `version`, `emoji`, `labels`, `layout` キーが存在しないこと

---

## Scenario 6: スキーマ二面化（P6）

- **Property**: P6（スキーマ二面化）
- **Validates**: US-4

**Given** `config/formatter.schema.json` を読み込んだ場合
**When** トップレベルの `required` を検査すると
**Then** `["style"]` を含むこと

**Given** `config/formatter.schema.json` を読み込んだ場合
**When** `definitions.StyleFile` を検査すると
**Then** `required` に `"version"`, `"emoji"`, `"labels"`, `"layout"` を含むこと

**Given** `config/formatter.schema.json` を読み込んだ場合
**When** `definitions` のキーを検査すると
**Then** `LayoutGroupId`, `RiskLabels`, `LanguageLabels` が存在すること（既存定義の維持）

---

## Scenario 7: 4 ファイルの構造的一貫性（P7）

- **Property**: P7（構造的一貫性）
- **Validates**: US-5

**Given** 4 つのスタイル JSON（emoji, minimal, ascii, pro）を読み込んだ場合
**When** 各ファイルのトップレベルキーを検査すると
**Then** 全てが `version`, `emoji`, `labels`, `layout` を含むこと

**Given** 4 つのスタイル JSON を読み込んだ場合
**When** 各ファイルの `emoji` オブジェクトを検査すると
**Then** 全てが `risk`（low, medium, high, critical）, `label`（riskLevel, chainNote, unknownRisk）, `operator`（&&, ||, |, ;）を含むこと

**Given** 4 つのスタイル JSON を読み込んだ場合
**When** 各ファイルの `labels` オブジェクトを検査すると
**Then** 全てが `ja` と `en` キーを含み、各言語が LanguageLabels の全フィールドを含むこと

---

## Scenario 8: 後方互換（P8）

- **Property**: P8（後方互換）
- **Validates**: —

**Given** Bolt 1 の変更が config ファイルのみである場合
**When** `npm test` を実行すると
**Then** 既存 898 テストが全て通過すること（configLoader.ts 変更なし → 出力不変）
