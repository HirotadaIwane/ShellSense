# Test Story — Phase 10 / Unit 3 / Bolt 1

> 入力コンテキスト: `Phase10/Unit3/Bolt1/design.md`（Correctness Properties P1-P8）

---

## Part A: package.json 設定定義テスト

### Scenario A-1: shellsense.style 設定（P1）

- **Property**: P1（package.json 設定定義）
- **Validates**: US-13

**Given** `vscode-extension/package.json` を JSON パースした場合
**When** `contributes.configuration.properties["shellsense.style"]` を参照すると
**Then** `type` が `"string"` であること
**And** `default` が `"emoji"` であること
**And** `enum` が `["emoji", "minimal", "ascii", "pro"]` であること
**And** `enumDescriptions` が 4 つあること

### Scenario A-2: shellsense.chainNumbering 設定（P2）

- **Property**: P2（package.json chainNumbering 設定定義）
- **Validates**: US-14

**Given** `vscode-extension/package.json` を JSON パースした場合
**When** `contributes.configuration.properties["shellsense.chainNumbering"]` を参照すると
**Then** `type` が `"string"` であること
**And** `default` が `"dot"` であること
**And** `enum` が `["dot", "circled", "keycap", "dingbat", "none"]` であること
**And** `enumDescriptions` が 5 つあること

---

## Part B: extension.ts ソース検査テスト

### Scenario B-1: 設定読み取り（P3）

- **Property**: P3（extension.ts 設定読み取り）
- **Validates**: US-15

**Given** `vscode-extension/src/extension.ts` のソースコードを読んだ場合
**When** `getConfiguration('shellsense')` を検索すると
**Then** `initFormatterConfig` 呼び出しの近くに存在すること

**Given** ソースコードに `style` と `chainNumbering` の設定取得があること
**When** `.get` メソッドを検索すると
**Then** `'style'` と `'chainNumbering'` の取得が含まれること

### Scenario B-2: initFormatterConfig オプション付き呼び出し（P4）

- **Property**: P4（extension.ts initFormatterConfig 呼び出し）
- **Validates**: US-15

**Given** `extension.ts` のソースコードを読んだ場合
**When** `initFormatterConfig` の呼び出しを検査すると
**Then** 第 2 引数にオブジェクトが渡されていること（`initFormatterConfig(` の後に `,` がある）

### Scenario B-3: デフォルト値の後方互換（P5）

- **Property**: P5（デフォルト設定の後方互換）
- **Validates**: US-15

**Given** extension.ts のソースコードを読んだ場合
**When** style の `.get` 呼び出しを検査すると
**Then** デフォルト値 `'emoji'` が指定されていること

**Given** extension.ts のソースコードを読んだ場合
**When** chainNumbering の `.get` 呼び出しを検査すると
**Then** デフォルト値 `'dot'` が指定されていること

---

## Part C: esbuild ビルドテスト

### Scenario C-1: スタイルファイル出力（P6）

- **Property**: P6（esbuild スタイルファイル出力）
- **Validates**: US-16

**Given** `node vscode-extension/esbuild.js` を実行した場合
**When** `vscode-extension/dist/config/styles/` を確認すると
**Then** `emoji.json` が存在すること
**And** `minimal.json` が存在すること
**And** `ascii.json` が存在すること
**And** `pro.json` が存在すること
