# Test Story — Phase2 / Unit5 / Bolt1

> 入力コンテキスト: `Phase2/Unit5/Bolt1/design.md` (Correctness Properties P1-P17)

---

### Scenario 1: 言語解決 — "en" 指定
- **Property**: P1
- **Validates**: US-1 / AC-1.1

**Given** `SHELLSENSE_LANG` が `"en"` に設定されている場合
**When** `resolveLanguage("en")` を呼び出すと
**Then** 戻り値は `"en"` であること

---

### Scenario 2: 言語解決 — "ja" 指定
- **Property**: P2
- **Validates**: US-1 / AC-1.2

**Given** `SHELLSENSE_LANG` が `"ja"` に設定されている場合
**When** `resolveLanguage("ja")` を呼び出すと
**Then** 戻り値は `"ja"` であること

---

### Scenario 3: 言語解決 — 未設定
- **Property**: P3
- **Validates**: US-1 / AC-1.3

**Given** `SHELLSENSE_LANG` が未設定（undefined）の場合
**When** `resolveLanguage(undefined)` を呼び出すと
**Then** 戻り値は `"ja"`（デフォルト）であること

---

### Scenario 4: 言語解決 — 不正値
- **Property**: P4
- **Validates**: US-1 / AC-1.4

**Given** `SHELLSENSE_LANG` が `"fr"` に設定されている場合
**When** `resolveLanguage("fr")` を呼び出すと
**Then** 戻り値は `"ja"`（フォールバック）であること

**Given** `SHELLSENSE_LANG` が空文字 `""` に設定されている場合
**When** `resolveLanguage("")` を呼び出すと
**Then** 戻り値は `"ja"` であること

---

### Scenario 5: 英語ヘッダー
- **Property**: P5
- **Validates**: US-2 / AC-2.1, AC-2.2

**Given** 既知コマンド "ls" の CommandEntry が存在する場合
**When** `buildExplanation(parsed, entry, risk, "en")` を呼び出すと
**Then** 出力の先頭に `[ShellSense] You MUST display the following explanation` を含むこと

**Given** チェーンコマンドのセグメントが存在する場合
**When** `buildChainExplanation(segments, operators, overallRisk, "en")` を呼び出すと
**Then** 出力の先頭に同じ英語ヘッダーを含むこと

---

### Scenario 6: 英語リスクラベル
- **Property**: P6
- **Validates**: US-3 / AC-3.1〜3.4

**Given** `language = "en"` の場合
**When** リスクレベル Low のコマンドの説明を生成すると
**Then** `✅ Low (read-only)` を含むこと

**Given** `language = "en"` の場合
**When** リスクレベル Medium のコマンドの説明を生成すると
**Then** `📝 Medium (may modify files)` を含むこと

**Given** `language = "en"` の場合
**When** リスクレベル High のコマンドの説明を生成すると
**Then** `⚠️ High (may delete or overwrite)` を含むこと

**Given** `language = "en"` の場合
**When** リスクレベル Critical のコマンドの説明を生成すると
**Then** `🚨 Critical (system-level or irreversible)` を含むこと

---

### Scenario 7: 英語コマンド説明
- **Property**: P7
- **Validates**: US-4 / AC-4.1

**Given** 既知コマンド "ls" の CommandEntry が存在し、`description.en` が "List directory contents" である場合
**When** `buildExplanation(parsed, entry, risk, "en")` を呼び出すと
**Then** 出力に `ls — List directory contents` を含むこと

---

### Scenario 8: 英語サブコマンド説明
- **Property**: P8
- **Validates**: US-4 / AC-4.2

**Given** "git" コマンドの "commit" サブコマンドが存在し、`description.en` が "Record changes to the repository" である場合
**When** `buildExplanation(parsed, entry, risk, "en")` を呼び出すと
**Then** 出力に `git commit — Record changes to the repository` を含むこと

---

### Scenario 9: 英語フラグ説明
- **Property**: P9
- **Validates**: US-4 / AC-4.3

**Given** "ls" コマンドに `-l` フラグが存在し、`description.en` が "Use a long listing format" である場合
**When** `buildExplanation(parsed, entry, risk, "en")` を呼び出すと
**Then** 出力に `-l: Use a long listing format` を含むこと

---

### Scenario 10: 英語セクションヘッダー・ラベル
- **Property**: P10
- **Validates**: US-4 / AC-4.4, AC-4.5, AC-4.6

**Given** `language = "en"` で既知コマンドの説明を生成する場合
**When** 出力を確認すると
**Then** `📖 Command explanation:` を含むこと
**And** 引数が存在する場合は `Target:` を含むこと
**And** `⚠️ Risk level:` を含むこと

---

### Scenario 11: 英語未知コマンドテンプレート
- **Property**: P11
- **Validates**: US-5 / AC-5.1, AC-5.2

**Given** 辞書に未登録のコマンド "unknowncmd" が入力された場合
**When** `buildExplanation(parsed, null, risk, "en")` を呼び出すと
**Then** `This command is not registered in the ShellSense dictionary` を含むこと
**And** `📝 Medium (unknown command, use with caution)` を含むこと

---

### Scenario 12: 英語チェーン演算子表示
- **Property**: P12
- **Validates**: US-6 / AC-6.1〜6.4

**Given** `language = "en"` でチェーンコマンドの説明を生成する場合
**When** 演算子 `&&` がセグメント間に存在すると
**Then** `&& (run next if success)` を含むこと

**When** 演算子 `||` がセグメント間に存在すると
**Then** `|| (run next if failure)` を含むこと

**When** 演算子 `|` がセグメント間に存在すると
**Then** `| (pipe output to next)` を含むこと

**When** 演算子 `;` がセグメント間に存在すると
**Then** `; (run sequentially)` を含むこと

---

### Scenario 13: 英語総合リスクラベル
- **Property**: P13
- **Validates**: US-6 / AC-6.5

**Given** `language = "en"` でチェーンコマンドの説明を生成する場合
**When** 総合リスクレベルを表示すると
**Then** `⚠️ Overall risk level:` を含むこと

---

### Scenario 14: 後方互換 — buildExplanation
- **Property**: P14
- **Validates**: US-7 / AC-7.1

**Given** 既知コマンド "ls" の説明を生成する場合
**When** `buildExplanation(parsed, entry, risk)` を language 引数なしで呼び出すと
**Then** 出力が日本語ヘッダーを含むこと
**And** `entry.description.ja` が使用されること
**And** 既存テストと同一の出力であること

---

### Scenario 15: 後方互換 — buildChainExplanation
- **Property**: P15
- **Validates**: US-7 / AC-7.2

**Given** チェーンコマンドの説明を生成する場合
**When** `buildChainExplanation(segments, operators, overallRisk)` を language 引数なしで呼び出すと
**Then** 出力が日本語ヘッダーを含むこと
**And** 日本語演算子表示であること
**And** 既存テストと同一の出力であること

---

### Scenario 16: E2E — 英語出力
- **Property**: P16
- **Validates**: US-1〜6

**Given** `SHELLSENSE_LANG=en` 環境変数が設定されている場合
**When** `echo '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' | node dist/index.js` を実行すると
**Then** stdout の JSON に `additionalContext` が含まれ、英語ヘッダー・英語説明・英語リスクラベルが出力されること

---

### Scenario 17: E2E — デフォルト日本語出力
- **Property**: P17
- **Validates**: US-1, US-7

**Given** `SHELLSENSE_LANG` 環境変数が未設定の場合
**When** `echo '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' | node dist/index.js` を実行すると
**Then** stdout の JSON に `additionalContext` が含まれ、日本語ヘッダー・日本語説明・日本語リスクラベルが出力されること
