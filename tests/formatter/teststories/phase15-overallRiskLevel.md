# Test Story — Phase 15 Unit 2 Bolt 1

> 入力コンテキスト: `Phase15_NotificationBugFix/Unit2/Bolt1/design.md` (Correctness Properties + Testing Strategy)

---

## Scenario 1: overallRiskLevel 独自プレフィックス使用

- **Property**: 1（overallRiskLevel 独自プレフィックス）
- **Validates**: R1.1

**Given** `emoji.label.overallRiskLevel` が `"🔷"` に設定されており、
AND `emoji.label.riskLevel` が `"⚠️"` に設定されている場合、
**When** チェーンコマンド `ls && pwd` の detailed 出力を生成すると、
**Then** `overallRiskLevel` 行に `"🔷"` が含まれる。
AND `overallRiskLevel` 行に `"⚠️"` が含まれない。

---

## Scenario 2: overallRiskLevel 未設定時のフォールバック

- **Property**: 2（overallRiskLevel フォールバック）
- **Validates**: R1.2

**Given** `emoji.label.overallRiskLevel` が未設定（キーなし）であり、
AND `emoji.label.riskLevel` が `"⚠️"` に設定されている場合、
**When** チェーンコマンド `ls && pwd` の detailed 出力を生成すると、
**Then** `overallRiskLevel` 行に `"⚠️"` が含まれる（フォールバック）。

---

## Scenario 3: riskLevel 行は overallRiskLevel に影響されない

- **Property**: 3（riskLevel 非干渉）
- **Validates**: R1.3

**Given** `emoji.label.overallRiskLevel` が `"🔷"` に設定されており、
AND `emoji.label.riskLevel` が `"⚠️"` に設定されている場合、
**When** 単一コマンド `ls` の detailed 出力を生成すると、
**Then** `riskLevel` 行に `"⚠️"` が含まれる。
AND `riskLevel` 行に `"🔷"` が含まれない。

---

## Scenario 4: 未知コマンドがレイアウト配列に従う

- **Property**: 4（未知コマンドのレイアウト配列準拠）
- **Validates**: R2.1

**Given** 辞書に未登録のコマンド `zzz_unknown_cmd` が入力された場合、
**When** デフォルトの `detailedSingle` レイアウトで detailed 出力を生成すると、
**Then** `sectionHeader`、`riskLevel`、`commandDescription` 等がレイアウト配列の順序で出力される。

---

## Scenario 5: 未知コマンドでレイアウト順序変更が反映される

- **Property**: 4（未知コマンドのレイアウト配列準拠）
- **Validates**: R2.2

**Given** `detailedSingle` のレイアウト配列を `["riskLevel", "sectionHeader", "commandDescription", "separator"]` に変更した場合、
AND 未知コマンド `zzz_unknown_cmd` が入力された場合、
**When** detailed 出力を生成すると、
**Then** リスク行が `sectionHeader` よりも前に出力される。

---

## Scenario 6: 未知コマンドでデータ不在グループがスキップされる

- **Property**: 5（未知コマンドの安全な空出力）
- **Validates**: R2.3

**Given** `detailedSingle` のレイアウト配列に `flagDescriptions` と `targetArguments` が含まれている場合、
AND 未知コマンド `zzz_unknown_cmd`（引数・フラグなし）が入力された場合、
**When** detailed 出力を生成すると、
**Then** エラーなく出力が完了する。
AND `flagDescriptions` 行は出力に含まれない。

---

## Scenario 7: 既知コマンドの出力が変わらない

- **Property**: 6（既知コマンドの出力不変）
- **Validates**: R2.5

**Given** 辞書に登録済みのコマンド `ls -la /tmp` が入力された場合、
**When** detailed 出力を生成すると、
**Then** 出力は B4 修正前と同一のレイアウト配列を使用する。
AND `sectionHeader`、`riskLevel`、`commandDescription`、`flagDescriptions` の順序が維持される。
