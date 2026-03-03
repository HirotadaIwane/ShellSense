# Test Story — Phase 16 Unit 3 Bolt 1

> 入力コンテキスト: `Phase16_JsonStructureImprove/Unit3/Bolt1/design.md` (Correctness Properties 1-6)

---

## Property 1: デッドコード不在（formatter.ts）

### Scenario 1.1: composeRiskFull が削除されている
- **Validates**: R1.1

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `composeRiskFull` を検索すると
**Then** 一致しないこと

### Scenario 1.2: composeRiskShort が削除されている
- **Validates**: R1.2

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `composeRiskShort` を検索すると
**Then** 一致しないこと

### Scenario 1.3: composeUnknownRisk が削除されている
- **Validates**: R1.3

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `composeUnknownRisk` を検索すると
**Then** 一致しないこと

### Scenario 1.4: renderGroup が削除されている
- **Validates**: R1.4

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `renderGroup` を検索すると
**Then** 一致しないこと

### Scenario 1.5: RenderContext が削除されている
- **Validates**: R1.5

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `RenderContext` を検索すると
**Then** 一致しないこと

### Scenario 1.6: @ts-expect-error Dead code コメントが削除されている
- **Validates**: R1.6

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `@ts-expect-error` を検索すると
**Then** 一致しないこと

---

## Property 2: 旧型不在（types.ts）

### Scenario 2.1: LanguageLabels が削除されている
- **Validates**: R2.1

**Given** `src/types.ts` のソースコードを読み込んだ場合
**When** `LanguageLabels` を検索すると
**Then** 一致しないこと

### Scenario 2.2: LayoutGroupId が削除されている
- **Validates**: R2.2

**Given** `src/types.ts` のソースコードを読み込んだ場合
**When** `LayoutGroupId` を検索すると
**Then** 一致しないこと

### Scenario 2.3: RiskLabels が削除されている
- **Validates**: R2.3

**Given** `src/types.ts` のソースコードを読み込んだ場合
**When** `interface RiskLabels` を検索すると
**Then** 一致しないこと

---

## Property 3: import 整合性

### Scenario 3.1: formatter.ts の import に LanguageLabels が含まれない
- **Validates**: R1.7

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `LanguageLabels` を検索すると
**Then** 一致しないこと（Scenario 1 と重複するが import 文に着目）

### Scenario 3.2: formatter.ts の import に LayoutGroupId が含まれない
- **Validates**: R1.7

**Given** `src/formatter.ts` のソースコードを読み込んだ場合
**When** `LayoutGroupId` を検索すると
**Then** 一致しないこと

---

## Property 4: buildRiskLabel の正確性

### Scenario 4.1: emoji/ja の risk_low_short が正しく返る
- **Validates**: R3.3

**Given** emoji.json ベースの FormatterConfig が設定された場合
**When** `RISK_LABEL[RiskLevel.Low]["ja"]` を取得すると
**Then** `"🟢 低"` であること

### Scenario 4.2: emoji/en の risk_high_short が正しく返る
- **Validates**: R3.4

**Given** emoji.json ベースの FormatterConfig が設定された場合
**When** `RISK_LABEL[RiskLevel.High]["en"]` を取得すると
**Then** `"⚠️ High"` であること

### Scenario 4.3: 全リスクレベル × 全言語にエントリが存在する
- **Validates**: R3.5

**Given** emoji.json ベースの FormatterConfig が設定された場合
**When** `RISK_LABEL` の全エントリを検査すると
**Then** 4レベル × 2言語 = 8エントリすべてが非空文字列であること

### Scenario 4.4: config.emoji を参照しない
- **Validates**: R3.1, R3.2

**Given** `vscode-extension/src/notificationUtils.ts` のソースコードを読み込んだ場合
**When** `config.emoji` を検索すると
**Then** 一致しないこと

---

## Property 5: formatNotification 互換性

### Scenario 5.1: formatNotification のシグネチャが維持されている
- **Validates**: R3.6

**Given** `formatNotification` が import できた場合
**When** 引数数を確認すると
**Then** 3（segments, overallRisk, language）であること

### Scenario 5.2: formatNotification が compact 出力を返す
- **Validates**: R3.6

**Given** emoji.json ベースの FormatterConfig が設定された場合
**When** `formatNotification([segment], RiskLevel.Low, "ja")` を呼び出すと
**Then** `[ShellSense` を含む文字列が返ること
