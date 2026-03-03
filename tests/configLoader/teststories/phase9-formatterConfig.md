# Test Story — Phase 9 Unit 1 Bolt 1

> 入力コンテキスト: `Phase9/Unit1/Bolt1/design.md` — Correctness Properties P1-P15

---

## Part A: 型定義テスト（types.test.ts）

### Scenario A-1: RiskLabels 型の構造検証
- **Property**: P1（RiskLabels 型正確性）
- **Validates**: US-1

**Given** `RiskLabels` インターフェースが定義されている場合
**When** `{ label: "低（読み取り専用）", short: "低" }` を `RiskLabels` 型の変数に代入すると
**Then** コンパイルが成功し、`label` と `short` の2フィールドが存在すること

---

### Scenario A-2: LanguageLabels 型の構造検証
- **Property**: P2（LanguageLabels 型正確性）
- **Validates**: US-1

**Given** `LanguageLabels` インターフェースが定義されている場合
**When** 9つの必須フィールド（`sectionHeader`, `riskLevel`, `overallRiskLevel`, `target`, `unknownCommand`, `unknownRiskSuffix`, `chainNote`, `chainNoteSuffix`, `risk`）を持つオブジェクトを代入すると
**Then** コンパイルが成功し、全フィールドが適切な型を持つこと

**Given** `LanguageLabels` のオブジェクトが作成された場合
**When** `risk` フィールドにアクセスすると
**Then** `Record<string, RiskLabels>` 型であること（各リスクレベルに `label` と `short` が存在）

---

### Scenario A-3: LayoutGroupId 型の値検証
- **Property**: P3（LayoutGroupId 型正確性）
- **Validates**: US-1

**Given** `LayoutGroupId` 型が定義されている場合
**When** 9つの値（`sectionHeader`, `commandDescription`, `flagDescriptions`, `targetArguments`, `separator`, `riskLevel`, `overallRiskLevel`, `chainNotice`, `operatorDisplay`）のそれぞれを `LayoutGroupId` 型に代入すると
**Then** コンパイルが成功すること

---

### Scenario A-4: FormatterConfig 型の構造検証
- **Property**: P4（FormatterConfig 型正確性）
- **Validates**: US-1

**Given** `FormatterConfig` インターフェースが定義されている場合
**When** `version`, `emoji`, `labels`, `layout` を持つオブジェクトを作成すると
**Then** `emoji` は `risk`, `label`, `operator` の3セクションを持つこと
**And** `labels` は `Record<string, LanguageLabels>` 型であること
**And** `layout` は `commandDelimiter`, `chainNumbering`, 4つの配列, `compactTemplate` を持つこと

---

### Scenario A-5: chainNumbering 型の許可値検証
- **Property**: P5（chainNumbering 型制約）
- **Validates**: US-1

**Given** `FormatterConfig.layout.chainNumbering` の型が5値のリテラルユニオンである場合
**When** `"dot"`, `"circled"`, `"keycap"`, `"dingbat"`, `"none"` のそれぞれを代入すると
**Then** コンパイルが成功すること

---

## Part B: JSON 構造テスト（formatterConfig.test.ts）

### Scenario B-1: emoji セクションの完全性
- **Property**: P6（emoji セクション完全性）
- **Validates**: US-2

**Given** `config/formatter.json` が読み込まれた場合
**When** `emoji.risk` にアクセスすると
**Then** `low`, `medium`, `high`, `critical` の4キーが存在すること
**And** すべての値が非空の文字列であること

**Given** `config/formatter.json` が読み込まれた場合
**When** `emoji.label` にアクセスすると
**Then** `riskLevel`, `chainNote`, `unknownRisk` の3キーが存在すること

**Given** `config/formatter.json` が読み込まれた場合
**When** `emoji.operator` にアクセスすると
**Then** `&&`, `||`, `|`, `;` の4キーが存在すること

---

### Scenario B-2: labels.ja の完全性
- **Property**: P7（labels.ja 完全性）
- **Validates**: US-2

**Given** `config/formatter.json` が読み込まれた場合
**When** `labels.ja` にアクセスすると
**Then** 8つの必須フィールド（`sectionHeader`, `riskLevel`, `overallRiskLevel`, `target`, `unknownCommand`, `unknownRiskSuffix`, `chainNote`, `chainNoteSuffix`）がすべて存在すること
**And** `risk` フィールドに `low`, `medium`, `high`, `critical` の4キーが存在すること
**And** 各 risk の値に `label` と `short` が存在すること

**Given** `labels.ja` の全フィールドがテキスト文字列である場合
**When** 各テキスト値に対して emoji 文字が含まれていないか検査すると
**Then** どのテキスト値にも emoji が含まれていないこと（emoji 分離原則）

---

### Scenario B-3: labels.en の完全性
- **Property**: P8（labels.en 完全性）
- **Validates**: US-2

**Given** `config/formatter.json` が読み込まれた場合
**When** `labels.en` にアクセスすると
**Then** `labels.ja` と同じ構造（8フィールド + risk の4レベル）が存在すること
**And** 各 risk の値に `label` と `short` が存在すること
**And** どのテキスト値にも emoji が含まれていないこと

---

### Scenario B-4: layout セクションの完全性
- **Property**: P9（layout 完全性）
- **Validates**: US-2

**Given** `config/formatter.json` が読み込まれた場合
**When** `layout` にアクセスすると
**Then** `commandDelimiter`, `chainNumbering`, `detailedSingle`, `detailedChainHeader`, `detailedChainSegment`, `detailedChainFooter`, `compactTemplate` の7フィールドが存在すること
**And** `chainNumbering` が `"dot"`, `"circled"`, `"keycap"`, `"dingbat"`, `"none"` のいずれかであること
**And** 4つの配列フィールドの全要素が有効な LayoutGroupId であること

---

## Part C: スキーマテスト（formatterConfig.test.ts）

### Scenario C-1: スキーマの構造検証
- **Property**: P10（スキーマ構造）
- **Validates**: US-3

**Given** `config/formatter.schema.json` が読み込まれた場合
**When** `$schema` フィールドを検査すると
**Then** `"http://json-schema.org/draft-07/schema#"` であること

**Given** `config/formatter.schema.json` が読み込まれた場合
**When** `required` フィールドを検査すると
**Then** `version`, `emoji`, `labels`, `layout` の4項目が含まれること

**Given** `config/formatter.schema.json` が読み込まれた場合
**When** `definitions` フィールドを検査すると
**Then** `LayoutGroupId`, `RiskLabels`, `LanguageLabels` の3定義が存在すること

---

### Scenario C-2: スキーマと JSON の整合性
- **Property**: P11（スキーマ-JSON 整合性）
- **Validates**: US-3

**Given** `formatter.json` の `labels` セクションに言語が追加可能な構造である場合
**When** スキーマの `labels` 定義を検査すると
**Then** `additionalProperties` で `LanguageLabels` を参照していること（言語拡張自由）

**Given** スキーマの `chainNumbering` 定義が enum 制約である場合
**When** 許可値を検査すると
**Then** `["dot", "circled", "keycap", "dingbat", "none"]` の5値であること

**Given** スキーマの `LayoutGroupId` 定義が enum 制約である場合
**When** 許可値を検査すると
**Then** types.ts の `LayoutGroupId` と同じ9値であること

---

## Part D: 値一致テスト（formatterConfig.test.ts）

### Scenario D-1: emoji.risk の値が現行と一致
- **Property**: P12（emoji.risk 値一致）
- **Validates**: US-4

**Given** `config/formatter.json` と `src/formatter.ts` の `RISK_DISPLAY` が存在する場合
**When** 各リスクレベル（low, medium, high, critical）の emoji を比較すると
**Then** `formatter.json` の `emoji.risk[level]` が `RISK_DISPLAY.ja[level].emoji` と完全一致すること
**And** `RISK_DISPLAY.en[level].emoji` とも完全一致すること（ja/en 共通）

---

### Scenario D-2: labels の合成値が現行 LABELS と一致
- **Property**: P13（labels 値一致）
- **Validates**: US-4

**Given** `formatter.json` の `emoji.label` と `labels.ja` が存在する場合
**When** `emoji.label.riskLevel + " " + labels.ja.riskLevel` を合成すると
**Then** 現行 `LABELS.ja.riskLabel`（`"⚠️ リスクレベル:"`）と完全一致すること

**Given** `formatter.json` の `emoji.label` と `labels.ja` が存在する場合
**When** `emoji.label.unknownRisk + " " + labels.ja.unknownRiskSuffix` を合成すると
**Then** 現行 `LABELS.ja.unknownRisk`（`"🔶 中（不明なコマンドのため注意してください）"`）と完全一致すること

**Given** `formatter.json` の `emoji.label` と `labels.ja` が存在する場合
**When** `emoji.label.chainNote + " " + labels.ja.chainNote` を合成すると
**Then** 現行 `LABELS.ja.chainNote`（`"ℹ️ 注意: このコマンドは複数のコマンドが連結されています"`）と完全一致すること

**Given** 英語についても同様の合成を行った場合
**When** 各合成結果を `LABELS.en` の対応する値と比較すると
**Then** すべて完全一致すること

---

### Scenario D-3: risk short の合成値が現行と一致
- **Property**: P14（risk short 合成一致）
- **Validates**: US-4

**Given** `formatter.json` の `emoji.risk` と `labels.ja.risk` が存在する場合
**When** 各リスクレベルで `emoji.risk[level] + " " + labels.ja.risk[level].short` を合成すると
**Then** 現行 `RISK_DISPLAY.ja[level].short` と完全一致すること
  - `"🟢" + " " + "低"` = `"🟢 低"`
  - `"🔶" + " " + "中"` = `"🔶 中"`
  - `"⚠️" + " " + "高"` = `"⚠️ 高"`
  - `"🚨" + " " + "最高"` = `"🚨 最高"`

**Given** 英語についても同様の合成を行った場合
**When** `emoji.risk[level] + " " + labels.en.risk[level].short` を合成すると
**Then** 現行 `RISK_DISPLAY.en[level].short` と完全一致すること

---

### Scenario D-4: operator の値が現行と一致
- **Property**: P15（operator 値一致）
- **Validates**: US-4

**Given** `formatter.json` の `emoji.operator` と `OPERATOR_DISPLAY` が存在する場合
**When** 各演算子（`&&`, `||`, `|`, `;`）の値を比較すると
**Then** `formatter.json` の `emoji.operator[op]` が `OPERATOR_DISPLAY.ja[op]` と完全一致すること
**And** `OPERATOR_DISPLAY.en[op]` とも完全一致すること（ja/en 同一値）
