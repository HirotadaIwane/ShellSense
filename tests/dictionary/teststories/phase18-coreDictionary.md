# Test Story — Unit 7 Bolt 1: 統合テスト・検証

## Scenario: Core辞書ファイルのJSON構文検証
- **Property**: P7-1
- **Validates**: AC-7.1

**Given** 6つのcore辞書ファイル（filesystem, system, network, process, shell, text）が存在する場合
**When** 各ファイルを `JSON.parse()` で読み込むと
**Then** エラーが発生しないこと

---

## Scenario: 各辞書ファイルのコマンド数検証
- **Property**: P7-2
- **Validates**: AC-7.2

**Given** filesystem.json が読み込まれた場合
**When** コマンド数をカウントすると
**Then** 25コマンドが存在すること

**Given** system.json が読み込まれた場合
**When** コマンド数をカウントすると
**Then** 13コマンドが存在すること（sudoは含まない）

**Given** network.json が読み込まれた場合
**When** コマンド数をカウントすると
**Then** 9コマンドが存在すること

**Given** process.json が読み込まれた場合
**When** コマンド数をカウントすると
**Then** 13コマンドが存在すること

**Given** shell.json が読み込まれた場合
**When** コマンド数をカウントすると
**Then** 14コマンドが存在すること

**Given** text.json が読み込まれた場合
**When** コマンド数をカウントすると
**Then** 12コマンドが存在すること

---

## Scenario: バイリンガル検証（ja/en）
- **Property**: P7-3
- **Validates**: AC-7.3

**Given** core辞書の全コマンドが読み込まれた場合
**When** 各コマンドの description を走査すると
**Then** 全てに `ja` と `en` フィールドが存在し、空文字列でないこと

**Given** core辞書の全フラグが読み込まれた場合
**When** 各フラグの description を走査すると
**Then** 全てに `ja` と `en` フィールドが存在し、空文字列でないこと

**Given** ip コマンドのサブコマンドが読み込まれた場合
**When** 各サブコマンドの description を走査すると
**Then** 全てに `ja` と `en` フィールドが存在し、空文字列でないこと

---

## Scenario: リスク評価検証
- **Property**: P7-4
- **Validates**: AC-7.4

**Given** mount コマンドが辞書に存在する場合
**When** assessRisk() を実行すると
**Then** 結果が `critical` であること

**Given** su コマンドが辞書に存在する場合
**When** assessRisk() を実行すると
**Then** 結果が `critical` であること

**Given** rsync --delete コマンドが辞書に存在する場合
**When** assessRisk() を実行すると
**Then** 結果が `high` 以上であること

**Given** killall -9 コマンドが辞書に存在する場合
**When** assessRisk() を実行すると
**Then** 結果が `critical` であること

**Given** df コマンドが辞書に存在する場合
**When** assessRisk() を実行すると
**Then** 結果が `low` であること

---

## Scenario: ipサブコマンド構造検証
- **Property**: P7-2
- **Validates**: AC-3.2

**Given** ip コマンドが辞書に存在する場合
**When** subcommands を参照すると
**Then** addr, link, route, neigh の4サブコマンドが存在すること

**Given** ip route サブコマンドを参照する場合
**When** riskOverride を確認すると
**Then** `high` であること
