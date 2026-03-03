# Test Story — Phase 9 Unit 1 Bolt 2

> 入力コンテキスト: `Phase9/Unit1/Bolt2/design.md` — Correctness Properties P1-P12

---

## Part A: 正常読み込みテスト

### Scenario A-1: getFormatterConfig() の基本動作
- **Property**: P1（正常読み込み）
- **Validates**: US-1, AC-1.1

**Given** `config/formatter.json` が存在する場合
**When** `getFormatterConfig()` を呼び出すと
**Then** `FormatterConfig` 型のオブジェクトが返り、`version`, `emoji`, `labels`, `layout` が存在すること

---

### Scenario A-2: 返却値の正確性
- **Property**: P2（値の正確性）
- **Validates**: US-1, AC-1.2

**Given** `config/formatter.json` の `version` が `"1.0.0"` である場合
**When** `getFormatterConfig()` を呼び出すと
**Then** 返却オブジェクトの `version` が `"1.0.0"` であること

---

### Scenario A-3: 明示的パス初期化
- **Property**: P3（明示的パス初期化）
- **Validates**: US-1, AC-1.3

**Given** テスト用フィクスチャ `fixtures/valid/formatter.json` が存在する場合
**When** `initFormatterConfig(fixturesValidDir)` で初期化し、`getFormatterConfig()` を呼び出すと
**Then** フィクスチャ固有の値（`version: "test-1.0.0"`）が返ること

---

## Part B: キャッシュ動作テスト

### Scenario B-1: キャッシュ同一性
- **Property**: P4（キャッシュ同一性）
- **Validates**: US-2, AC-2.1

**Given** `getFormatterConfig()` が1回呼ばれた場合
**When** 2回目の `getFormatterConfig()` を呼び出すと
**Then** 1回目と同一のオブジェクト参照（`===`）を返すこと

---

### Scenario B-2: 明示的初期化後のキャッシュ
- **Property**: P5（明示的初期化後のキャッシュ）
- **Validates**: US-2, AC-2.2

**Given** `initFormatterConfig(dir)` で初期化した場合
**When** `getFormatterConfig()` を呼び出すと
**Then** `initFormatterConfig` で読み込んだオブジェクトと同一参照を返すこと

---

### Scenario B-3: 自動検出初期化
- **Property**: P6（自動検出初期化）
- **Validates**: US-2, AC-2.3

**Given** キャッシュが空（`resetFormatterConfig()` 後）の場合
**When** `getFormatterConfig()` を呼び出すと
**Then** `config/formatter.json` から自動検出で読み込み、有効なオブジェクトを返すこと

---

## Part C: テスト用 API テスト

### Scenario C-1: setFormatterConfig
- **Property**: P7（setFormatterConfig）
- **Validates**: US-3, AC-3.1

**Given** カスタム `FormatterConfig` オブジェクトを作成した場合
**When** `setFormatterConfig(customConfig)` を呼び、その後 `getFormatterConfig()` を呼び出すと
**Then** `customConfig` と同一のオブジェクト参照を返すこと

---

### Scenario C-2: resetFormatterConfig
- **Property**: P8（resetFormatterConfig）
- **Validates**: US-3, AC-3.2

**Given** `setFormatterConfig(customConfig)` でカスタム config を設定した場合
**When** `resetFormatterConfig()` を呼び、その後 `getFormatterConfig()` を呼び出すと
**Then** `customConfig` ではなくファイルから再読み込みした新しいオブジェクトを返すこと

---

## Part D: エラー系テスト

### Scenario D-1: 不正パスで例外
- **Property**: P9（不正パス例外）
- **Validates**: US-4, AC-4.1

**Given** 存在しないディレクトリパスが与えられた場合
**When** `initFormatterConfig("/nonexistent/path")` を呼び出すと
**Then** 例外がスローされること

---

### Scenario D-2: 不正JSONで例外
- **Property**: P10（不正JSON例外）
- **Validates**: US-4, AC-4.2

**Given** `fixtures/malformed/formatter.json` が不正な JSON を含む場合
**When** `initFormatterConfig(malformedDir)` を呼び出すと
**Then** 例外がスローされること

---

### Scenario D-3: 例外非抑制
- **Property**: P11（例外非抑制）
- **Validates**: US-4, AC-4.3

**Given** `configLoader.ts` のソースコードが存在する場合
**When** ソースを読み込み `catch` キーワードを検索すると
**Then** `catch` が含まれていないこと（例外を握りつぶしていない）

---

## Part E: ゼロ依存テスト

### Scenario E-1: import 制約
- **Property**: P12（ゼロ依存）
- **Validates**: US-5, AC-5.1

**Given** `configLoader.ts` のソースコードが存在する場合
**When** import 行を抽出すると
**Then** `fs`, `path`, `./types` のみであること
