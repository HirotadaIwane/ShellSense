# Test Story — Unit 6 / Bolt 1: パーサー拡張（チェーン全分割）

> 入力コンテキスト: `design.md` (Property 1〜7)

---

## Scenario 1: 単一コマンドの互換性 (Property 1)

**Given** 単一コマンド `"ls -la"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 1`, `isChain === false`
**And** `segments[0].operator === null`
**And** `segments[0].parsed.commandName === "ls"`

## Scenario 2: 2コマンド && チェーン (Property 2)

**Given** チェーンコマンド `"rm -rf node_modules && npm install"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 2`, `isChain === true`
**And** `segments[0].parsed.commandName === "rm"`, `segments[0].operator === null`
**And** `segments[1].parsed.commandName === "npm"`, `segments[1].operator === "&&"`

## Scenario 3: 2コマンド || チェーン (Property 5)

**Given** チェーンコマンド `"cmd1 || cmd2"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 2`, `isChain === true`
**And** `segments[1].operator === "||"`

## Scenario 4: 2コマンド | パイプ (Property 5)

**Given** パイプコマンド `"ls -la | grep test"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 2`, `isChain === true`
**And** `segments[1].operator === "|"`

## Scenario 5: 2コマンド ; セミコロン (Property 5)

**Given** セミコロン連結 `"echo hello ; echo world"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 2`, `isChain === true`
**And** `segments[1].operator === ";"`

## Scenario 6: 3コマンドチェーン (Property 3)

**Given** 3コマンドチェーン `"mkdir -p /tmp/test && cd /tmp/test && ls"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 3`, `isChain === true`
**And** 各セグメントのcommandNameとoperatorが正しい

## Scenario 7: 引用符内の演算子は無視 (Property 4)

**Given** 引用符付きコマンド `"echo 'a && b'"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 1`, `isChain === false`

## Scenario 8: ダブルクォート内の演算子は無視 (Property 4)

**Given** ダブルクォート付きコマンド `'echo "a || b"'`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 1`, `isChain === false`

## Scenario 9: 各セグメントのフラグ・引数が正確 (Property 6)

**Given** `"rm -rf node_modules && npm install --save-dev vitest"`
**When** `parseChain()` を呼ぶ
**Then** `segments[0].parsed.flags` が `["-r", "-f"]` を含む
**And** `segments[0].parsed.args` が `["node_modules"]` を含む
**And** `segments[1].parsed.subcommand === "install"`
**And** `segments[1].parsed.flags` が `["--save-dev"]` を含む

## Scenario 10: 空文字列の安全処理 (Property 7)

**Given** 空文字列 `""`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 1`, `isChain === false`
**And** `segments[0].parsed.commandName === ""`

## Scenario 11: raw フィールドの保持

**Given** `"rm -rf foo && npm install"`
**When** `parseChain()` を呼ぶ
**Then** `raw === "rm -rf foo && npm install"`

## Scenario 12: 混合演算子チェーン (Property 3, 5)

**Given** `"cmd1 && cmd2 | cmd3 ; cmd4"`
**When** `parseChain()` を呼ぶ
**Then** `segments.length === 4`
**And** operators が `[null, "&&", "|", ";"]`
