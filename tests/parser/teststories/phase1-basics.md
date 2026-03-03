# Test Story — Unit 2 / Bolt 1: コマンドパーサー

> 入力コンテキスト: `design.md` (Correctness Properties 1〜10)

---

### Scenario 1: 基本コマンドのパース
- **Property**: 1
- **Validates**: AC-1.1

**Given** コマンド文字列 `"ls -la"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"ls"` であること
**And** flags は `["-l", "-a"]` であること（結合フラグ展開）
**And** args は `[]` であること
**And** subcommand は `null` であること
**And** hasChain は `false` であること
**And** hasSudo は `false` であること

---

### Scenario 2: サブコマンドの検出
- **Property**: 2
- **Validates**: AC-1.2

**Given** コマンド文字列 `"git commit -m 'initial commit'"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"git"` であること
**And** subcommand は `"commit"` であること
**And** flags は `["-m"]` であること
**And** args は `["initial commit"]` であること

**Given** コマンド文字列 `"npm install"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"npm"` であること
**And** subcommand は `"install"` であること

**Given** コマンド文字列 `"git -v"` が入力された場合（サブコマンドなし、フラグのみ）
**When** パーサーが処理すると
**Then** commandName は `"git"` であること
**And** subcommand は `null` であること（`-v` はフラグであってサブコマンドではない）
**And** flags は `["-v"]` であること

---

### Scenario 3: 結合フラグの展開
- **Property**: 3
- **Validates**: AC-1.3

**Given** コマンド文字列 `"rm -rf node_modules"` が入力された場合
**When** パーサーがフラグを解析すると
**Then** flags は `["-r", "-f"]` であること

**Given** コマンド文字列 `"ls --all"` が入力された場合
**When** パーサーがフラグを解析すると
**Then** flags は `["--all"]` であること（ロングフラグは展開しない）

**Given** コマンド文字列 `"ls -v"` が入力された場合
**When** パーサーがフラグを解析すると
**Then** flags は `["-v"]` であること（1文字フラグはそのまま）

---

### Scenario 4: チェーン演算子の検出
- **Property**: 4
- **Validates**: AC-1.4

**Given** コマンド文字列 `"rm -rf node_modules && npm install"` が入力された場合
**When** パーサーが処理すると
**Then** hasChain は `true` であること
**And** chainOperator は `"&&"` であること
**And** commandName は `"rm"` であること（最初のコマンドのみ）

**Given** コマンド文字列 `"cat file.txt | grep error"` が入力された場合
**When** パーサーが処理すると
**Then** hasChain は `true` であること
**And** chainOperator は `"|"` であること

**Given** コマンド文字列 `"echo 'hello || world'"` が入力された場合
**When** パーサーが処理すると
**Then** hasChain は `false` であること（引用符内の演算子は無視）

---

### Scenario 5: sudoプレフィックスの処理
- **Property**: 5
- **Validates**: AC-1.5

**Given** コマンド文字列 `"sudo rm -rf /tmp/cache"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"rm"` であること
**And** hasSudo は `true` であること
**And** flags は `["-r", "-f"]` であること
**And** args は `["/tmp/cache"]` であること

---

### Scenario 6: 環境変数プレフィックスのスキップ
- **Property**: 6
- **Validates**: AC-1.6

**Given** コマンド文字列 `"NODE_ENV=production node app.js"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"node"` であること
**And** args は `["app.js"]` であること

**Given** コマンド文字列 `"A=1 B=2 python script.py"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"python"` であること（複数の環境変数もスキップ）

---

### Scenario 7: 引用符付き引数の保持
- **Property**: 7
- **Validates**: AC-1.7

**Given** コマンド文字列 `'grep "hello world" file.txt'` が入力された場合
**When** パーサーが処理すると
**Then** args は `["hello world", "file.txt"]` であること

**Given** コマンド文字列 `"echo 'single quoted'"` が入力された場合
**When** パーサーが処理すると
**Then** args は `["single quoted"]` であること

---

### Scenario 8: パス付きコマンドのベースネーム抽出
- **Property**: 8
- **Validates**: AC-1.8

**Given** コマンド文字列 `"/usr/bin/git status"` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `"git"` であること
**And** subcommand は `"status"` であること

---

### Scenario 9: 空コマンドの安全処理
- **Property**: 9
- **Validates**: AC-1.9

**Given** 空文字列 `""` が入力された場合
**When** パーサーが処理すると
**Then** commandName は `""` であること
**And** エラーが発生しないこと
**And** flags は `[]` であること
**And** args は `[]` であること

---

### Scenario 10: rawフィールドの保持
- **Property**: 10
- **Validates**: AC-1.10

**Given** コマンド文字列 `"rm -rf node_modules && npm install"` が入力された場合
**When** パーサーが処理すると
**Then** raw は `"rm -rf node_modules && npm install"` であること（元の入力そのまま）
