# Test Story — Phase 10 / Unit 2 / Bolt 1

> 入力コンテキスト: `Phase10/Unit2/Bolt1/design.md`（Correctness Properties P1-P9）

---

## Part A: スタイル解決テスト

### Scenario A-1: 明示的スタイル名で読み込み（P1）

- **Property**: P1（スタイル解決）
- **Validates**: US-9

**Given** `config/` ディレクトリに `styles/minimal.json` が存在する場合
**When** `initFormatterConfig(configDir, { style: "minimal" })` を呼ぶと
**Then** `getFormatterConfig()` が minimal スタイルの FormatterConfig を返す（emoji.risk.low が空文字）

**Given** `config/` ディレクトリに `styles/ascii.json` が存在する場合
**When** `initFormatterConfig(configDir, { style: "ascii" })` を呼ぶと
**Then** `getFormatterConfig()` が ascii スタイルの FormatterConfig を返す（emoji.risk.low が `"[OK]"`）

**Given** `config/` ディレクトリに `styles/pro.json` が存在する場合
**When** `initFormatterConfig(configDir, { style: "pro" })` を呼ぶと
**Then** `getFormatterConfig()` が pro スタイルの FormatterConfig を返す（emoji.risk.low が空文字）

### Scenario A-2: デフォルトスタイル — options なし（P2）

- **Property**: P2（デフォルトスタイル）
- **Validates**: US-10

**Given** `config/` ディレクトリに `styles/emoji.json` が存在する場合
**When** `initFormatterConfig(configDir)` を options なしで呼ぶと
**Then** `getFormatterConfig()` が emoji スタイルの FormatterConfig を返す（emoji.risk.low が `"🟢"`）

### Scenario A-3: デフォルトスタイル — style 省略（P2）

- **Property**: P2（デフォルトスタイル）
- **Validates**: US-10

**Given** options を `{}` で渡した場合
**When** `initFormatterConfig(configDir, {})` を呼ぶと
**Then** `getFormatterConfig()` が emoji スタイルの FormatterConfig を返す（デフォルト）

---

## Part B: deep merge テスト

### Scenario B-1: プリミティブ上書き（P3）

- **Property**: P3（deep merge — プリミティブ上書き）
- **Validates**: US-11

**Given** emoji スタイルをベースにロードした場合
**When** `initFormatterConfig(configDir, { style: "emoji", overrides: { layout: { chainNumbering: "circled" } } })` を呼ぶと
**Then** `getFormatterConfig().layout.chainNumbering` が `"circled"` であること
**And** `getFormatterConfig().layout.commandDelimiter` は emoji スタイルのデフォルト値のまま

### Scenario B-2: オブジェクト再帰マージ（P4）

- **Property**: P4（deep merge — オブジェクト再帰）
- **Validates**: US-11

**Given** emoji スタイルをベースにロードした場合
**When** `overrides: { emoji: { risk: { low: "CUSTOM" } } }` で呼ぶと
**Then** `getFormatterConfig().emoji.risk.low` が `"CUSTOM"` であること
**And** `getFormatterConfig().emoji.risk.high` は元の emoji スタイルの値のまま
**And** `getFormatterConfig().emoji.label.riskLevel` も元の値のまま

### Scenario B-3: 配列全置換（P5）

- **Property**: P5（deep merge — 配列置換）
- **Validates**: US-11

**Given** emoji スタイルをベースにロードした場合
**When** `overrides: { layout: { detailedSingle: ["sectionHeader"] } }` で呼ぶと
**Then** `getFormatterConfig().layout.detailedSingle` が `["sectionHeader"]` のみ

### Scenario B-4: 空 overrides（P6）

- **Property**: P6（deep merge — 空 overrides）
- **Validates**: US-11

**Given** emoji スタイルをベースにロードした場合
**When** `initFormatterConfig(configDir, { style: "emoji", overrides: {} })` を呼ぶと
**Then** `getFormatterConfig()` が素の emoji スタイルと同一の値を返す

---

## Part C: 型エクスポートテスト

### Scenario C-1: StyleOptions / DeepPartial エクスポート（P7）

- **Property**: P7（型定義）
- **Validates**: US-12

**Given** `src/types.ts` をインポートした場合
**When** `StyleOptions` 型を参照すると
**Then** コンパイルが通ること（型がエクスポートされている）
**And** `StyleOptions.style` が `string | undefined` であること
**And** `StyleOptions.overrides` が `DeepPartial<FormatterConfig> | undefined` であること

### Scenario C-2: DeepPartial の再帰性（P7）

- **Property**: P7（型定義）
- **Validates**: US-12

**Given** `DeepPartial<FormatterConfig>` 型を使用した場合
**When** ネストされたプロパティを部分的に指定すると
**Then** TypeScript のコンパイルが通ること（`{ layout: { chainNumbering: "circled" } }` がエラーにならない）

---

## Part D: 後方互換テスト

### Scenario D-1: 自動検出パス（P8）

- **Property**: P8（後方互換 — 自動検出）
- **Validates**: US-10

**Given** キャッシュがリセットされた状態で
**When** `getFormatterConfig()` を直接呼ぶと
**Then** `styles/emoji.json` から自動検出でロードされること（Unit 1 で対応済み）
**And** `version` が `"1.0.0"` であること
