# Test Story — Phase 9 Unit 2 Bolt 1

> 入力コンテキスト: `Phase9/Unit2/Bolt1/design.md` — Correctness Properties P1-P12

---

## Part A: 合成ヘルパーテスト（composeHelpers.test.ts）

### Scenario A-1: composeRiskFull の正確性
- **Property**: P1（composeRiskFull 正確性）
- **Validates**: US-1, AC-1.1, AC-1.4

**Given** デフォルト config が読み込まれている場合
**When** `composeRiskFull(config, RiskLevel.Low, "ja")` を呼び出すと
**Then** `"🟢 低（読み取り専用）"` を返すこと（現行 `RISK_DISPLAY.ja.low.emoji + " " + label` と一致）

**Given** 全4リスクレベル × 2言語（ja/en）の組み合わせで呼び出した場合
**When** 各結果を現行 `RISK_DISPLAY[lang][level].emoji + " " + RISK_DISPLAY[lang][level].label` と比較すると
**Then** 8ケースすべてで完全一致すること

---

### Scenario A-2: composeRiskShort の正確性
- **Property**: P2（composeRiskShort 正確性）
- **Validates**: US-1, AC-1.2, AC-1.4

**Given** デフォルト config が読み込まれている場合
**When** `composeRiskShort(config, RiskLevel.Low, "ja")` を呼び出すと
**Then** `"🟢 低"` を返すこと（現行 `RISK_DISPLAY.ja.low.short` と一致）

**Given** 全4リスクレベル × 2言語（ja/en）の組み合わせで呼び出した場合
**When** 各結果を現行 `RISK_DISPLAY[lang][level].short` と比較すると
**Then** 8ケースすべてで完全一致すること

---

### Scenario A-3: composeUnknownRisk の正確性
- **Property**: P3（composeUnknownRisk 正確性）
- **Validates**: US-1, AC-1.3, AC-1.4

**Given** デフォルト config が読み込まれている場合
**When** `composeUnknownRisk(config, "ja")` を呼び出すと
**Then** `"🔶 中（不明なコマンドのため注意してください）"` を返すこと（現行 `LABELS.ja.unknownRisk` と一致）

**Given** `composeUnknownRisk(config, "en")` を呼び出すと
**When** 結果を現行 `LABELS.en.unknownRisk` と比較すると
**Then** `"🔶 Medium (unknown command, use with caution)"` と完全一致すること

---

## Part B: chainNumbering テスト（chainNumbering.test.ts）

### Scenario B-1: dot スタイル
- **Property**: P4（formatChainNumber dot）
- **Validates**: US-2, AC-2.1

**Given** スタイルが `"dot"` の場合
**When** `formatChainNumber(1, "dot")` を呼び出すと
**Then** `"1. "` を返すこと

**Given** 1, 5, 9, 10, 12, 20 の各値で呼び出した場合
**When** 結果を検証すると
**Then** `"1. "`, `"5. "`, `"9. "`, `"10. "`, `"12. "`, `"20. "` をそれぞれ返すこと

---

### Scenario B-2: circled スタイル
- **Property**: P5（formatChainNumber circled）
- **Validates**: US-2, AC-2.2, AC-2.6

**Given** スタイルが `"circled"` の場合
**When** `formatChainNumber(1, "circled")` を呼び出すと
**Then** `"① "` を返すこと

**Given** 1〜9 の1桁数値で呼び出した場合
**When** 結果を検証すると
**Then** `"①"` 〜 `"⑨"` + 末尾スペースをそれぞれ返すこと

**Given** 10以上の2桁数値（10, 12）で呼び出した場合
**When** 結果を検証すると
**Then** 桁ごとグリフ合成 `"①⓪ "`, `"①② "` を返すこと

---

### Scenario B-3: keycap スタイル
- **Property**: P6（formatChainNumber keycap）
- **Validates**: US-2, AC-2.3, AC-2.6

**Given** スタイルが `"keycap"` の場合
**When** `formatChainNumber(1, "keycap")` を呼び出すと
**Then** `"1\uFE0F\u20E3 "` を返すこと（1️⃣ + スペース）

**Given** 10以上の2桁数値（10）で呼び出した場合
**When** 結果を検証すると
**Then** `"1\uFE0F\u20E3" + "0\uFE0F\u20E3" + " "` を返すこと（1️⃣0️⃣ + スペース）

---

### Scenario B-4: dingbat スタイル
- **Property**: P7（formatChainNumber dingbat）
- **Validates**: US-2, AC-2.4, AC-2.6

**Given** スタイルが `"dingbat"` の場合
**When** `formatChainNumber(1, "dingbat")` を呼び出すと
**Then** `"➊ "` を返すこと

**Given** 10以上の2桁数値（10, 12）で呼び出した場合
**When** 結果を検証すると
**Then** `"➊⓪ "`, `"➊➋ "` を返すこと

---

### Scenario B-5: none スタイル
- **Property**: P8（formatChainNumber none）
- **Validates**: US-2, AC-2.5

**Given** スタイルが `"none"` の場合
**When** `formatChainNumber(1, "none")` を呼び出すと
**Then** 空文字列 `""` を返すこと

**Given** 10で呼び出した場合
**When** 結果を検証すると
**Then** 空文字列 `""` を返すこと

---

### Scenario B-6: 未知スタイルのフォールバック
- **Property**: P4 のフォールバック動作
- **Validates**: US-2

**Given** 未知のスタイル `"unknown"` で呼び出した場合
**When** 結果を検証すると
**Then** dot と同じ `"${n}. "` にフォールバックすること

---

## Part C: compact 形式 config 駆動テスト（compactConfig.test.ts）

### Scenario C-1: テンプレート置換
- **Property**: P9（compact テンプレート置換）
- **Validates**: US-3, AC-3.1

**Given** デフォルト config（`compactTemplate = "[ShellSense {riskShort}] {commands}"`）が適用されている場合
**When** `formatExplanation()` を compact / ja で呼び出すと
**Then** 出力が `"[ShellSense "` で始まり、`"]"` の後にコマンド説明が続くこと
**And** `{riskShort}` と `{commands}` が実際の値に置換されていること

---

### Scenario C-2: commandDelimiter の反映
- **Property**: P10（compact commandDelimiter）
- **Validates**: US-3, AC-3.2

**Given** デフォルト config（`commandDelimiter = " — "`）が適用されている場合
**When** `formatExplanation()` を compact で呼び出すと
**Then** 出力内にコマンド名 + `" — "` + 説明 のパターンが含まれること

**Given** `setFormatterConfig()` でカスタム config（`commandDelimiter = " :: "`）を注入した場合
**When** `formatExplanation()` を compact で呼び出すと
**Then** 出力内に `" :: "` が使われ、`" — "` が使われていないこと

---

### Scenario C-3: riskShort の合成
- **Property**: P11（compact riskShort 合成）
- **Validates**: US-3, AC-3.3

**Given** デフォルト config で low リスクの compact 出力を生成した場合
**When** 出力内のリスク表示を検証すると
**Then** `composeRiskShort()` の結果（`"🟢 低"` for ja）が含まれること

---

### Scenario C-4: デフォルト config での出力互換性
- **Property**: P12（compact 出力互換性）
- **Validates**: US-3, AC-3.4

**Given** デフォルト config が適用されている場合
**When** 既存のコマンド（ls, rm -rf 等）で compact 出力を生成すると
**Then** 出力が `"[ShellSense リスク表示] コマンド名 — 説明"` の形式であること
**And** 既存テストと同じ出力パターンであること

---

### Scenario C-5: カスタムテンプレートの反映
- **Property**: P9 の拡張
- **Validates**: US-3, AC-3.1

**Given** `setFormatterConfig()` でカスタム config（`compactTemplate = "<<{riskShort}>> {commands}"`）を注入した場合
**When** `formatExplanation()` を compact で呼び出すと
**Then** 出力が `"<<"` で始まり `">>"` を含む形式であること
**And** `{riskShort}` と `{commands}` が正しく置換されていること

---

### Scenario C-6: 未知コマンドの compact 表示
- **Property**: P10 の未知コマンド分岐
- **Validates**: US-3

**Given** 辞書に未登録のコマンド（例: `unknowncmd123`）で compact 出力を生成した場合
**When** 出力を検証すると
**Then** `"unknowncmd123 — ?"` の形式でコマンド名 + デリミタ + `"?"` が含まれること
