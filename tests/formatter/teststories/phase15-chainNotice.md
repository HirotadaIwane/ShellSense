# Test Story — Phase 15 Unit 1 Bolt 1

> 入力コンテキスト: `Phase15_NotificationBugFix/Unit1/Bolt1/design.md` (Correctness Properties + Testing Strategy)

---

## Scenario 1: チェーンセグメントで chainNotice が表示される

- **Property**: 1（chainNotice はチェーンセグメントでのみ表示される）
- **Validates**: R1.1

**Given** チェーンコマンド `rm -rf dist && npm run build` が入力され、
AND `detailedChainSegment` レイアウト配列に `chainNotice` が含まれている場合、
**When** `formatExplanation()` で detailed 出力を生成すると、
**Then** 各セグメントの出力に chainNotice 行が含まれる。

---

## Scenario 2: chainNotice にオペレーターと suffix が含まれない

- **Property**: 2（chainNotice の出力にオペレーターと suffix が含まれない）
- **Validates**: R1.2

**Given** チェーンコマンド `ls && pwd` が入力された場合、
**When** chainNotice が出力されると、
**Then** `（&&）` のようなオペレーター表示を含まない。
AND `chainNoteSuffix` のテキストを含まない。
AND 出力は `{emojiPrefix} {labels.chainNote}` の形式である。

---

## Scenario 3: detailedChainHeader に配置した場合ヘッダーに1回表示

- **Property**: 3（chainNotice は配置場所に従う）
- **Validates**: R1.3

**Given** `detailedChainHeader` に `chainNotice` を配置したカスタム config の場合、
**When** チェーンコマンドの detailed 出力を生成すると、
**Then** ヘッダー部分に chainNotice が1回だけ表示される。
AND 各セグメントには表示されない。

---

## Scenario 4: 単一コマンドでは chainNotice が表示されない

- **Property**: 1（chainNotice はチェーンセグメントでのみ表示される）
- **Validates**: R1.4

**Given** 単一コマンド `ls -la /tmp` が入力された場合、
AND `detailedSingle` レイアウト配列に `chainNotice` が含まれていたとしても、
**When** `formatExplanation()` で detailed 出力を生成すると、
**Then** chainNotice 行は出力に含まれない。

---

## Scenario 5: riskLevel ラベルが空文字の場合に先頭スペースなし

- **Property**: 4（空ラベル・空プレフィックス時に先頭スペースが入らない）
- **Validates**: R2.1

**Given** `labels.ja.riskLevel` が空文字 `""` に設定されている場合、
**When** 単一コマンド `ls` の riskLevel 行を生成すると、
**Then** 出力行の先頭にスペースが入らない。
AND リスク値（例: `🟢 低（読み取り専用）`）は正しく表示される。

---

## Scenario 6: emoji.label.riskLevel が空文字の場合に先頭スペースなし

- **Property**: 4（空ラベル・空プレフィックス時に先頭スペースが入らない）
- **Validates**: R2.2

**Given** `emoji.label.riskLevel` が空文字 `""` に設定されている場合、
**When** 単一コマンドの riskLevel 行を生成すると、
**Then** 出力行の先頭にスペースが入らない。

---

## Scenario 7: 両方空文字の場合にリスク値のみ出力

- **Property**: 4（空ラベル・空プレフィックス時に先頭スペースが入らない）
- **Validates**: R2.3

**Given** `labels.ja.riskLevel` と `emoji.label.riskLevel` の両方が空文字の場合、
**When** 単一コマンドの riskLevel 行を生成すると、
**Then** 出力は `composeRiskFull()` の結果のみ（例: `🟢 低（読み取り専用）`）。
AND 先頭にスペースがない。

---

## Scenario 8: overallRiskLevel ラベルが空文字の場合に先頭スペースなし

- **Property**: 4（空ラベル・空プレフィックス時に先頭スペースが入らない）
- **Validates**: R2.4

**Given** `labels.ja.overallRiskLevel` が空文字 `""` に設定されている場合、
**When** チェーンコマンドの overallRiskLevel 行を生成すると、
**Then** 出力行の先頭にスペースが入らない。

---

## Scenario 9: 全ラベル設定時は従来通りの出力

- **Property**: 5（全ラベル設定時は従来通りの出力）
- **Validates**: R2.5

**Given** `emoji.label.riskLevel` と `labels.ja.riskLevel` の両方に値がある場合、
**When** riskLevel 行を生成すると、
**Then** `{emojiPrefix} {riskLabel} {riskValue}` のスペース区切りで出力される。
例: `⚠️ リスクレベル: 🟢 低（読み取り専用）`

---

## Scenario 10: チェーンコマンドのインデントが2スペース

- **Property**: 6（indent が全コンテキストで2スペース）
- **Validates**: R3.1

**Given** チェーンコマンド `rm -rf node_modules && npm install` が入力された場合、
**When** detailed 出力を生成すると、
**Then** フラグ行のインデントが `"  "`（2スペース）である。

---

## Scenario 11: 単一コマンドとチェーンのインデント幅が一致

- **Property**: 6（indent が全コンテキストで2スペース）
- **Validates**: R3.2

**Given** 同じフラグ付きコマンド `rm -rf node_modules` を
  単一コマンドとして実行した場合と、チェーンの一部として実行した場合、
**When** それぞれの detailed 出力を比較すると、
**Then** フラグ行のインデント幅が同一（2スペース）である。
