# Test Story — Phase 16 Unit 1 Bolt 2: buildPlaceholderValues()

> 入力コンテキスト: `Phase16_JsonStructureImprove/Unit1/Bolt2/design.md` (Correctness Properties 1-7)

---

## Property 1: 既知コマンドの `{command}` 生成

### Scenario 1.1: 通常コマンド
- **Property**: 1
- **Validates**: R1.1

**Given** 既知コマンド `rm`（description.ja: "ファイルやディレクトリを削除する"）、delimiter: " — "
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値は `"rm — ファイルやディレクトリを削除する"` であること

### Scenario 1.2: サブコマンド付きコマンド
- **Property**: 1
- **Validates**: R1.2

**Given** コマンド `docker`、サブコマンド `compose up`（description.ja: "コンテナを作成して起動する"）
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値は `"docker compose up — コンテナを作成して起動する"` であること
（commandName + " " + subcommand + delimiter + subcommand.description）

### Scenario 1.3: sudo プレフィックス付き
- **Property**: 1
- **Validates**: R1.4

**Given** `hasSudo: true` の `rm` コマンド
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値は `"sudo rm — ファイルやディレクトリを削除する"` であること

### Scenario 1.4: チェーン番号付き
- **Property**: 1
- **Validates**: R1.5

**Given** `chainNumber: 2`、chainNumbering: "dot" の `rm` コマンド
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値の先頭に `"2. "` が付与されること（`"2. rm — ファイルやディレクトリを削除する"`）

### Scenario 1.5: sudo + チェーン番号の複合
- **Property**: 1
- **Validates**: R1.4, R1.5

**Given** `hasSudo: true`、`chainNumber: 1`、chainNumbering: "dot" の `rm` コマンド
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値は `"1. sudo rm — ファイルやディレクトリを削除する"` であること
（chainPrefix + sudoPrefix + commandName + delimiter + description の順序）

---

## Property 2: 未知コマンドの `{command}` 生成

### Scenario 2.1: 未知コマンド
- **Property**: 2
- **Validates**: R1.3

**Given** 未知コマンド `foo`（`entry: null`）、unknownCommand: "このコマンドはShellSenseの辞書に未登録です"
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値は `"foo — このコマンドはShellSenseの辞書に未登録です"` であること

### Scenario 2.2: 未知コマンド + sudo
- **Property**: 2
- **Validates**: R1.3, R1.4

**Given** 未知コマンド `foo`（`entry: null`）、`hasSudo: true`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `command` の値は `"sudo foo — このコマンドはShellSenseの辞書に未登録です"` であること

---

## Property 3: `{flags}` 生成

### Scenario 3.1: 複数フラグあり
- **Property**: 3
- **Validates**: R1.6

**Given** コマンド `rm`、フラグ `["-r", "-f"]`、entry に `-r`（"再帰的に削除する"）と `-f`（"確認なしで強制削除する"）がある、indent: "  "
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `flags` の値は `["  -r: 再帰的に削除する", "  -f: 確認なしで強制削除する"]` であること

### Scenario 3.2: フラグなし
- **Property**: 3
- **Validates**: R1.7

**Given** フラグが空 `[]` のコマンド
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `flags` の値は空配列 `[]` であること

### Scenario 3.3: 辞書にないフラグはスキップ
- **Property**: 3
- **Validates**: R1.6

**Given** フラグ `["-r", "-x"]`、entry に `-r` のみ定義（`-x` は未定義）
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `flags` の値は `["  -r: 再帰的に削除する"]` のみであること（`-x` はスキップ）

### Scenario 3.4: サブコマンドのフラグ優先
- **Property**: 3
- **Validates**: R1.6

**Given** サブコマンド `up` にフラグ `-d`（"デタッチモードで起動"）が定義されている
**When** `buildPlaceholderValues()` を呼び出すと
**Then** サブコマンドのフラグ定義が使用されること

### Scenario 3.5: 未知コマンドのフラグ
- **Property**: 3
- **Validates**: R1.7

**Given** 未知コマンド（`entry: null`）、フラグ `["-f"]`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `flags` の値は空配列 `[]` であること

---

## Property 4: `{target}` 生成

### Scenario 4.1: 引数あり
- **Property**: 4
- **Validates**: R1.8

**Given** 引数 `["node_modules", "dist"]`、indent: "  "、target ラベル: "対象:"
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `target` の値は `"  対象: node_modules, dist"` であること

### Scenario 4.2: 引数なし
- **Property**: 4
- **Validates**: R1.9

**Given** 引数が空 `[]`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `target` の値は空文字 `""` であること

---

## Property 5: `{sudo}` 生成

### Scenario 5.1: sudo あり
- **Property**: 5
- **Validates**: R1.10

**Given** `hasSudo: true`、indent: "  "、sudoNotice: "sudo: 管理者権限で実行されます（リスクが昇格します）"
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `sudo` の値は `"  sudo: 管理者権限で実行されます（リスクが昇格します）"` であること

### Scenario 5.2: sudo なし
- **Property**: 5
- **Validates**: R1.11

**Given** `hasSudo: false`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `sudo` の値は空文字 `""` であること

---

## Property 6: `{risk}` ラベル解決

### Scenario 6.1: long モードでのリスクラベル
- **Property**: 6
- **Validates**: R1.12

**Given** `isShort: false`（またはデフォルト）、`RiskLevel.Low`、`risk_low: "🟢 低（読み取り専用）"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `risk` の値は `"🟢 低（読み取り専用）"` であること

### Scenario 6.2: short モードでのリスクラベル
- **Property**: 6
- **Validates**: R1.13

**Given** `isShort: true`、`RiskLevel.Low`、`risk_low_short: "LOW"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `risk` の値は `"LOW"` であること

### Scenario 6.3: `_short` フォールバック
- **Property**: 6
- **Validates**: R1.14

**Given** `isShort: true`、`RiskLevel.Low`、`risk_low_short` が未定義（空文字）
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `risk` の値は `risk_low`（デフォルト）にフォールバックすること

### Scenario 6.4: 未知コマンドのリスク（long）
- **Property**: 6
- **Validates**: R1.15

**Given** `entry: null`（未知コマンド）、`isShort: false`、`unknownRisk: "⚠️ 不明"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `risk` の値は `"⚠️ 不明"` であること

### Scenario 6.5: 未知コマンドのリスク（short）
- **Property**: 6
- **Validates**: R1.16

**Given** `entry: null`、`isShort: true`、`unknownRisk_short: "???"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `risk` の値は `"???"` であること

---

## Property 7: 静的プレースホルダー解決

### Scenario 7.1: header
- **Property**: 7
- **Validates**: R1.17

**Given** `labels.header: "---"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `header` の値は `"---"` であること

### Scenario 7.2: operator
- **Property**: 7
- **Validates**: R1.18

**Given** `operator: "&&"`、`labels["operator_&&"]: "━✅━▸"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `operator` の値は `"━✅━▸"` であること

### Scenario 7.3: operator 未指定
- **Property**: 7
- **Validates**: R1.18

**Given** `operator` が未指定
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `operator` の値は空文字 `""` であること

### Scenario 7.4: chainNotice あり
- **Property**: 7
- **Validates**: R1.19

**Given** `isChain: true`、`labels.chainNotice: "チェーンコマンド"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `chainNotice` の値は `"チェーンコマンド"` であること

### Scenario 7.5: chainNotice なし
- **Property**: 7
- **Validates**: R1.20

**Given** `isChain: false`（またはデフォルト）
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `chainNotice` の値は空文字 `""` であること

### Scenario 7.6: overallRisk
- **Property**: 7
- **Validates**: R1.22

**Given** `RiskLevel.High`、`isShort: false`、`risk_high: "🔴 高（破壊操作）"`
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `overallRisk` の値は `"🔴 高（破壊操作）"` であること

### Scenario 7.7: separator
- **Property**: 7
- **Validates**: design.md の separator 設計判断

**Given** 任意の入力
**When** `buildPlaceholderValues()` を呼び出すと
**Then** `separator` の値は常に空文字 `""` であること
