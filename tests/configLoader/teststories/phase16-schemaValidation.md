# Test Story — Phase 16 Unit 2 Bolt 1

> 入力コンテキスト: `Phase16_JsonStructureImprove/Unit2/Bolt1/design.md` (Correctness Properties + Testing Strategy)

---

## Scenario 1: StyleFile 必須フィールド

- **Property**: 1（StyleFile スキーマ構造）
- **Validates**: R1.1

**Given** `config/formatter.schema.json` を読み込んだ場合、
**When** `definitions.StyleFile.required` を参照すると、
**Then** `["version", "templates_long", "templates_short", "labels"]` が含まれること。

---

## Scenario 2: templates_long 必須キー

- **Property**: 1（StyleFile スキーマ構造）
- **Validates**: R1.2

**Given** `definitions.StyleFile` の `templates_long` プロパティ定義を参照した場合、
**When** `required` を確認すると、
**Then** `singleCommand`, `chainHeader`, `chainSegment`, `chainOperator`, `chainFooter` が含まれること。

---

## Scenario 3: templates_short 必須キー

- **Property**: 1（StyleFile スキーマ構造）
- **Validates**: R1.3

**Given** `definitions.StyleFile` の `templates_short` プロパティ定義を参照した場合、
**When** `required` を確認すると、
**Then** `singleCommand`, `chainCommand` が含まれること。

---

## Scenario 4: TemplateLabels 必須キー

- **Property**: 2（TemplateLabels スキーマ構造）
- **Validates**: R1.4

**Given** `definitions.TemplateLabels` を参照した場合、
**When** `required` を確認すると、
**Then** 18個の必須キーが全て含まれること:
`header`, `risk_low`, `risk_low_short`, `risk_medium`, `risk_medium_short`,
`risk_high`, `risk_high_short`, `risk_critical`, `risk_critical_short`,
`unknownRisk`, `unknownRisk_short`, `unknownCommand`,
`target`, `delimiter`, `indent`, `chainNotice`, `chainNumbering`, `sudoNotice`
AND `additionalProperties` が `{ "type": "string" }` であること。

---

## Scenario 5: labels の $ref

- **Property**: 1（StyleFile スキーマ構造）
- **Validates**: R1.5

**Given** `definitions.StyleFile` の `labels` プロパティ定義を参照した場合、
**When** `additionalProperties` を確認すると、
**Then** `{ "$ref": "#/definitions/TemplateLabels" }` であること。

---

## Scenario 6: 旧定義の残存

- **Property**: 3（旧定義の残存）
- **Validates**: R1.6

**Given** `config/formatter.schema.json` を読み込んだ場合、
**When** `definitions` を確認すると、
**Then** `LanguageLabels`, `RiskLabels`, `LayoutGroupId` が存在すること。

---

## Scenario 7: プリセットJSON構造（4プリセット共通）

- **Property**: 4（プリセットJSON構造）
- **Validates**: R2.1, R2.2, R2.3, R2.4

**Given** 4つのプリセット JSON（emoji, ascii, minimal, pro）をそれぞれ読み込んだ場合、
**When** トップレベルキーを確認すると、
**Then** `version` が `"2.0.0"` であること
AND `templates_long`, `templates_short`, `labels` が存在すること
AND `emoji`, `layout` が存在しないこと。

---

## Scenario 8: ラベル値の移行正確性（emoji.json）

- **Property**: 5（ラベル値の移行正確性）
- **Validates**: R2.5

**Given** `config/styles/emoji.json` を読み込んだ場合、
**When** `labels.ja.risk_low` を確認すると、
**Then** `"🟢 低（読み取り専用）"` であること（旧 emoji.risk.low + labels.risk.low.label の結合）。
AND `labels.ja.risk_low_short` が `"🟢 低"` であること。
AND `labels.ja.unknownRisk` が `"🔶 中（不明なコマンドのため注意してください）"` であること。

---

## Scenario 9: ラベル値の移行正確性（minimal.json — emoji空文字）

- **Property**: 5（ラベル値の移行正確性）
- **Validates**: R2.5

**Given** `config/styles/minimal.json` を読み込んだ場合、
**When** `labels.ja.risk_low` を確認すると、
**Then** `"低（読み取り専用）"` であること（emoji空文字のためテキストのみ）。

---

## Scenario 10: テンプレート値の移行正確性

- **Property**: 6（テンプレート値の移行正確性）
- **Validates**: R2.6

**Given** 4つのプリセットの `templates_long.singleCommand` を確認した場合、
**When** テンプレート内のプレースホルダー順序を解析すると、
**Then** 旧 `layout.detailedSingle` 配列と等価な行構造であること:
`{header}`, `{command}`, `{flags}`, `{target}`, `{sudo}`, `{separator}`, `{risk}` の順。

---

## Scenario 11: TemplateLabels 必須キーの存在（全プリセット）

- **Property**: 7（スキーマ適合）
- **Validates**: R2.7

**Given** 4つのプリセットの `labels.ja` を確認した場合、
**When** 18個の必須ラベルキーの存在を確認すると、
**Then** 全て `string` 型で存在すること。

---

## Scenario 12: operator_* キーの存在（全プリセット）

- **Property**: 7（スキーマ適合）
- **Validates**: R2.7

**Given** 4つのプリセットの `labels.ja` を確認した場合、
**When** `operator_` プレフィックスのキーを確認すると、
**Then** `operator_&&`, `operator_||`, `operator_|`, `operator_;` が存在すること。
