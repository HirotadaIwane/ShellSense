# Test Story — Unit 1 / Bolt 2: コマンド辞書

> 入力コンテキスト: `design.md` (Correctness Properties 1〜8)

---

### Scenario 1: 19コマンドの網羅性
- **Property**: 1
- **Validates**: AC-1.2

**Given** `dictionary/commands.json` が読み込まれた場合
**When** `commands` オブジェクトのキー数を確認すると
**Then** ちょうど19個であること

**Given** `commands` オブジェクトのキーを確認する場合
**When** 各キー名を検証すると
**Then** ls, cat, mkdir, rm, cp, mv, touch, git, npm, pip, grep, find, curl, chmod, cd, pwd, echo, node, python がすべて存在すること

---

### Scenario 2: 必須フィールドの存在
- **Property**: 2
- **Validates**: AC-1.3

**Given** 全19コマンドについて
**When** 各エントリの必須フィールドを確認すると
**Then** `name` (string) が存在すること
**And** `description.ja` (string) が存在すること
**And** `description.en` (string) が存在すること
**And** `baseRisk` が "low", "medium", "high", "critical" のいずれかであること
**And** `category` が7カテゴリのいずれかであること

---

### Scenario 3: baseRiskの正確性
- **Property**: 3
- **Validates**: AC-1.6

**Given** 各コマンドのbaseRiskを確認する場合
**When** Specs.md Section 4 の定義と比較すると
**Then** ls, cat, grep, find, cd, pwd, echo は "low" であること
**And** git, npm のベースリスクは "low" であること
**And** mkdir, cp, mv, touch, pip, curl, node, python は "medium" であること
**And** rm, chmod は "high" であること

---

### Scenario 4: gitサブコマンドの完全性
- **Property**: 4
- **Validates**: AC-1.4

**Given** git エントリの subcommands を確認する場合
**When** サブコマンド数とキー名を検証すると
**Then** 12個のサブコマンドが存在すること: status, add, commit, push, pull, diff, log, clone, checkout, branch, reset, stash
**And** 各サブコマンドに description.ja が存在すること
**And** 各サブコマンドに riskOverride が存在すること

---

### Scenario 5: npmサブコマンドの完全性
- **Property**: 5
- **Validates**: AC-1.4

**Given** npm エントリの subcommands を確認する場合
**When** サブコマンド数とキー名を検証すると
**Then** 4個のサブコマンドが存在すること: install, run, test, build

---

### Scenario 6: rmフラグの正確性
- **Property**: 6
- **Validates**: AC-1.5

**Given** rm エントリの flags を確認する場合
**When** フラグ定義を検証すると
**Then** -r, -f, -i が定義されていること
**And** -r の riskModifier が "high" であること
**And** -f の riskModifier が "high" であること

---

### Scenario 7: gitフラグの正確性
- **Property**: 7
- **Validates**: AC-1.5

**Given** git エントリの flags を確認する場合
**When** フラグ定義を検証すると
**Then** --force, --hard が定義されていること
**And** --force の riskModifier が "critical" であること
**And** --hard の riskModifier が "critical" であること

---

### Scenario 8: JSONパースとTypeScript型整合性
- **Property**: 8
- **Validates**: AC-1.1, AC-1.7

**Given** `dictionary/commands.json` を読み込む場合
**When** JSONパースして型チェックすると
**Then** パースエラーが発生しないこと
**And** トップレベルに version フィールド ("1.0.0") が存在すること
**And** commands を `Record<string, CommandEntry>` として扱えること
