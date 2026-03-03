# テストストーリー — Unit 5 / Bolt 2

> 入力コンテキスト: `design.md` Properties 1〜9 + `requirement.md` AC

---

## Scenario 一覧

| # | Scenario | Property | AC |
|---|----------|----------|----|
| 1 | 8コマンドが辞書に存在する | Property 1 | AC-4.1 |
| 2 | 各コマンドの必須フィールドが存在する | Property 2 | AC-4.1 |
| 3 | baseRisk / category 値が正確である | Property 3 | AC-1.1〜2.3 |
| 4 | kill -9 の riskModifier が critical | Property 4 | AC-2.2 |
| 5 | pip のサブコマンドが存在する | Property 5 | AC-3.1 |
| 6 | 既存コマンドの追加フラグが存在する | Property 6 | AC-3.2〜3.5 |
| 7 | find -exec の riskModifier が high | Property 7 | AC-3.6 |
| 8 | E2E: kill -9 でリスクが最高になる | Property 8 | AC-2.2 |
| 9 | E2E: npx で説明が出力される | Property 8 | AC-2.3 |
| 10 | E2E: pip install でサブコマンド説明が出力される | Property 8 | AC-3.1 |
| 11 | リグレッション: 既存238テストがパス | Property 9 | AC-4.2 |

---

## Scenario 詳細

### Scenario 1: 8コマンドが辞書に存在する
- **Given** `commands.json` を読み込む
- **Then** `which`, `xargs`, `tee`, `export`, `source`, `ps`, `kill`, `npx` のキーが存在する

### Scenario 2: 各コマンドの必須フィールドが存在する
- **Given** 追加8コマンドの各エントリ
- **Then** `name`, `description.ja`, `description.en`, `baseRisk`, `category` が存在する

### Scenario 3: baseRisk / category 値が正確である
- **Given** 追加8コマンドの各エントリ
- **Then** which=low/other, xargs=medium/other, tee=medium/filesystem, export=low/other, source=medium/other, ps=low/process, kill=high/process, npx=medium/package

### Scenario 4: kill -9 の riskModifier が critical
- **Given** `kill` のフラグ定義
- **Then** `-9` フラグの `riskModifier` が `"critical"` である

### Scenario 5: pip のサブコマンドが存在する
- **Given** `pip` のエントリ
- **Then** install(medium), uninstall(high), freeze(low), list(low) のサブコマンドが存在する

### Scenario 6: 既存コマンドの追加フラグが存在する
- **Given** cp, mv, curl, grep の各エントリ
- **Then** cp に `-i`, mv に `-i`, curl に `-L`/`-s`/`-d`, grep に `-l`/`-v`/`-c` が存在する

### Scenario 7: find -exec の riskModifier が high
- **Given** `find` のフラグ定義
- **Then** `-exec` フラグの `riskModifier` が `"high"` である

### Scenario 8: E2E — kill -9 でリスクが最高になる
- **Given** `kill -9 1234` を入力
- **When** `node dist/index.js` を実行する
- **Then** 出力に `[ShellSense]` と `🚨` と `最高` が含まれる

### Scenario 9: E2E — npx で説明が出力される
- **Given** `npx tsc` を入力
- **When** `node dist/index.js` を実行する
- **Then** 出力に `[ShellSense]` と `npx` の日本語説明が含まれる

### Scenario 10: E2E — pip install でサブコマンド説明が出力される
- **Given** `pip install requests` を入力
- **When** `node dist/index.js` を実行する
- **Then** 出力に `[ShellSense]` と `pip install` の日本語説明が含まれる

### Scenario 11: リグレッション
- **When** `npx vitest run` を実行する
- **Then** 既存238テスト + 新規テスト全てパス
