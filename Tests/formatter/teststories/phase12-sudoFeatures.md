# Test Story — Phase 12 Unit 1 Bolt 1: formatter 部分

> 分割元: `Tests/Phase12/Unit1/Bolt1/teststory.md`
> 対象セクション: flagDisplay (P5-P7) + sudoNotice (P8-P10) + sudoPrefix (P11-P13) + backwardCompat (P19-P21) + styleUpdate (P22)

---

## flagDisplay (P5-P7)

### Scenario: サブコマンドフラグ説明の優先表示
- **Property**: P5
- **Validates**: Requirements 3.1

**Given** `git push --force` で push.flags["--force"] に description がある場合
**When** formatter がフラグ説明を生成すると
**Then** push.flags の description が表示されること

### Scenario: コマンドフラグ説明のフォールバック
- **Property**: P6
- **Validates**: Requirements 3.1

**Given** `git status --version` で status.flags になく git.flags にある場合
**When** formatter がフラグ説明を生成すると
**Then** git.flags の description にフォールバックして表示されること

### Scenario: フラグ説明の非表示
- **Property**: P7
- **Validates**: Requirements 3.1

**Given** `git push --unknown` でどちらの flags にもフラグがない場合
**When** formatter がフラグ説明を生成すると
**Then** そのフラグの説明行は出力されないこと

---

## sudoNotice (P8-P10)

### Scenario: sudoNotice 表示
- **Property**: P8
- **Validates**: Requirements 4.1

**Given** `sudo rm file.txt` で hasSudo=true、labels.sudoNotice が定義されている場合
**When** formatter が出力を生成すると
**Then** sudoNotice の内容がインデント付きで出力されること

### Scenario: sudoNotice 非表示（hasSudo=false）
- **Property**: P9
- **Validates**: Requirements 4.1

**Given** `rm file.txt` で hasSudo=false の場合
**When** formatter が出力を生成すると
**Then** sudoNotice は出力されないこと

### Scenario: sudoNotice 非表示（ラベル未定義）
- **Property**: P10
- **Validates**: Requirements 4.1

**Given** hasSudo=true だが labels.sudoNotice が undefined の場合
**When** formatter が出力を生成すると
**Then** sudoNotice は出力されないこと

---

## sudoPrefix (P11-P13)

### Scenario: sudo プレフィックス（detailed）
- **Property**: P11
- **Validates**: Requirements 4.4

**Given** `sudo rm file.txt` で hasSudo=true、detailed 形式の場合
**When** formatter が commandDescription を生成すると
**Then** "sudo rm" のように "sudo " プレフィックスが付加されること

### Scenario: sudo プレフィックス（compact）
- **Property**: P12
- **Validates**: Requirements 4.4

**Given** `sudo rm file.txt` で hasSudo=true、compact 形式の場合
**When** formatter が出力を生成すると
**Then** "sudo rm" のように "sudo " プレフィックスが付加されること

### Scenario: sudo プレフィックスなし
- **Property**: P13
- **Validates**: Requirements 4.4

**Given** `rm file.txt` で hasSudo=false の場合
**When** formatter が commandDescription を生成すると
**Then** "sudo " プレフィックスは付加されないこと

---

## backwardCompat (P19-P21)

### Scenario: flags なし辞書のリスク評価
- **Property**: P19
- **Validates**: Requirements 7.1

**Given** SubcommandEntry に flags がない既存辞書コマンドの場合
**When** riskAssessor がリスクを評価すると
**Then** コマンドレベルの flags にフォールバックして正常に評価されること

### Scenario: flags なし辞書のフォーマッター
- **Property**: P20
- **Validates**: Requirements 7.1

**Given** SubcommandEntry に flags がない既存辞書コマンドの場合
**When** formatter がフラグ説明を生成すると
**Then** コマンドレベルの flags の説明が表示されること

### Scenario: 型コンパイル
- **Property**: P21
- **Validates**: Requirements 1.1

**Given** SubcommandEntry.flags がオプショナルの場合
**When** 既存コードをコンパイルすると
**Then** 型エラーなく通過すること

---

## styleUpdate (P22)

### Scenario: 全スタイルの sudoNotice 対応
- **Property**: P22
- **Validates**: Requirements 6.1

**Given** 4つのスタイル JSON（emoji, minimal, ascii, pro）を確認する場合
**When** labels と layout を検証すると
**Then** 全てに sudoNotice ラベル（ja/en）と detailedSingle/detailedChainSegment のレイアウト配置があること
