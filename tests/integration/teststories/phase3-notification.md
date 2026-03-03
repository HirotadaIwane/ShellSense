# Test Story — Unit 2 Bolt 1: 通知ロジック（純粋関数）

> 入力コンテキスト: `Phase3/Unit2/Bolt1/design.md` (Correctness Properties P1-P5)

---

## Scenario 1: meetsMinRisk — リスクフィルタリング全パターン
- **Property**: P4（meetsMinRisk の全パターン正確性）
- **Validates**: REQ-4

**Given** リスクレベル Low, Medium, High, Critical の4値があり
**When** 全4×4 = 16の組み合わせで meetsMinRisk(risk, minRisk) を呼び出すと
**Then** risk >= minRisk の場合のみ true を返すこと

具体的な期待値:

| risk\minRisk | Low | Medium | High | Critical |
|-------------|-----|--------|------|----------|
| Low         | T   | F      | F    | F        |
| Medium      | T   | T      | F    | F        |
| High        | T   | T      | T    | F        |
| Critical    | T   | T      | T    | T        |

---

## Scenario 2: resolveCompoundSubcommand — 単純サブコマンド
- **Property**: P5（resolveCompoundSubcommand の解決精度）
- **Validates**: REQ-5

**Given** parsed.subcommand = "commit" で、entry.subcommands に "commit" キーがある場合
**When** resolveCompoundSubcommand を呼び出すと
**Then** subcommand = "commit" のまま、args も変更なしで返すこと

---

## Scenario 3: resolveCompoundSubcommand — 複合サブコマンド
- **Property**: P5
- **Validates**: REQ-5

**Given** parsed.subcommand = "compose", args = ["up", "-d"] で、entry.subcommands に "compose up" キーがある場合
**When** resolveCompoundSubcommand を呼び出すと
**Then** subcommand = "compose up", args = ["-d"] を返すこと（args[0] が消費される）

---

## Scenario 4: resolveCompoundSubcommand — entry が null
- **Property**: P5
- **Validates**: REQ-5

**Given** entry = null の場合
**When** resolveCompoundSubcommand を呼び出すと
**Then** 入力の subcommand と args をそのまま返すこと

---

## Scenario 5: resolveCompoundSubcommand — subcommand が null
- **Property**: P5
- **Validates**: REQ-5

**Given** parsed.subcommand = null の場合
**When** resolveCompoundSubcommand を呼び出すと
**Then** subcommand = null, args はそのまま返すこと

---

## Scenario 6: formatNotification — 単一の既知コマンド (ja)
- **Property**: P1（フォーマット正確性）
- **Validates**: REQ-1

**Given** 1セグメント: commandName = "ls", entry が存在, risk = Low, language = "ja"
**When** formatNotification を呼び出すと
**Then** `[ShellSense ✅ 低] ls — {entry.description.ja}` を返すこと

---

## Scenario 7: formatNotification — 未知コマンド
- **Property**: P1
- **Validates**: REQ-1

**Given** 1セグメント: commandName = "mycmd", entry = null, risk = Medium, language = "ja"
**When** formatNotification を呼び出すと
**Then** `[ShellSense 📝 中] mycmd — ?` を返すこと

---

## Scenario 8: formatNotification — サブコマンド付き
- **Property**: P1
- **Validates**: REQ-1

**Given** 1セグメント: commandName = "git", subcommand = "status", entry.subcommands["status"] が存在, language = "ja"
**When** formatNotification を呼び出すと
**Then** `[ShellSense ...] git status — {subcommands.status.description.ja}` を返すこと

---

## Scenario 9: formatNotification — チェーンコマンド
- **Property**: P2（チェーン連結）
- **Validates**: REQ-2

**Given** 2セグメント: "mkdir" (既知) と "cp" (既知), overallRisk = Medium, language = "ja"
**When** formatNotification を呼び出すと
**Then** `[ShellSense 📝 中] mkdir — {desc} | cp — {desc}` のフォーマットで、ヘッダーは先頭に1つだけ、各コマンドは ` | ` で区切られること

---

## Scenario 10: formatNotification — 英語出力
- **Property**: P3（日英切替）
- **Validates**: REQ-3

**Given** 1セグメント: commandName = "ls", entry が存在, risk = Low, language = "en"
**When** formatNotification を呼び出すと
**Then** リスクラベルが `✅ Low` で、説明が `entry.description.en` から取得されること

---

## Scenario 11: formatNotification — Critical リスク (ja)
- **Property**: P1, P3
- **Validates**: REQ-1, REQ-3

**Given** 1セグメント: risk = Critical, language = "ja"
**When** formatNotification を呼び出すと
**Then** リスクラベルが `🚨 最高` であること
