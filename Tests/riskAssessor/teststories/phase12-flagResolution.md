# Test Story — Phase 12 Unit 1 Bolt 1: riskAssessor 部分

> 分割元: `Tests/Phase12/Unit1/Bolt1/teststory.md`
> 対象セクション: flagResolution (P1-P4) + sudoEscalation (P14-P18)

---

## flagResolution (P1-P4)

### Scenario: サブコマンドフラグ優先解決
- **Property**: P1
- **Validates**: Requirements 2.1

**Given** `git push --force` で push.flags に `--force` が定義されている場合
**When** riskAssessor がフラグリスクを評価すると
**Then** push.flags["--force"].riskModifier (critical) が使用されること

### Scenario: コマンドフラグフォールバック
- **Property**: P2
- **Validates**: Requirements 2.1

**Given** `git status --version` で status.flags に `--version` がなく、git.flags に `--version` がある場合
**When** riskAssessor がフラグリスクを評価すると
**Then** git.flags["--version"].riskModifier にフォールバックすること

### Scenario: サブコマンドなしのフラグ解決
- **Property**: P3
- **Validates**: Requirements 2.2

**Given** `rm -rf` でサブコマンドが null の場合
**When** riskAssessor がフラグリスクを評価すると
**Then** コマンドレベルの flags のみが参照されること

### Scenario: フラグ未定義時の無視
- **Property**: P4
- **Validates**: Requirements 2.1

**Given** `git push --unknown` でどちらの flags にもフラグがない場合
**When** riskAssessor がフラグリスクを評価すると
**Then** そのフラグはリスク評価に影響しないこと

---

## sudoEscalation (P14-P18)

### Scenario: sudo リスク昇格（Low → High）
- **Property**: P14
- **Validates**: Requirements 5.1

**Given** baseRisk=low のコマンドに hasSudo=true の場合
**When** riskAssessor がリスクを評価すると
**Then** 最終リスクは high になること

### Scenario: sudo リスク昇格（Medium → High）
- **Property**: P15
- **Validates**: Requirements 5.1

**Given** baseRisk=medium のコマンドに hasSudo=true の場合
**When** riskAssessor がリスクを評価すると
**Then** 最終リスクは high になること

### Scenario: sudo リスク昇格（High → Critical）
- **Property**: P16
- **Validates**: Requirements 5.1

**Given** baseRisk=high のコマンドに hasSudo=true の場合
**When** riskAssessor がリスクを評価すると
**Then** 最終リスクは critical になること

### Scenario: sudo リスク昇格（Critical → Critical）
- **Property**: P17
- **Validates**: Requirements 5.1

**Given** baseRisk=critical のコマンドに hasSudo=true の場合
**When** riskAssessor がリスクを評価すると
**Then** 最終リスクは critical のままであること

### Scenario: sudo なしの非昇格
- **Property**: P18
- **Validates**: Requirements 5.1

**Given** baseRisk=low のコマンドに hasSudo=false の場合
**When** riskAssessor がリスクを評価すると
**Then** リスク昇格は発生しないこと
