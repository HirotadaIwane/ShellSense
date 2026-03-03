# Test Story — Phase 16 Unit 2 Bolt 2: formatter 部分

> 分割元: `Tests/Phase16/Unit2/Bolt2/teststory.md`
> 対象セクション: Property 3-7 (formatDetailed / formatCompact / API互換 / 多スタイル検証)

---

## Property 3: formatDetailedSingle の出力

### Scenario 3.1: 既知コマンド（emoji/ja）
- **Property**: 3
- **Validates**: R3.1

**Given** emoji スタイル / ja、`rm -rf node_modules`（既知コマンド、high リスク）
**When** `formatExplanation()` で detailed 出力を生成すると
**Then** 以下の構造の出力が生成されること:
```
</>
rm — ファイルやディレクトリを削除する
  -r: 再帰的に削除する
  -f: 確認なしで強制削除する
  対象: node_modules

⚠️ 高（削除・上書きを含む）
```

### Scenario 3.2: 未知コマンド（emoji/ja）
- **Property**: 3
- **Validates**: R3.2

**Given** emoji スタイル / ja、`foo`（未知コマンド、entry: null）
**When** `formatExplanation()` で detailed 出力を生成すると
**Then** 以下の構造の出力が生成されること:
```
</>
foo — このコマンドはShellSenseの辞書に未登録です

🔶 中（不明なコマンドのため注意してください）
```

### Scenario 3.3: sudo 付きコマンド（emoji/ja）
- **Property**: 3
- **Validates**: R3.3

**Given** emoji スタイル / ja、`sudo rm -rf /`（hasSudo: true）
**When** `formatExplanation()` で detailed 出力を生成すると
**Then** `command` に `sudo` プレフィックスが付き、`sudo` 行が表示されること

### Scenario 3.4: 既知コマンド（emoji/en）
- **Property**: 3
- **Validates**: R3.1

**Given** emoji スタイル / en、`rm -rf node_modules`
**When** `formatExplanation()` で detailed 出力を生成すると
**Then** 英語ラベルで出力が生成されること

---

## Property 4: formatDetailedChain の出力

### Scenario 4.1: 2セグメントチェーン（emoji/ja）
- **Property**: 4
- **Validates**: R4.1, R4.2, R4.3

**Given** emoji スタイル / ja、`cd /foo && git status`（2セグメント、operator: &&）
**When** `formatExplanation()` で detailed 出力を生成すると
**Then** header + segment1 + operator + segment2 + footer の構造で出力が生成され、
チェーン番号（`1. `, `2. `）が付与されること

---

## Property 5: formatCompact の出力

### Scenario 5.1: 単一コマンド compact（emoji/ja）
- **Property**: 5
- **Validates**: R5.1

**Given** emoji スタイル / ja、`ls -la /tmp`（compact 形式）
**When** `formatExplanation()` で compact 出力を生成すると
**Then** `[ShellSense 🟢 低] ls — ディレクトリの内容を一覧表示する` のような出力が生成されること

### Scenario 5.2: チェーン compact（emoji/ja）
- **Property**: 5
- **Validates**: R5.2, R5.3

**Given** emoji スタイル / ja、`cd /foo && git status`（compact 形式）
**When** `formatExplanation()` で compact 出力を生成すると
**Then** `{commands}` が ` | ` で結合された出力が生成されること

---

## Property 6: formatExplanation API 互換性

### Scenario 6.1: シグネチャ不変
- **Property**: 6
- **Validates**: R6.1

**Given** `formatExplanation` 関数
**When** 型シグネチャを検証すると
**Then** `(segments, operators, overallRisk, options) => string` であること

### Scenario 6.2: 分岐ロジック
- **Property**: 6
- **Validates**: R6.2

**Given** `format: "compact"` / `segments.length === 1` / `segments.length > 1` の各条件
**When** `formatExplanation()` を呼び出すと
**Then** それぞれ compact / detailedSingle / detailedChain の出力パターンが生成されること

---

## Property 7: 多スタイル検証

### Scenario 7.1: ascii スタイル detailed
- **Property**: 7
- **Validates**: R3.1（ascii）

**Given** ascii スタイル / ja、`rm -rf node_modules`
**When** detailed 出力を生成すると
**Then** `===` ヘッダー、`[!] High` リスクラベルで出力されること

### Scenario 7.2: minimal スタイル detailed
- **Property**: 7
- **Validates**: R3.1（minimal）

**Given** minimal スタイル / ja、`rm -rf node_modules`
**When** detailed 出力を生成すると
**Then** `---` ヘッダー、`高（削除・上書きを含む）` リスクラベルで出力されること

### Scenario 7.3: pro スタイル detailed
- **Property**: 7
- **Validates**: R3.1（pro）

**Given** pro スタイル / ja、`rm -rf node_modules`
**When** detailed 出力を生成すると
**Then** `---` ヘッダー、`High` リスクラベルで出力されること

### Scenario 7.4-7.6: 各スタイル compact
- **Property**: 7

各スタイルで compact 出力が正しいテンプレートで生成されること。
