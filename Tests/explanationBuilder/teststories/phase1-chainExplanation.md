# Test Story — Phase 1 Unit 6 Bolt 2: explanationBuilder 部分

> 分割元: `Tests/Phase1/Unit6/Bolt2/teststory.md`
> 対象セクション: Scenario 1-10 (buildChainExplanation)

---

## Scenario 1: [ShellSense] プレフィックスの存在 (Property 1)

**Given** 2コマンドチェーン rm && npm install のセグメントデータ
**When** `buildChainExplanation()` を呼ぶ
**Then** 出力に `[ShellSense]` プレフィックスを含む

## Scenario 2: 全コマンドの番号付き説明 (Property 2)

**Given** 2コマンドチェーン rm && npm install のセグメントデータ
**When** `buildChainExplanation()` を呼ぶ
**Then** `1. rm —` と `2. npm install —` を含む

## Scenario 3: 各コマンドのフラグ・引数表示 (Property 3)

**Given** rm -rf node_modules && npm install のセグメントデータ
**When** `buildChainExplanation()` を呼ぶ
**Then** `-r:` と `-f:` と `対象: node_modules` を含む

## Scenario 4: 演算子の日本語説明 (Property 4)

**Given** && で連結されたチェーン
**When** `buildChainExplanation()` を呼ぶ
**Then** `&&（成功したら次を実行）` を含む

## Scenario 5: || 演算子の日本語説明 (Property 4)

**Given** || で連結されたチェーン
**When** `buildChainExplanation()` を呼ぶ
**Then** `||（失敗したら次を実行）` を含む

## Scenario 6: | 演算子の日本語説明 (Property 4)

**Given** | で連結されたチェーン
**When** `buildChainExplanation()` を呼ぶ
**Then** `|（出力を次のコマンドに渡す）` を含む

## Scenario 7: ; 演算子の日本語説明 (Property 4)

**Given** ; で連結されたチェーン
**When** `buildChainExplanation()` を呼ぶ
**Then** `;（順番に実行）` を含む

## Scenario 8: 総合リスクレベル（最大値） (Property 5)

**Given** rm(high) && npm install(medium) のセグメントデータ
**When** `buildChainExplanation()` を呼ぶ
**Then** `⚠️ 高（削除・上書きを含む）` を含む

## Scenario 9: 未知コマンドのチェーン処理 (Property 7)

**Given** unknowncmd(entry=null) && ls のセグメントデータ
**When** `buildChainExplanation()` を呼ぶ
**Then** `unknowncmd — このコマンドはShellSenseの辞書に未登録です` を含む
**And** `ls —` の説明も含む

## Scenario 10: 3コマンドチェーン (Property 2)

**Given** 3コマンドチェーンのセグメントデータ
**When** `buildChainExplanation()` を呼ぶ
**Then** `1.`, `2.`, `3.` の番号付き説明を含む
