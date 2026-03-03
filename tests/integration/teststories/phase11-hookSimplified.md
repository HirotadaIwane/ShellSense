# Test Story — Bolt 2: Hook 簡素化検証

## Scenario 1: IPC ファイルが新フォーマットであること
- **Property**: P2（IPC ファイルが `{ command, ts }` 形式）
- **Validates**: AC-4.3

**Given** hook に `ls -la` コマンドの Bash 入力が渡された場合
**When** hook が処理を完了すると
**Then** IPC ファイルに `command` フィールド（文字列 `"ls -la"`）が存在すること
**And** `ts` フィールド（数値）が存在すること
**And** `ja`、`en`、`ja_compact`、`en_compact`、`risk` フィールドが存在しないこと

## Scenario 2: 空コマンドで IPC ファイルが生成されないこと
- **Property**: P3（空コマンド・非 Bash で IPC 非生成）
- **Validates**: AC-4.3

**Given** hook に空文字コマンドの Bash 入力が渡された場合
**When** hook が処理を完了すると
**Then** IPC ファイルが生成されていないこと
**And** stdout が `{}` であること

## Scenario 3: 非 Bash ツールで IPC ファイルが生成されないこと
- **Property**: P3（空コマンド・非 Bash で IPC 非生成）
- **Validates**: AC-4.3

**Given** hook に `tool_name: "Read"` の入力が渡された場合
**When** hook が処理を完了すると
**Then** IPC ファイルが生成されていないこと
**And** stdout が `{}` であること
