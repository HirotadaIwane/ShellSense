# Test Story — Unit 1 / Bolt 1: 型定義

> 入力コンテキスト: `design.md` (Correctness Properties 5〜10, Testing Strategy)

---

### Scenario 1: RiskLevel enumの完全性
- **Property**: 5（RiskLevel enum の完全性）
- **Validates**: US-2 / AC-2.1

**Given** RiskLevel enumが定義されている場合
**When** 全メンバーの値を確認すると
**Then** `RiskLevel.Low` は `"low"` であること
**And** `RiskLevel.Medium` は `"medium"` であること
**And** `RiskLevel.High` は `"high"` であること
**And** `RiskLevel.Critical` は `"critical"` であること

**Given** RiskLevel enumが定義されている場合
**When** メンバーの数を確認すると
**Then** ちょうど4つであること（余分な値がないこと）

---

### Scenario 2: 型のエクスポート確認
- **Property**: 10（型のエクスポートとインポート互換性）
- **Validates**: US-2 / AC-2.9

**Given** `src/types.ts` がビルドされている場合
**When** テストファイルから全型を import すると
**Then** コンパイルエラーが発生しないこと

インポート対象: `RiskLevel`, `CommandCategory`, `FlagEntry`, `SubcommandEntry`, `CommandEntry`, `ParsedCommand`, `HookInput`, `HookOutput`

---

### Scenario 3: 型構造のランタイム確認
- **Property**: 6〜9（各interface/typeの正確性）
- **Validates**: US-2 / AC-2.2 〜 AC-2.8

**Given** 各型に準拠するオブジェクトを作成した場合
**When** TypeScriptコンパイラが型チェックを行うと
**Then** コンパイルエラーが発生しないこと

具体的には、テストコード内で以下のオブジェクトを作成し、型アノテーションを付けてコンパイルが通ることを確認する:
- `HookInput` 型のサンプルオブジェクト
- `HookOutput` 型のサンプルオブジェクト
- `ParsedCommand` 型のサンプルオブジェクト
- `CommandEntry` 型のサンプルオブジェクト（flags, subcommands 付き）
- `CommandCategory` 型の全7値

---

### テスト対象外の説明

Property 1〜3（package.json, tsconfig.json, .gitignore の内容）はテストコードで検証しない。理由: 静的な設定ファイルであり、Checkpoint 1 の手動確認で十分。

Property 4（ビルド成功）は `npm run build` の実行結果で確認する。テストコードではなくコマンド実行で検証。
