# Test Story — Unit 4 Bolt 2: パーサー動的化 + 複合サブコマンド対応

> 入力コンテキスト: `Phase2/Unit4/Bolt2/design.md` (Correctness Properties P1-P9)

## Scenario 1: パラメータ追加
- **Property**: P1（パラメータ追加）
- **Validates**: AC-1

**Given** `parse()` に第2引数 `["docker", "git", "npm", "pip"]` を渡した場合
**When** `"docker run nginx"` をパースすると
**Then** `commandName` が `"docker"`、`subcommand` が `"run"` であること

**Given** `parseChain()` に第2引数を渡した場合
**When** `"docker run nginx && git status"` をパースすると
**Then** 両セグメントで `subcommand` が正しく抽出されること

## Scenario 2: デフォルト後方互換
- **Property**: P2（デフォルト後方互換）
- **Validates**: AC-2

**Given** `parse()` を第2引数なしで呼び出した場合
**When** `"git status"` をパースすると
**Then** `subcommand` が `"status"` であること（デフォルトリストに git が含まれる）

**Given** `parse()` を第2引数なしで呼び出した場合
**When** `"docker run nginx"` をパースすると
**Then** `subcommand` が `null` であること（デフォルトリストに docker は含まれない）

## Scenario 3: 動的リスト適用
- **Property**: P3（動的リスト適用）
- **Validates**: AC-1

**Given** `parse()` に `["docker", "kubectl"]` を渡した場合
**When** `"kubectl apply -f deploy.yaml"` をパースすると
**Then** `subcommand` が `"apply"` であること

**Given** `parse()` に `["docker"]` を渡した場合（git を含まない）
**When** `"git status"` をパースすると
**Then** `subcommand` が `null` であること（リストに git がないため）

## Scenario 4: 複合サブコマンド解決
- **Property**: P6, P7（複合サブコマンド解決、単純サブコマンド非干渉）
- **Validates**: AC-3

**Given** docker 辞書エントリに `"compose up"` サブコマンドが定義されている場合
**When** パース結果 `subcommand: "compose"`, `args: ["up", "-d"]` を `resolveCompoundSubcommand` で処理すると
**Then** `subcommand` が `"compose up"`、`args` が `["-d"]` になること

**Given** docker 辞書エントリに `"run"` サブコマンドが定義されている場合
**When** パース結果 `subcommand: "run"`, `args: ["nginx"]` を `resolveCompoundSubcommand` で処理すると
**Then** `subcommand` が `"run"` のまま、`args` が `["nginx"]` のままであること（複合ルックアップ不要）

**Given** docker 辞書エントリに `"compose down"` サブコマンドが定義されている場合
**When** パース結果 `subcommand: "compose"`, `args: ["down"]` を `resolveCompoundSubcommand` で処理すると
**Then** `subcommand` が `"compose down"`、`args` が `[]` になること

## Scenario 5: 未定義サブコマンドのフォールバック
- **Property**: P8（未定義サブコマンドのフォールバック）
- **Validates**: AC-3

**Given** 辞書エントリに `"unknown"` サブコマンドが存在しない場合
**When** パース結果 `subcommand: "unknown"`, `args: ["foo"]` を `resolveCompoundSubcommand` で処理すると
**Then** `subcommand` が `"unknown"` のまま、`args` が `["foo"]` のままであること

**Given** entry が `null` の場合
**When** `resolveCompoundSubcommand` を呼び出すと
**Then** 元の `subcommand` と `args` がそのまま返ること

## Scenario 6: E2E パイプライン
- **Property**: P9（E2E パイプライン）
- **Validates**: AC-4

**Given** `docker compose up -d` がフック入力として渡された場合
**When** ShellSense パイプライン全体で処理すると
**Then** additionalContext に `compose up` の日本語説明が含まれること
