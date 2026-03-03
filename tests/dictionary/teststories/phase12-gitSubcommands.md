# Test Story — Unit 2 Bolt 1

> Git 辞書完成: 50 サブコマンド + 全固有フラグ定義
>
> 入力コンテキスト: `design.md`（Correctness Properties P1-P13）

---

### Scenario: 50 サブコマンドの存在確認
- **Property**: P1（サブコマンド数）
- **Validates**: AC-1

**Given** `dictionary/tools/git.json` を読み込んだ場合
**When** `commands.git.subcommands` のキー数を数えると
**Then** 50 個のサブコマンドが存在すること

**Given** 期待される 50 サブコマンド名のリストがある場合
**When** `commands.git.subcommands` のキーと照合すると
**Then** 全 50 個の名前が一致すること

---

### Scenario: 既存サブコマンドの互換性
- **Property**: P2（既存サブコマンドの互換性）
- **Validates**: AC-8

**Given** 既存 12 サブコマンド（status, add, commit, push, pull, diff, log, clone, checkout, branch, reset, stash）の変更前の description と riskOverride がある場合
**When** 変更後の git.json の同サブコマンドを参照すると
**Then** `description.ja` と `description.en` と `riskOverride` が変更前と同一であること

---

### Scenario: コマンドレベルフラグの空化
- **Property**: P3（コマンドレベルフラグの空化）
- **Validates**: AC-3

**Given** `dictionary/tools/git.json` を読み込んだ場合
**When** `commands.git.flags` を参照すると
**Then** 空オブジェクト（キー数 0）であること

---

### Scenario: --force の push への移動
- **Property**: P4（--force の移動）
- **Validates**: AC-3, AC-4

**Given** `dictionary/tools/git.json` を読み込んだ場合
**When** `commands.git.subcommands.push.flags["--force"]` を参照すると
**Then** 存在し、`riskModifier` が `"critical"` であること
**And** `description.ja` と `description.en` が非空文字列であること

---

### Scenario: --hard の reset への移動
- **Property**: P5（--hard の移動）
- **Validates**: AC-3, AC-4

**Given** `dictionary/tools/git.json` を読み込んだ場合
**When** `commands.git.subcommands.reset.flags["--hard"]` を参照すると
**Then** 存在し、`riskModifier` が `"critical"` であること
**And** `description.ja` と `description.en` が非空文字列であること

---

### Scenario: 全フラグの description 存在
- **Property**: P6（全フラグの description 存在）
- **Validates**: AC-5

**Given** 全 50 サブコマンドの全フラグを走査する場合
**When** 各フラグの `description` を参照すると
**Then** `description.ja` が非空文字列であること
**And** `description.en` が非空文字列であること

---

### Scenario: 主要 riskModifier の検証
- **Property**: P7（riskModifier の妥当性）
- **Validates**: AC-4

**Given** 以下の破壊的フラグが定義されている場合:
- `push --force` → critical
- `push --mirror` → critical
- `reset --hard` → critical
- `clean -x` → critical
- `commit --amend` → high
- `branch -D` → high
- `rebase --interactive` → high
- `clean --force` → high
- `push --delete` → high
- `checkout --force` → high

**When** 各フラグの `riskModifier` を参照すると
**Then** 上記の期待値と一致すること

---

### Scenario: 新規サブコマンドの description 存在
- **Property**: P8（新規サブコマンドの description 存在）
- **Validates**: AC-6

**Given** 新規追加された 38 サブコマンドを走査する場合
**When** 各サブコマンドの `description` を参照すると
**Then** `description.ja` が非空文字列であること
**And** `description.en` が非空文字列であること

---

### Scenario: 新規サブコマンドの riskOverride 妥当性
- **Property**: P9（新規サブコマンドの riskOverride 妥当性）
- **Validates**: AC-6

**Given** 新規追加された各サブコマンドを参照する場合
**When** `riskOverride` を確認すると
**Then** 読み取り専用サブコマンド（show, blame 等）は `"low"` であること
**And** 変更系サブコマンド（merge, cherry-pick 等）は `"medium"` であること
**And** 履歴操作系サブコマンド（rebase, clean）は `"high"` であること

---

### Scenario: スキーマ適合
- **Property**: P10（スキーマ適合）
- **Validates**: AC-7

**Given** `dictionary/tools/git.json` を読み込んだ場合
**When** 各サブコマンドの構造を検証すると
**Then** 全サブコマンドに `description.ja` と `description.en` が存在すること
**And** `riskOverride` が存在する場合、`"low"` / `"medium"` / `"high"` / `"critical"` のいずれかであること
**And** `flags` が存在する場合、各フラグに `description.ja` と `description.en` が存在すること
**And** フラグの `riskModifier` が存在する場合、`"low"` / `"medium"` / `"high"` / `"critical"` のいずれかであること
