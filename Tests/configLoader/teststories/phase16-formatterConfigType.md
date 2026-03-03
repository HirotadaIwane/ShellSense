# Test Story — Phase 16 Unit 2 Bolt 2: configLoader 部分

> 分割元: `Tests/Phase16/Unit2/Bolt2/teststory.md`
> 対象セクション: Property 1-2 (FormatterConfig 型 + configLoader 新形式)

---

## Property 1: FormatterConfig 型の整合性

### Scenario 1.1: 新 FormatterConfig の必須フィールド
- **Property**: 1
- **Validates**: R1.1

**Given** 新形式の emoji.json を読み込んだ config
**When** `getFormatterConfig()` の返り値を検証すると
**Then** `version`, `templates_long`, `templates_short`, `labels` の4フィールドが存在すること

### Scenario 1.2: templates_long の5キー
- **Property**: 1
- **Validates**: R1.2

**Given** 新形式 config の `templates_long`
**When** キーを検証すると
**Then** `singleCommand`, `chainHeader`, `chainSegment`, `chainOperator`, `chainFooter` の5キーが全て文字列型で存在すること

### Scenario 1.3: templates_short の2キー
- **Property**: 1
- **Validates**: R1.3

**Given** 新形式 config の `templates_short`
**When** キーを検証すると
**Then** `singleCommand`, `chainCommand` の2キーが全て文字列型で存在すること

### Scenario 1.4: 旧フィールドの非存在
- **Property**: 1
- **Validates**: R1.4

**Given** 新形式 config
**When** 旧フィールドを検証すると
**Then** `emoji`, `layout` プロパティが存在しないこと

---

## Property 2: configLoader の新形式読み込み

### Scenario 2.1: labels の言語キー
- **Property**: 2
- **Validates**: R2.1, R2.2

**Given** `setFormatterConfig()` で新形式 config を設定
**When** `getFormatterConfig().labels["ja"]` を参照すると
**Then** `header`, `risk_low`, `delimiter`, `indent` 等の TemplateLabels キーが存在すること

### Scenario 2.2: setFormatterConfig / getFormatterConfig
- **Property**: 2
- **Validates**: R2.4

**Given** `setFormatterConfig()` で新形式 config を設定
**When** `getFormatterConfig()` を呼び出すと
**Then** 設定した config がそのまま返ること
