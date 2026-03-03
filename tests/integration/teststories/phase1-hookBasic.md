# Test Story — Unit 4 / Bolt 1: エントリポイント統合

> 入力コンテキスト: `design.md` (Correctness Properties 1〜10)

---

### Scenario 1: 正常系 — HookOutput の出力
- **Property**: 1
- **Validates**: AC-1.1〜1.4

**Given** stdinに `ls -la` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** stdout に有効な JSON が出力されること
**And** `hookSpecificOutput.hookEventName` が `"PreToolUse"` であること
**And** `hookSpecificOutput.permissionDecision` が `"ask"` であること
**And** `hookSpecificOutput.additionalContext` に `[ShellSense]` が含まれること

---

### Scenario 2: エラー系 — 不正JSON
- **Property**: 2
- **Validates**: AC-2.1

**Given** stdinに `"not json"` が渡された場合
**When** dist/index.js を実行すると
**Then** stdout に `{}` が出力されること
**And** exit code が 0 であること

---

### Scenario 3: エラー系 — Bash以外のツール
- **Property**: 3
- **Validates**: AC-2.2

**Given** stdinに `tool_name: "Read"` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** stdout に `{}` が出力されること

---

### Scenario 4: エラー系 — コマンド空
- **Property**: 4
- **Validates**: AC-2.3

**Given** stdinに `tool_input.command: ""` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** stdout に `{}` が出力されること

---

### Scenario 5: パイプライン — ls -la（low リスク）
- **Property**: 5
- **Validates**: AC-3.1

**Given** stdinに `ls -la` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** additionalContext に `✅` が含まれること
**And** additionalContext に `ls` の日本語説明が含まれること

---

### Scenario 6: パイプライン — rm -rf（high リスク）
- **Property**: 6
- **Validates**: AC-3.2

**Given** stdinに `rm -rf node_modules` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** additionalContext に `⚠️` と `高` が含まれること

---

### Scenario 7: パイプライン — git reset --hard（critical リスク）
- **Property**: 7
- **Validates**: AC-3.3

**Given** stdinに `git reset --hard HEAD~1` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** additionalContext に `🚨` と `最高` が含まれること

---

### Scenario 8: パイプライン — 未知コマンド（medium リスク）
- **Property**: 8
- **Validates**: AC-3.4

**Given** stdinに `unknowncmd --foo` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** additionalContext に `📝` と `未登録` が含まれること

---

### Scenario 9: パイプライン — チェーンコマンド
- **Property**: 9
- **Validates**: AC-3.5

**Given** stdinに `rm -rf node_modules && npm install` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** additionalContext に `ℹ️ 注意:` が含まれること

---

### Scenario 10: パフォーマンス
- **Property**: 10
- **Validates**: AC-4.1

**Given** stdinに `ls -la` のHookInput JSONが渡された場合
**When** dist/index.js を実行すると
**Then** 実行時間が200ms以下であること
