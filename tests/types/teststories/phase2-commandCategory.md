# Test Story — Phase 2 / Unit 1 / Bolt 1

> 入力コンテキスト: `Phase2/Unit1/Bolt1/design.md`（Correctness Properties P1-P12）

---

## 1. 型定義テスト

### Scenario: CommandCategory の11値が定義されている（P1）
- **Property**: P1（CommandCategory 型安全性）
- **Validates**: US-1

**Given** CommandCategory 型が定義されている場合
**When** 11個のカテゴリ値（filesystem, text, git, package, network, process, system, container, cloud, shell, other）を変数に代入すると
**Then** 全てコンパイルエラーなく代入できること

### Scenario: DictionaryFile インターフェースの構造（P2）
- **Property**: P2（新型定義の正確性）
- **Validates**: US-2

**Given** DictionaryFile 型のオブジェクトを作成する場合
**When** version, metadata（layer, name, description?, os?）, commands を持つオブジェクトを代入すると
**Then** 型エラーなくコンパイルできること

### Scenario: LoaderResult インターフェースの構造（P2）
- **Property**: P2（新型定義の正確性）
- **Validates**: US-2

**Given** LoaderResult 型のオブジェクトを作成する場合
**When** commands と metadata（totalCommands, filesLoaded, loadTimeMs）を持つオブジェクトを代入すると
**Then** 型エラーなくコンパイルできること

### Scenario: DictionaryLayer と SupportedLanguage の値（P2）
- **Property**: P2（新型定義の正確性）
- **Validates**: US-2

**Given** DictionaryLayer 型と SupportedLanguage 型が定義されている場合
**When** DictionaryLayer に "core", "os", "tools" を、SupportedLanguage に "ja", "en" を代入すると
**Then** 全て型エラーなく代入できること

---

## 2. 基本マージテスト

### Scenario: 複数ファイルのコマンドがマージされる（P3）
- **Property**: P3（基本マージ）
- **Validates**: US-3

**Given** valid/ フィクスチャ（core/test-commands.json に2コマンド、tools/test-tools.json に1コマンド）がある場合
**When** loadDictionary(validFixturePath) を実行すると
**Then** result.commands に3つのコマンド（testcmd1, testcmd2, testtool1）が含まれること

### Scenario: schema.json がコマンドとしてロードされない（P4）
- **Property**: P4（schema.json 除外）
- **Validates**: US-3

**Given** with-schema/ フィクスチャ（schema.json + core/test.json）がある場合
**When** loadDictionary(withSchemaFixturePath) を実行すると
**Then** result.commands に "schemacmd" のみ含まれ、schema.json の内容はロードされないこと
**And** result.metadata.filesLoaded が 1 であること

### Scenario: カスタムパスが機能する（P5）
- **Property**: P5（カスタムパス）
- **Validates**: US-3

**Given** テスト用フィクスチャのパスが指定されている場合
**When** loadDictionary(customPath) を実行すると
**Then** デフォルトの dictionary/ ではなく指定パスからロードすること

---

## 3. 読み込み順序と重複処理テスト

### Scenario: core → os → tools の順で読み込まれる（P6）
- **Property**: P6（読み込み順序）
- **Validates**: US-4

**Given** valid/ フィクスチャに core/ と tools/ がある場合
**When** loadDictionary(validFixturePath) を実行すると
**Then** core/ のファイルが tools/ より先に処理されること（core のコマンドがマージ結果に含まれる）

### Scenario: キー重複時に先読み定義が採用される（P7）
- **Property**: P7（キー重複警告）
- **Validates**: US-4

**Given** duplicate/ フィクスチャ（core/a.json と tools/b.json に同一キー "dupcmd"）がある場合
**When** loadDictionary(duplicateFixturePath) を実行すると
**Then** result.commands["dupcmd"] は core/a.json の定義（baseRisk: "low"）であること
**And** stderr に重複警告が出力されること

---

## 4. エラー耐性テスト

### Scenario: 存在しないディレクトリで空 LoaderResult を返す（P8）
- **Property**: P8（ディレクトリ不在耐性）
- **Validates**: US-5

**Given** 存在しないディレクトリパスが指定された場合
**When** loadDictionary("/non/existent/path") を実行すると
**Then** result.commands は空オブジェクト {} であること
**And** result.metadata.totalCommands が 0 であること
**And** result.metadata.filesLoaded が 0 であること
**And** 例外がスローされないこと

### Scenario: 不正JSONファイルをスキップし残りは読み込む（P9）
- **Property**: P9（不正JSON耐性）
- **Validates**: US-5

**Given** malformed/ フィクスチャ（core/broken.json に不正なJSON）がある場合
**When** loadDictionary(malformedFixturePath) を実行すると
**Then** 例外がスローされないこと
**And** stderr に警告が出力されること

### Scenario: commands キー欠損ファイルをスキップする（P10）
- **Property**: P10（commands キー欠損耐性）
- **Validates**: US-5

**Given** missing-commands/ フィクスチャ（core/no-commands.json に commands キーなし）がある場合
**When** loadDictionary(missingCommandsFixturePath) を実行すると
**Then** result.commands は空オブジェクト {} であること
**And** stderr に警告が出力されること
**And** 例外がスローされないこと

### Scenario: loadDictionary() は決して例外をスローしない（P12）
- **Property**: P12（例外安全性）
- **Validates**: US-5

**Given** どのような入力が与えられた場合でも
**When** loadDictionary() を実行すると
**Then** 例外がスローされず、常に有効な LoaderResult を返すこと

---

## 5. メタデータテスト

### Scenario: totalCommands と filesLoaded が正確（P11）
- **Property**: P11（メタデータ正確性）
- **Validates**: US-6

**Given** valid/ フィクスチャ（2ファイル、3コマンド）がある場合
**When** loadDictionary(validFixturePath) を実行すると
**Then** result.metadata.totalCommands が 3 であること
**And** result.metadata.filesLoaded が 2 であること

### Scenario: loadTimeMs が 0 以上（P11）
- **Property**: P11（メタデータ正確性）
- **Validates**: US-6

**Given** 任意のフィクスチャパスが指定された場合
**When** loadDictionary() を実行すると
**Then** result.metadata.loadTimeMs が 0 以上の数値であること
