# Test Story — Phase 17 Unit 4 Bolt 1: Tools辞書拡充 統合テスト

## 対応 Property / Requirement

- P1: 全ファイルが valid JSON (US-4.1)
- P2: サブコマンド数が期待値と一致 (US-4.2)
- P3: 全 description に ja/en が存在 (US-4.3)
- P4: critical/high の riskOverride が正しい (US-4.2)
- P5: riskModifier が適切に設定されている (US-4.2)
- P6: 既存テスト全 PASS (US-4.4)

---

### Scenario 1: JSON 構文の正当性 (P1)

**Given** dictionary/tools/ に npm.json, docker.json, pip.json が存在する場合
**When** 各ファイルを `JSON.parse()` すると
**Then** パースエラーが発生しないこと

---

### Scenario 2: サブコマンド数の検証 (P2)

**Given** npm.json が読み込まれた場合
**When** subcommands のキー数を数えると
**Then** 15 であること（既存4 + 新規11）

**Given** docker.json が読み込まれた場合
**When** subcommands のキー数を数えると
**Then** 30 であること（既存16 + 新規14）

**Given** pip.json が読み込まれた場合
**When** subcommands のキー数を数えると
**Then** 7 であること（既存4 + 新規3）

---

### Scenario 3: 新規サブコマンドの存在確認 (P2)

**Given** npm.json が読み込まれた場合
**When** subcommands を確認すると
**Then** init, uninstall, update, ci, audit, outdated, publish, link, unlink, cache clean, start が全て存在すること

**Given** docker.json が読み込まれた場合
**When** subcommands を確認すると
**Then** start, restart, kill, rmi, system prune, tag, inspect, cp, save, load, compose logs, compose exec, compose restart, compose pull が全て存在すること

**Given** pip.json が読み込まれた場合
**When** subcommands を確認すると
**Then** show, check, download が全て存在すること

---

### Scenario 4: バイリンガルカバレッジ (P3)

**Given** npm.json / docker.json / pip.json の全サブコマンドが読み込まれた場合
**When** 各サブコマンドの description を確認すると
**Then** 全てに ja と en フィールドが存在し、空でないこと

**Given** 全サブコマンドのフラグが読み込まれた場合
**When** 各フラグの description を確認すると
**Then** 全てに ja と en フィールドが存在し、空でないこと

---

### Scenario 5: riskOverride の検証 (P4)

**Given** docker.json が読み込まれた場合
**When** system prune の riskOverride を確認すると
**Then** "critical" であること

**Given** docker.json が読み込まれた場合
**When** kill, rmi の riskOverride を確認すると
**Then** "high" であること

**Given** npm.json が読み込まれた場合
**When** publish の riskOverride を確認すると
**Then** "high" であること

**Given** pip.json が読み込まれた場合
**When** show, check, download の riskOverride を確認すると
**Then** 全て "low" であること

---

### Scenario 6: riskModifier の検証 (P5)

**Given** docker.json の system prune が読み込まれた場合
**When** -a, --volumes の riskModifier を確認すると
**Then** "high" であること

**Given** docker.json の rmi が読み込まれた場合
**When** -f の riskModifier を確認すると
**Then** "high" であること

**Given** docker.json の compose exec が読み込まれた場合
**When** --privileged の riskModifier を確認すると
**Then** "high" であること

**Given** npm.json の audit が読み込まれた場合
**When** fix, --force の riskModifier を確認すると
**Then** "medium" であること

**Given** npm.json の uninstall が読み込まれた場合
**When** --global の riskModifier を確認すると
**Then** "medium" であること
