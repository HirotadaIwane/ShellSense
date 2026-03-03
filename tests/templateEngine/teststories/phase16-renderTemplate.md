# Test Story — Phase 16 Unit 1 Bolt 1

> 入力コンテキスト: `Phase16_JsonStructureImprove/Unit1/Bolt1/design.md` (Correctness Properties + Testing Strategy)

---

## Scenario 1: 基本プレースホルダー置換

- **Property**: 1（基本プレースホルダー置換）
- **Validates**: R1.1

**Given** テンプレート `"{header}\n{risk}"` と値 `{ header: "</>", risk: "🟢 低" }` が渡された場合、
**When** `renderTemplate()` を実行すると、
**Then** 出力は `"</>\n🟢 低"` であること。

---

## Scenario 2: 同一行に複数プレースホルダー

- **Property**: 1（基本プレースホルダー置換）
- **Validates**: R1.2

**Given** テンプレート `"{a} - {b}"` と値 `{ a: "X", b: "Y" }` が渡された場合、
**When** `renderTemplate()` を実行すると、
**Then** 出力は `"X - Y"` であること。

---

## Scenario 3: 複数行展開

- **Property**: 2（複数行展開）
- **Validates**: R1.3

**Given** テンプレート `"{command}\n{flags}\n{target}"` と値:
- `command: "rm::削除"`
- `flags: ["  -r: 再帰", "  -f: 強制"]`
- `target: "  対象: foo"`

**When** `renderTemplate()` を実行すると、
**Then** 出力は4行であること（command 1行 + flags 2行 + target 1行）。

---

## Scenario 4: 空値の行除去

- **Property**: 3（空値の行除去）
- **Validates**: R1.4

**Given** テンプレート `"{header}\n{risk}\n{flags}\n{target}"` と値:
- `header: "</>"`, `risk: "🟢 低"`, `flags: ""`, `target: ""`

**When** `renderTemplate()` を実行すると、
**Then** 出力は2行（`header` と `risk` のみ）であること。

---

## Scenario 5: 空配列の行除去

- **Property**: 3（空値の行除去）
- **Validates**: R1.5

**Given** テンプレート `"{command}\n{flags}\n{target}"` と値:
- `command: "ls::一覧"`, `flags: []`, `target: ""`

**When** `renderTemplate()` を実行すると、
**Then** 出力は1行（`command` のみ）であること。

---

## Scenario 6: separator の空行保持

- **Property**: 4（separator の空行保持）
- **Validates**: R1.6

**Given** テンプレート `"{risk}\n{separator}\n{command}"` と値:
- `risk: "🟢 低"`, `command: "ls::一覧"`

**When** `renderTemplate()` を実行すると、
**Then** 出力は3行であり、2行目は空行であること。

---

## Scenario 7: 未定義プレースホルダーの透過

- **Property**: 5（未定義プレースホルダーの透過）
- **Validates**: R1.7

**Given** テンプレート `"{header}\n{unknown}\n{risk}"` と値:
- `header: "</>"`, `risk: "🟢 低"`（`unknown` キーなし）

**When** `renderTemplate()` を実行すると、
**Then** 出力は3行であり、2行目は `"{unknown}"` のまま出力されること。

---

## Scenario 8: 固定テキストの透過

- **Property**: 6（固定テキストの透過）
- **Validates**: R1.8

**Given** テンプレート `"{header}\n---\n{risk}"` と値:
- `header: "</>"`, `risk: "🟢 低"`

**When** `renderTemplate()` を実行すると、
**Then** 出力は3行であり、2行目は `"---"` であること。

---

## Scenario 9: TemplateLabels 型の正確性

- **Property**: 7（TemplateLabels 型の正確性）
- **Validates**: R2.1, R2.2, R2.3, R2.4

**Given** `src/types.ts` に `TemplateLabels` 型が定義されている場合、
**When** 必須フィールドと演算子インデックスシグネチャを持つオブジェクトを `TemplateLabels` に代入すると、
**Then** TypeScript コンパイルが成功すること。
AND 既存の `LanguageLabels` 型は削除されていないこと。
