# Test Story — Phase 1 Unit 6 Bolt 2: integration 部分

> 分割元: `Tests/Phase1/Unit6/Bolt2/teststory.md`
> 対象セクション: Scenario 11-12 (E2E)

---

## Scenario 11: E2E — チェーンコマンド (Property 8)

**Given** `{"tool_name":"Bash","tool_input":{"command":"rm -rf foo && npm install"}}`
**When** dist/index.js に stdin で渡す
**Then** additionalContext に `1. rm` と `2. npm install` を含む

## Scenario 12: E2E — 単一コマンド既存互換 (Property 9)

**Given** `{"tool_name":"Bash","tool_input":{"command":"ls -la"}}`
**When** dist/index.js に stdin で渡す
**Then** additionalContext が既存の形式と同じ（番号なし）
