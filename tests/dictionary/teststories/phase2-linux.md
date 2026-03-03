# Test Story — Phase 2 / Unit 3 / Bolt 1

> 入力コンテキスト: `Phase2/Unit3/Bolt1/design.md` (Correctness Properties P1-P11)

## linuxSchema.test.ts

### Scenario: ファイル存在と基本構造
- **Property**: P1（ファイル存在と構造）
- **Validates**: US-1

**Given** dictionary/os/linux.json が存在する場合
**When** ファイルを JSON としてパースすると
**Then** `version`, `metadata`, `commands` の3つの必須フィールドが存在すること

### Scenario: metadata 整合性
- **Property**: P2（metadata 整合性）
- **Validates**: US-1

**Given** linux.json の metadata を確認する場合
**When** `layer` フィールドを確認すると
**Then** `"os"` であること

**When** `name` フィールドを確認すると
**Then** `"linux"` であること

**When** `os` フィールドを確認すると
**Then** `"linux"` であること

**When** `version` フィールドを確認すると
**Then** `"2.0.0"` であること

### Scenario: 二言語完全性
- **Property**: P8（二言語完全性）
- **Validates**: US-9

**Given** linux.json の全コマンドの description を確認する場合
**When** `ja` と `en` フィールドを検証すると
**Then** 両方が存在し、空文字でないこと

**Given** サブコマンドを持つコマンド（apt, systemctl, service, ufw, ip）の各サブコマンドの description を確認する場合
**When** `ja` と `en` フィールドを検証すると
**Then** 両方が存在し、空文字でないこと

**Given** フラグを持つコマンド（journalctl, crontab）の各フラグの description を確認する場合
**When** `ja` と `en` フィールドを検証すると
**Then** 両方が存在し、空文字でないこと

### Scenario: スキーマ適合性
- **Property**: P9（スキーマ適合性）
- **Validates**: US-10

**Given** linux.json の全コマンドを確認する場合
**When** 必須フィールド（name, description, baseRisk, category）を検証すると
**Then** 全コマンドに存在すること

**When** baseRisk の値を検証すると
**Then** "low", "medium", "high", "critical" のいずれかであること

**When** category の値を検証すると
**Then** Phase 2 の11値のいずれかであること

**When** サブコマンドの riskOverride を検証すると
**Then** 存在する場合、"low", "medium", "high", "critical" のいずれかであること

**When** フラグの riskModifier を検証すると
**Then** 存在する場合、"low", "medium", "high", "critical" のいずれかであること

### Scenario: ローダー互換性
- **Property**: P10（ローダー互換性）
- **Validates**: US-10

**Given** dictionaryLoader で dictionary/ 全体を読み込んだ場合
**When** totalCommands を確認すると
**Then** 48（既存37 + Linux 11）であること

**When** Linux の11コマンド名で検索すると
**Then** 全て結果に含まれること

---

## linuxDictionary.test.ts

### Scenario: コマンド数と存在確認
- **Property**: P3（コマンド数と存在確認）
- **Validates**: US-1

**Given** linux.json の commands を確認する場合
**When** コマンド数を数えると
**Then** 正確に11であること

**When** コマンド名を列挙すると
**Then** apt, systemctl, journalctl, service, ufw, ip, ss, useradd, usermod, passwd, crontab が存在すること

### Scenario: baseRisk の正確性
- **Property**: P4（baseRisk の正確性）
- **Validates**: US-2〜US-8

**Given** linux.json の各コマンドを確認する場合
**When** apt の baseRisk を確認すると
**Then** `"medium"` であること

**When** systemctl の baseRisk を確認すると
**Then** `"medium"` であること

**When** journalctl の baseRisk を確認すると
**Then** `"low"` であること

**When** service の baseRisk を確認すると
**Then** `"medium"` であること

**When** ufw の baseRisk を確認すると
**Then** `"high"` であること

**When** ip の baseRisk を確認すると
**Then** `"low"` であること

**When** ss の baseRisk を確認すると
**Then** `"low"` であること

**When** useradd の baseRisk を確認すると
**Then** `"high"` であること

**When** usermod の baseRisk を確認すると
**Then** `"high"` であること

**When** passwd の baseRisk を確認すると
**Then** `"high"` であること

**When** crontab の baseRisk を確認すると
**Then** `"medium"` であること

### Scenario: category の正確性
- **Property**: P5（category の正確性）
- **Validates**: US-2〜US-8

**Given** linux.json の各コマンドを確認する場合
**When** apt の category を確認すると
**Then** `"package"` であること

**When** systemctl, journalctl, service, ufw, useradd, usermod, passwd, crontab の category を確認すると
**Then** 全て `"system"` であること

**When** ip, ss の category を確認すると
**Then** 全て `"network"` であること

### Scenario: apt のサブコマンド
- **Property**: P6（サブコマンド定義）
- **Validates**: US-2

**Given** apt のサブコマンドを確認する場合
**When** サブコマンドを列挙すると
**Then** install, remove, update, upgrade, search, list の6つが存在すること

**When** install の riskOverride を確認すると
**Then** `"medium"` であること

**When** remove の riskOverride を確認すると
**Then** `"high"` であること

**When** update の riskOverride を確認すると
**Then** `"low"` であること

**When** upgrade の riskOverride を確認すると
**Then** `"medium"` であること

**When** search の riskOverride を確認すると
**Then** `"low"` であること

**When** list の riskOverride を確認すると
**Then** `"low"` であること

### Scenario: systemctl のサブコマンド
- **Property**: P6（サブコマンド定義）
- **Validates**: US-3

**Given** systemctl のサブコマンドを確認する場合
**When** サブコマンドを列挙すると
**Then** start, stop, restart, enable, disable, status の6つが存在すること

**When** start の riskOverride を確認すると
**Then** `"medium"` であること

**When** stop の riskOverride を確認すると
**Then** `"high"` であること

**When** restart の riskOverride を確認すると
**Then** `"high"` であること

**When** enable の riskOverride を確認すると
**Then** `"medium"` であること

**When** disable の riskOverride を確認すると
**Then** `"medium"` であること

**When** status の riskOverride を確認すると
**Then** `"low"` であること

### Scenario: service のサブコマンド
- **Property**: P6（サブコマンド定義）
- **Validates**: US-3

**Given** service のサブコマンドを確認する場合
**When** サブコマンドを列挙すると
**Then** start, stop, restart, status の4つが存在すること

**When** stop の riskOverride を確認すると
**Then** `"high"` であること

**When** status の riskOverride を確認すると
**Then** `"low"` であること

### Scenario: ufw のサブコマンド
- **Property**: P6（サブコマンド定義）
- **Validates**: US-5

**Given** ufw のサブコマンドを確認する場合
**When** サブコマンドを列挙すると
**Then** enable, disable, allow, deny, status の5つが存在すること

**When** enable の riskOverride を確認すると
**Then** `"critical"` であること

**When** disable の riskOverride を確認すると
**Then** `"critical"` であること

**When** allow の riskOverride を確認すると
**Then** `"high"` であること

**When** deny の riskOverride を確認すると
**Then** `"high"` であること

**When** status の riskOverride を確認すると
**Then** `"low"` であること

### Scenario: ip のサブコマンド
- **Property**: P6（サブコマンド定義）
- **Validates**: US-6

**Given** ip のサブコマンドを確認する場合
**When** サブコマンドを列挙すると
**Then** addr, link, route の3つが存在すること

### Scenario: journalctl のフラグ
- **Property**: P7（フラグ定義）
- **Validates**: US-4

**Given** journalctl のフラグを確認する場合
**When** フラグを列挙すると
**Then** -f, -u, -n の3つが存在すること

### Scenario: crontab のフラグ
- **Property**: P7（フラグ定義）
- **Validates**: US-8

**Given** crontab のフラグを確認する場合
**When** フラグを列挙すると
**Then** -e, -l, -r の3つが存在すること

**When** -r の riskModifier を確認すると
**Then** `"high"` であること
