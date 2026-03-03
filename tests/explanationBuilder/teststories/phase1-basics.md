# Test Story — Unit 3 / Bolt 2: 説明テキスト生成

> 入力コンテキスト: `design.md` (Correctness Properties 1〜9)

---

### Scenario 1: [ShellSense] プレフィックスの存在
- **Property**: 1
- **Validates**: AC-1.1

**Given** 任意の既知コマンドが入力された場合
**When** buildExplanation を実行すると
**Then** 出力の先頭に `[ShellSense] 以下のコマンド説明をユーザーに必ず表示してください。` が含まれること

---

### Scenario 2: コマンド日本語説明の表示
- **Property**: 2
- **Validates**: AC-1.2

**Given** ParsedCommand `ls` と辞書エントリ（description.ja: "ファイルやフォルダの一覧を表示します"）が入力された場合
**When** buildExplanation を実行すると
**Then** `ls — ファイルやフォルダの一覧を表示します` が含まれること

---

### Scenario 3: サブコマンド付き表示
- **Property**: 3
- **Validates**: AC-1.3

**Given** ParsedCommand `git reset` と辞書エントリが入力された場合
**When** buildExplanation を実行すると
**Then** `git reset — コミットの取り消しやステージングの解除を行います` が含まれること

---

### Scenario 4: フラグ日本語説明の表示
- **Property**: 4
- **Validates**: AC-1.4

**Given** ParsedCommand `rm -rf` と辞書エントリが入力された場合
**When** buildExplanation を実行すると
**Then** `  -r: フォルダの中身も含めて再帰的に削除` が含まれること
**And** `  -f: 確認なしで強制削除` が含まれること
**And** 辞書に存在しないフラグは表示されないこと

---

### Scenario 5: 引数の「対象:」表示
- **Property**: 5
- **Validates**: AC-1.5

**Given** ParsedCommand `rm -rf node_modules` と辞書エントリが入力された場合
**When** buildExplanation を実行すると
**Then** `  対象: node_modules` が含まれること

**Given** args が空の場合
**When** buildExplanation を実行すると
**Then** 「対象:」行は含まれないこと

---

### Scenario 6: リスクレベル Emoji + ラベル表示
- **Property**: 6
- **Validates**: AC-1.6

**Given** risk = Low の場合
**Then** `✅ 低（読み取り専用）` が含まれること

**Given** risk = Medium の場合
**Then** `📝 中（ファイルの変更を含む）` が含まれること

**Given** risk = High の場合
**Then** `⚠️ 高（削除・上書きを含む）` が含まれること

**Given** risk = Critical の場合
**Then** `🚨 最高（システムレベルの変更・不可逆操作）` が含まれること

---

### Scenario 7: チェーンコマンド注意文
- **Property**: 7
- **Validates**: AC-1.7

**Given** ParsedCommand（hasChain: true, chainOperator: "&&"）が入力された場合
**When** buildExplanation を実行すると
**Then** `ℹ️ 注意: このコマンドは複数のコマンドが連結されています（&&）` が含まれること

---

### Scenario 8: 未知コマンドテンプレート
- **Property**: 8
- **Validates**: AC-1.8

**Given** ParsedCommand `unknowncmd` と entry = null が入力された場合
**When** buildExplanation を実行すると
**Then** `unknowncmd — このコマンドはShellSenseの辞書に未登録です` が含まれること
**And** `📝 中（不明なコマンドのため注意してください）` が含まれること

---

### Scenario 9: Specs.md 出力例4パターンの整合
- **Property**: 9
- **Validates**: AC-1.9

**Given** Specs.md Section 7 の出力例4パターン（ls -la / rm -rf / git reset --hard / チェーンコマンド）
**When** 各パターンで buildExplanation を実行すると
**Then** Specs.md に記載された出力と整合すること
