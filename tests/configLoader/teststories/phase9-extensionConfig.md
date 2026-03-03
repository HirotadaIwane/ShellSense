# Test Story — Phase 9 / Unit 3 / Bolt 1

> 入力コンテキスト: `Phase9/Unit3/Bolt1/design.md` (Correctness Properties P1-P7)

---

## Part A: ビルドコピー (P1)

### Scenario 1: esbuild で config がコピーされる
- **Property**: P1（ビルドコピー）
- **Validates**: US-1, AC-1.1, AC-1.2

**Given** `node vscode-extension/esbuild.js` を実行した場合
**When** ビルド出力を確認すると
**Then** `vscode-extension/dist/config/formatter.json` が存在すること

---

## Part B: 初期化順序 (P2, P3)

### Scenario 2: initFormatterConfig が loadDictionary より前
- **Property**: P2（初期化順序）
- **Validates**: US-2, AC-2.1, AC-2.2

**Given** `vscode-extension/src/extension.ts` のソースコードを読み込んだ場合
**When** `initFormatterConfig` と `loadDictionary` の呼び出し位置を比較すると
**Then** `initFormatterConfig` の行番号が `loadDictionary` より小さいこと

### Scenario 3: initFormatterConfig が try-catch で保護されている
- **Property**: P3（初期化保護）
- **Validates**: US-2, AC-2.3

**Given** `vscode-extension/src/extension.ts` のソースコードを読み込んだ場合
**When** `initFormatterConfig` の呼び出し周辺を確認すると
**Then** try-catch ブロック内にあること

### Scenario 4: initFormatterConfig の import がある
- **Property**: P2
- **Validates**: US-2

**Given** `vscode-extension/src/extension.ts` のソースコードを読み込んだ場合
**When** import 文を確認すると
**Then** `initFormatterConfig` が `configLoader` からインポートされていること

---

## Part C: RISK_LABEL config 駆動 (P4, P5, P6)

### Scenario 5: RISK_LABEL の値が現行と一致
- **Property**: P4（RISK_LABEL 値互換）
- **Validates**: US-3, AC-3.3

**Given** `notificationUtils.ts` から `RISK_LABEL` をインポートした場合
**When** 各リスクレベル × 言語の値を確認すると
**Then** 以下がすべて一致すること:
  - `low/ja` → `"🟢 低"`, `low/en` → `"🟢 Low"`
  - `medium/ja` → `"🔶 中"`, `medium/en` → `"🔶 Medium"`
  - `high/ja` → `"⚠️ 高"`, `high/en` → `"⚠️ High"`
  - `critical/ja` → `"🚨 最高"`, `critical/en` → `"🚨 Critical"`

### Scenario 6: RISK_LABEL にハードコード文字列がない
- **Property**: P6（ハードコード削除）
- **Validates**: US-3, AC-3.1

**Given** `vscode-extension/src/notificationUtils.ts` のソースコードを読み込んだ場合
**When** ハードコードされたリスクラベル文字列を検索すると
**Then** `'🟢 低'`, `'🔶 中'`, `'⚠️ 高'`, `'🚨 最高'` が存在しないこと

### Scenario 7: buildRiskLabel が getFormatterConfig を使用
- **Property**: P4
- **Validates**: US-3, AC-3.2

**Given** `vscode-extension/src/notificationUtils.ts` のソースコードを読み込んだ場合
**When** `getFormatterConfig` の参照を確認すると
**Then** `configLoader` からインポートされ、使用されていること

---

## Part D: リグレッション (P7)

### Scenario 8: 全テスト通過
- **Property**: P7（リグレッションなし）
- **Validates**: US-4, AC-4.1

**Given** 全ての変更が完了した状態で
**When** `npm test` を実行すると
**Then** 全 879 テストが通過すること

### Scenario 9: 型チェック通過
- **Property**: P7（リグレッションなし）
- **Validates**: US-4, AC-4.2

**Given** 全ての変更が完了した状態で
**When** `npx tsc` を実行すると
**Then** コンパイルエラーがないこと
