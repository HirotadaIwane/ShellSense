# Test Story — Unit 3 Bolt 2: macOS辞書

> 入力コンテキスト: `Phase2/Unit3/Bolt2/design.md`（Correctness Properties P1〜P11）

---

## P1: ファイル存在と基本構造

### Scenario: macos.json の存在確認
- **Property**: P1（ファイル存在と構造）
- **Validates**: US-1

**Given** ShellSense の辞書ディレクトリが存在する場合
**When** `dictionary/os/macos.json` のパスを確認すると
**Then** ファイルが存在すること

### Scenario: 必須トップレベルフィールド
- **Property**: P1
- **Validates**: US-1

**Given** `dictionary/os/macos.json` を JSON として読み込んだ場合
**When** トップレベルのキーを確認すると
**Then** `version`, `metadata`, `commands` の3つが存在すること

---

## P2: metadata 整合性

### Scenario: version の値
- **Property**: P2（metadata 整合性）
- **Validates**: US-1

**Given** macos.json を読み込んだ場合
**When** `version` フィールドを確認すると
**Then** `"2.0.0"` であること

### Scenario: metadata.layer の値
- **Property**: P2
- **Validates**: US-1

**Given** macos.json の metadata を確認する場合
**When** `layer` フィールドを確認すると
**Then** `"os"` であること

### Scenario: metadata.name の値
- **Property**: P2
- **Validates**: US-1

**Given** macos.json の metadata を確認する場合
**When** `name` フィールドを確認すると
**Then** `"macos"` であること

### Scenario: metadata.os の値
- **Property**: P2
- **Validates**: US-1

**Given** macos.json の metadata を確認する場合
**When** `os` フィールドを確認すると
**Then** `"macos"` であること

---

## P3: コマンド数と存在確認

### Scenario: コマンド数
- **Property**: P3（コマンド数と存在確認）
- **Validates**: US-1

**Given** macos.json の commands を読み込んだ場合
**When** コマンドキーの数を確認すると
**Then** 正確に8個であること

### Scenario: 各コマンドの存在
- **Property**: P3
- **Validates**: US-2〜US-8

**Given** macos.json の commands を読み込んだ場合
**When** 各コマンドキーを確認すると
**Then** brew, open, pbcopy, pbpaste, defaults, launchctl, diskutil, dscl の8コマンドが全て存在すること

---

## P4: baseRisk の正確性

### Scenario: 各コマンドの baseRisk
- **Property**: P4（baseRisk の正確性）
- **Validates**: US-2〜US-8

**Given** macos.json の各コマンドを確認する場合
**When** baseRisk フィールドを検証すると
**Then** 以下の値であること:
  - brew: `"medium"`
  - open: `"low"`
  - pbcopy: `"low"`
  - pbpaste: `"low"`
  - defaults: `"medium"`
  - launchctl: `"medium"`
  - diskutil: `"high"`
  - dscl: `"high"`

---

## P5: category の正確性

### Scenario: brew の category
- **Property**: P5（category の正確性）
- **Validates**: US-2

**Given** brew コマンドの定義を確認する場合
**When** category を検証すると
**Then** `"package"` であること

### Scenario: system カテゴリのコマンド
- **Property**: P5
- **Validates**: US-5〜US-8

**Given** defaults, launchctl, diskutil, dscl の定義を確認する場合
**When** category を検証すると
**Then** 全て `"system"` であること

### Scenario: shell カテゴリのコマンド
- **Property**: P5
- **Validates**: US-3, US-4

**Given** open, pbcopy, pbpaste の定義を確認する場合
**When** category を検証すると
**Then** 全て `"shell"` であること

---

## P6: サブコマンド定義

### Scenario: brew のサブコマンド
- **Property**: P6（サブコマンド定義）
- **Validates**: US-2

**Given** brew のサブコマンドを確認する場合
**When** サブコマンドキーの数と内容を検証すると
**Then** 7つ（install, uninstall, update, upgrade, search, list, info）が存在すること

**Given** brew の各サブコマンドの riskOverride を確認する場合
**When** riskOverride を検証すると
**Then** 以下の値であること:
  - install: `"medium"`, uninstall: `"high"`, update: `"low"`, upgrade: `"medium"`
  - search: `"low"`, list: `"low"`, info: `"low"`

### Scenario: defaults のサブコマンド
- **Property**: P6
- **Validates**: US-5

**Given** defaults のサブコマンドを確認する場合
**When** サブコマンドキーの数と内容を検証すると
**Then** 3つ（read, write, delete）が存在すること

**Given** defaults の各サブコマンドの riskOverride を確認する場合
**When** riskOverride を検証すると
**Then** read: `"low"`, write: `"medium"`, delete: `"high"` であること

### Scenario: launchctl のサブコマンド
- **Property**: P6
- **Validates**: US-6

**Given** launchctl のサブコマンドを確認する場合
**When** サブコマンドキーの数と内容を検証すると
**Then** 5つ（load, unload, start, stop, list）が存在すること

**Given** launchctl の各サブコマンドの riskOverride を確認する場合
**When** riskOverride を検証すると
**Then** load: `"medium"`, unload: `"high"`, start: `"medium"`, stop: `"high"`, list: `"low"` であること

### Scenario: diskutil のサブコマンド
- **Property**: P6
- **Validates**: US-7

**Given** diskutil のサブコマンドを確認する場合
**When** サブコマンドキーの数と内容を検証すると
**Then** 5つ（list, info, erase, mount, unmount）が存在すること

**Given** diskutil の各サブコマンドの riskOverride を確認する場合
**When** riskOverride を検証すると
**Then** list: `"low"`, info: `"low"`, erase: `"critical"`, mount: `"medium"`, unmount: `"medium"` であること

---

## P8: 二言語完全性

### Scenario: コマンド description の二言語対応
- **Property**: P8（二言語完全性）
- **Validates**: US-9

**Given** macos.json の全コマンドを確認する場合
**When** 各コマンドの description を検証すると
**Then** 全てに `ja` と `en` が存在し、空文字でないこと

### Scenario: サブコマンド description の二言語対応
- **Property**: P8
- **Validates**: US-9

**Given** サブコマンドを持つ全コマンド（brew, defaults, launchctl, diskutil）を確認する場合
**When** 各サブコマンドの description を検証すると
**Then** 全てに `ja` と `en` が存在し、空文字でないこと

---

## P9: スキーマ適合性

### Scenario: 必須フィールドの存在
- **Property**: P9（スキーマ適合性）
- **Validates**: US-10

**Given** macos.json の全コマンドを確認する場合
**When** 各コマンドの必須フィールドを検証すると
**Then** name, description, baseRisk, category が全て存在すること

### Scenario: baseRisk の enum 値
- **Property**: P9
- **Validates**: US-10

**Given** macos.json の全コマンドを確認する場合
**When** baseRisk の値を検証すると
**Then** 全て ["low", "medium", "high", "critical"] のいずれかであること

### Scenario: category の enum 値
- **Property**: P9
- **Validates**: US-10

**Given** macos.json の全コマンドを確認する場合
**When** category の値を検証すると
**Then** 全て Phase 2 の11カテゴリのいずれかであること

### Scenario: riskOverride の enum 値
- **Property**: P9
- **Validates**: US-10

**Given** サブコマンドを持つ全コマンドを確認する場合
**When** riskOverride の値を検証すると
**Then** 全て ["low", "medium", "high", "critical"] のいずれかであること

---

## P10: ローダー互換性

### Scenario: totalCommands の検証
- **Property**: P10（ローダー互換性）
- **Validates**: US-10

**Given** dictionaryLoader で dictionary/ を読み込んだ場合
**When** metadata.totalCommands を確認すると
**Then** 61（37既存 + 11 Linux + 5 Tools + 8 macOS）であること

### Scenario: macOS コマンドのマージ確認
- **Property**: P10
- **Validates**: US-10

**Given** dictionaryLoader で dictionary/ を読み込んだ場合
**When** マージ結果を確認すると
**Then** macOS の8コマンド（brew, open, pbcopy, pbpaste, defaults, launchctl, diskutil, dscl）が全て含まれること

---

## P11: 既存テストリグレッションなし

### Scenario: linuxSchema.test.ts の totalCommands 更新
- **Property**: P11（リグレッションなし）
- **Validates**: US-10

**Given** linuxSchema.test.ts の totalCommands テストを 53 → 61 に更新した場合
**When** Phase 1 + Phase 2 の全テストを実行すると
**Then** 全テストがパスすること（リグレッションなし）
