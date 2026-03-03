# Test Story — Phase 10 / Unit 1 / Bolt 2

> 入力コンテキスト: `Phase10/Unit1/Bolt2/design.md`（P1-P9）

---

## Part A: 合成ヘルパー空 emoji テスト

### Scenario A-1: composeRiskFull 空 emoji（P1）

**Given** `emoji.risk[level]` が全て空文字 `""` の FormatterConfig が設定された場合
**When** `composeRiskFull(config, RiskLevel.High, "ja")` を呼ぶと
**Then** 戻り値が `"高（削除・上書きを含む）"` であること（先頭スペースなし）

**Given** 全 4 リスクレベル × 2 言語で空 emoji config を使用する場合
**When** `composeRiskFull` を呼ぶと
**Then** 各戻り値が `labels.risk[level].label` のみであり、先頭にスペースがないこと

### Scenario A-2: composeRiskShort 空 emoji（P2）

**Given** `emoji.risk[level]` が全て空文字 `""` の FormatterConfig が設定された場合
**When** `composeRiskShort(config, RiskLevel.High, "ja")` を呼ぶと
**Then** 戻り値が `"高"` であること（先頭スペースなし）

**Given** 全 4 リスクレベル × 2 言語で空 emoji config を使用する場合
**When** `composeRiskShort` を呼ぶと
**Then** 各戻り値が `labels.risk[level].short` のみであり、先頭にスペースがないこと

### Scenario A-3: composeUnknownRisk 空 emoji（P3）

**Given** `emoji.label.unknownRisk` が空文字 `""` の FormatterConfig が設定された場合
**When** `composeUnknownRisk(config, "ja")` を呼ぶと
**Then** 戻り値が `"中（不明なコマンドのため注意してください）"` であること（先頭スペースなし）

### Scenario A-4: 合成ヘルパー非空 emoji 不変（P4）

**Given** emoji スタイル（全 emoji 値が非空文字）の FormatterConfig が設定された場合
**When** `composeRiskFull`, `composeRiskShort`, `composeUnknownRisk` を呼ぶと
**Then** 各戻り値が `${emoji} ${text}` 形式で既存の出力と完全同一であること

---

## Part B: renderGroup 経由の統合テスト

### Scenario B-1: riskLevel 空 emoji prefix（P5）

**Given** `emoji.label.riskLevel` が空文字 `""` かつ `emoji.risk[level]` も空文字の minimal スタイル config で
**When** `formatExplanation` を detailed single モードで `ls` コマンドに対して呼ぶと
**Then** riskLevel 行が `"リスクレベル: 低（読み取り専用）"` であること（先頭スペースなし）

### Scenario B-2: overallRiskLevel 空 emoji prefix（P6）

**Given** `emoji.label.riskLevel` が空文字 `""` の minimal スタイル config で
**When** `formatExplanation` を detailed chain モードで呼ぶと
**Then** overallRiskLevel 行が `"総合リスクレベル: 低（読み取り専用）"` であること（先頭スペースなし）

### Scenario B-3: chainNotice 空 emoji prefix（P7）

**Given** `emoji.label.chainNote` が空文字 `""` の minimal スタイル config で
**When** `formatExplanation` を detailed single モードでチェーンコマンドに対して呼ぶと
**Then** chainNotice 行が `"注意: このコマンドは複数のコマンドが連結されています"` で始まること（先頭スペースなし）

### Scenario B-4: renderGroup 非空 emoji prefix 不変（P8）

**Given** emoji スタイル（全 emoji 値が非空文字）の FormatterConfig が設定された場合
**When** `formatExplanation` を呼ぶと
**Then** riskLevel / overallRiskLevel / chainNotice 行が `${emoji} ${text}` 形式で既存の出力と完全同一

### Scenario B-5: 既存テスト全パス（P9）

**Given** emoji スタイルがデフォルトの場合
**When** 全テストスイートを実行すると
**Then** 既存テストが全て通過すること
