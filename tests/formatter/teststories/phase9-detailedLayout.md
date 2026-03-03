# Test Story — Phase 9 / Unit 2 / Bolt 2

> 入力コンテキスト: `Phase9/Unit2/Bolt2/design.md` (Correctness Properties P1-P12)

---

## Part A: detailed 単一コマンド config 駆動 (P1-P5)

### Scenario 1: レイアウト駆動レンダリング (P1)
- **Property**: P1（detailedSingle レイアウト駆動）
- **Validates**: US-1, AC-1.1

**Given** デフォルト config で `ls -la /tmp` を detailed 形式で出力した場合
**When** 出力行を確認すると
**Then** sectionHeader → commandDescription → flagDescriptions → targetArguments → separator → riskLevel → chainNotice の順で出力されること

### Scenario 2: ラベル config 化 (P2)
- **Property**: P2（detailedSingle ラベル config 化）
- **Validates**: US-1, AC-1.2

**Given** デフォルト config で `ls` を ja で detailed 出力した場合
**When** sectionHeader 行を確認すると
**Then** `</>` が出力されること（config.labels.ja.sectionHeader の値）

**Given** デフォルト config で `ls` を en で detailed 出力した場合
**When** sectionHeader 行を確認すると
**Then** `</>` が出力されること（config.labels.en.sectionHeader の値）

### Scenario 3: リスク合成 (P3)
- **Property**: P3（detailedSingle リスク合成）
- **Validates**: US-1, AC-1.3

**Given** `ls` を ja で detailed 出力した場合
**When** リスク行を確認すると
**Then** `⚠️ リスクレベル: 🟢 低（読み取り専用）` が含まれること（composeRiskFull の結果）

**Given** `rm -rf node_modules` を ja で detailed 出力した場合
**When** リスク行を確認すると
**Then** `⚠️ リスクレベル: ⚠️ 高（削除・上書きを含む）` が含まれること

### Scenario 4: 未知コマンドリスク合成 (P4)
- **Property**: P4（detailedSingle 未知リスク合成）
- **Validates**: US-1, AC-1.4

**Given** `unknowncmd123` を ja で detailed 出力した場合
**When** リスク行を確認すると
**Then** `🔶 中（不明なコマンドのため注意してください）` が含まれること（composeUnknownRisk の結果）

### Scenario 5: commandDelimiter config 化 (P5)
- **Property**: P5（detailedSingle デリミタ）
- **Validates**: US-1, AC-1.5

**Given** デフォルト config で `ls` を detailed 出力した場合
**When** コマンド説明行を確認すると
**Then** `ls — ` を含むこと（デフォルトデリミタ " — "）

**Given** カスタム config で commandDelimiter を " :: " に変更した場合
**When** `ls` を detailed 出力すると
**Then** `ls :: ` を含み、`ls — ` を含まないこと

---

## Part B: detailed チェーンコマンド config 駆動 (P6-P10)

### Scenario 6: Header レイアウト (P6)
- **Property**: P6（detailedChain Header レイアウト）
- **Validates**: US-2, AC-2.1

**Given** `rm -rf node_modules && npm install` を detailed 出力した場合
**When** 先頭行を確認すると
**Then** `</>` が出力されること（detailedChainHeader の sectionHeader）

### Scenario 7: Segment レイアウト (P7)
- **Property**: P7（detailedChain Segment レイアウト）
- **Validates**: US-2, AC-2.2

**Given** `rm -rf node_modules && npm install` を detailed/ja で出力した場合
**When** セグメント部分を確認すると
**Then** 各セグメントが commandDescription → flagDescriptions → targetArguments の順で出力されること

### Scenario 8: Footer レイアウト (P8)
- **Property**: P8（detailedChain Footer レイアウト）
- **Validates**: US-2, AC-2.3

**Given** `rm -rf node_modules && npm install` を detailed/ja で出力した場合
**When** フッター部分を確認すると
**Then** separator（空行） → overallRiskLevel の順で出力されること

### Scenario 9: 演算子 config 化 (P9)
- **Property**: P9（detailedChain 演算子 config 化）
- **Validates**: US-2, AC-2.4

**Given** `rm -rf node_modules && npm install` を detailed 出力した場合
**When** 演算子行を確認すると
**Then** `━✅━▸` が含まれること（config.emoji.operator["&&"] の値）

**Given** カスタム config で `&&` の演算子を `→THEN→` に変更した場合
**When** 同じコマンドを detailed 出力すると
**Then** `→THEN→` が含まれ、`━✅━▸` は含まれないこと

### Scenario 10: チェーン番号スタイル (P10)
- **Property**: P10（detailedChain 番号スタイル）
- **Validates**: US-2, AC-2.5

**Given** デフォルト config（chainNumbering = "dot"）でチェーンを出力した場合
**When** セグメント行を確認すると
**Then** `1. rm` や `2. npm` のように "dot" 形式の番号が付くこと

### Scenario 11: チェーンデリミタ config 化 (P5+P7)
- **Property**: P5, P7
- **Validates**: US-2, AC-2.6

**Given** カスタム config で commandDelimiter を " >> " に変更した場合
**When** チェーンコマンドを detailed 出力すると
**Then** 各セグメントのコマンド説明行に " >> " が使われること

---

## Part C: 旧定数削除 (P11)

### Scenario 12: 旧定数がソースに存在しない (P11)
- **Property**: P11（旧定数削除）
- **Validates**: US-4, AC-4.1〜4.4

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** 以下のキーワードを検索すると
**Then** `RISK_DISPLAY` が存在しないこと
**And** `TemplateLabels` が存在しないこと
**And** `LABELS` が定数宣言として存在しないこと（`const LABELS`）
**And** `OPERATOR_DISPLAY` が存在しないこと

---

## Part D: 出力互換性 (P12)

### Scenario 13: 既存テスト全パス (P12)
- **Property**: P12（出力互換性）
- **Validates**: US-5, AC-5.1, AC-5.2

**Given** Bolt 2 のリファクタリングが完了した状態で
**When** `npm test` を実行すると
**Then** 既存 840 テストが変更なしで全パスすること

**Given** Bolt 2 のリファクタリングが完了した状態で
**When** `npx tsc` を実行すると
**Then** コンパイルエラーがないこと
