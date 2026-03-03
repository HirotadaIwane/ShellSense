# テストストーリー — Unit 5 / Bolt 1

> 入力コンテキスト: `design.md` Properties 1〜9 + `requirement.md` AC

---

## Scenario 一覧

| # | Scenario | Property | AC |
|---|----------|----------|----|
| 1 | 10コマンドが辞書に存在する | Property 1 | AC-3.1 |
| 2 | 各コマンドの必須フィールドが存在する | Property 2 | AC-3.1 |
| 3 | baseRisk値が正確である | Property 3 | AC-3.2 |
| 4 | category値が正確である | Property 4 | AC-3.3 |
| 5 | フラグの description が存在する | Property 5 | AC-3.4 |
| 6 | sed -i の riskModifier が high | Property 6 | AC-1.6 |
| 7 | ln -f の riskModifier が high | Property 7 | AC-2.1 |
| 8 | E2E: head コマンドで説明が出力される | Property 8 | AC-1.1 |
| 9 | E2E: sed -i でリスクが high になる | Property 8 | AC-1.6 |
| 10 | E2E: tar コマンドで説明が出力される | Property 8 | AC-2.2 |
| 11 | リグレッション: 既存183テストがパス | Property 9 | AC-3.5 |

---

## Scenario 詳細

### Scenario 1: 10コマンドが辞書に存在する
- **Given** `commands.json` を読み込む
- **Then** `head`, `tail`, `wc`, `sort`, `uniq`, `sed`, `awk`, `ln`, `tar`, `diff` のキーが存在する

### Scenario 2: 各コマンドの必須フィールドが存在する
- **Given** 追加10コマンドの各エントリ
- **Then** `name`, `description.ja`, `description.en`, `baseRisk`, `category` が存在する

### Scenario 3: baseRisk値が正確である
- **Given** 追加10コマンドの各エントリ
- **Then** head=low, tail=low, wc=low, sort=low, uniq=low, sed=medium, awk=low, ln=medium, tar=medium, diff=low

### Scenario 4: category値が正確である
- **Given** 追加10コマンドの各エントリ
- **Then** 全て `"filesystem"` である

### Scenario 5: フラグの description が存在する
- **Given** フラグが定義されたコマンド
- **Then** 各フラグに `description.ja` と `description.en` が存在する

### Scenario 6: sed -i の riskModifier が high
- **Given** `sed` のフラグ定義
- **Then** `-i` フラグの `riskModifier` が `"high"` である

### Scenario 7: ln -f の riskModifier が high
- **Given** `ln` のフラグ定義
- **Then** `-f` フラグの `riskModifier` が `"high"` である

### Scenario 8: E2E — head コマンドで説明が出力される
- **Given** `head -n 10 file.txt` を入力
- **When** `node dist/index.js` を実行する
- **Then** 出力に `[ShellSense]` と `head` の日本語説明が含まれる

### Scenario 9: E2E — sed -i でリスクが high になる
- **Given** `sed -i 's/foo/bar/' file.txt` を入力
- **When** `node dist/index.js` を実行する
- **Then** 出力に `⚠️` と `高` が含まれる

### Scenario 10: E2E — tar コマンドで説明が出力される
- **Given** `tar -czf archive.tar.gz src/` を入力
- **When** `node dist/index.js` を実行する
- **Then** 出力に `[ShellSense]` と `tar` の日本語説明が含まれる

### Scenario 11: リグレッション
- **When** `npx vitest run` を実行する
- **Then** 既存183テスト + 新規テスト全てパス
