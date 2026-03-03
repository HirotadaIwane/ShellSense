# Test Story — Unit 3 / Bolt 1: リスク評価エンジン

> 入力コンテキスト: `design.md` (Correctness Properties 1〜7)

---

### Scenario 1: 辞書ベースリスクの取得
- **Property**: 1
- **Validates**: AC-1.1

**Given** ParsedCommand `ls -la` と辞書エントリ（baseRisk: low）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.Low が返ること

**Given** ParsedCommand `rm file.txt` と辞書エントリ（baseRisk: high）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.High が返ること

---

### Scenario 2: サブコマンド riskOverride の優先適用
- **Property**: 2
- **Validates**: AC-1.2

**Given** ParsedCommand `git status` と辞書エントリ（status の riskOverride: low）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.Low が返ること（baseRisk: low ではなく riskOverride: low）

**Given** ParsedCommand `git reset` と辞書エントリ（reset の riskOverride: high）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.High が返ること

---

### Scenario 3: フラグ riskModifier の最大値取得
- **Property**: 3
- **Validates**: AC-1.3

**Given** ParsedCommand `rm -rf node_modules` と辞書エントリ（-r: high, -f: high）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.High が返ること（baseRisk: high, flagRisk: high）

---

### Scenario 4: max(baseRisk, flagRisk, specialRisk) の算出
- **Property**: 4
- **Validates**: AC-1.4

**Given** ParsedCommand `git reset --hard` と辞書エントリ（reset riskOverride: high, --hard riskModifier: critical）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.Critical が返ること（flagRisk が baseRisk を上回る）

**Given** ParsedCommand `git push --force` と辞書エントリ（push riskOverride: medium, --force riskModifier: critical）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.Critical が返ること

---

### Scenario 5: sudo による critical 昇格
- **Property**: 5
- **Validates**: AC-1.5

**Given** ParsedCommand `sudo chmod 777 /`（hasSudo: true）と辞書エントリ（baseRisk: high）が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.Critical が返ること

---

### Scenario 6: 未知コマンドのデフォルト medium
- **Property**: 6
- **Validates**: AC-1.6

**Given** ParsedCommand `unknowncmd` と entry = null が入力された場合
**When** assessRisk を実行すると
**Then** RiskLevel.Medium が返ること

---

### Scenario 7: Specs.md 計算例9パターンの完全一致
- **Property**: 7
- **Validates**: AC-1.7

**Given** Specs.md Section 6 の計算例テーブルの9パターンすべて
**When** assessRisk を各パターンで実行すると
**Then** 以下の結果が得られること:

| コマンド | 期待値 |
|---------|--------|
| `ls -la` | low |
| `rm file.txt` | high |
| `rm -rf node_modules` | high |
| `git status` | low |
| `git reset --hard` | critical |
| `git push --force` | critical |
| `npm install` | medium |
| `sudo chmod 777 /` | critical |
| `curl https://example.com` | medium |
