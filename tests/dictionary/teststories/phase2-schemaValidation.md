# Test Story — Phase 2 / Unit 2 / Bolt 1

> 入力コンテキスト: `Phase2/Unit2/Bolt1/design.md` (Correctness Properties P1-P11)

## schemaValidation.test.ts

### Scenario: schema.json の有効性
- **Property**: P1（スキーマ有効性）
- **Validates**: AC-1

**Given** dictionary/schema.json が存在する場合
**When** ファイルを JSON としてパースすると
**Then** `$schema` が `"http://json-schema.org/draft-07/schema#"` であること
**And** `required` に `"version"`, `"metadata"`, `"commands"` が含まれること
**And** `definitions` に `CommandEntry`, `FlagEntry`, `SubcommandEntry` が定義されていること

### Scenario: ファイル数と配置
- **Property**: P2（ファイル数と配置）
- **Validates**: AC-2, AC-4

**Given** dictionary/ ディレクトリが存在する場合
**When** core/ 内の .json ファイル数を確認すると
**Then** 6ファイル（filesystem, text, shell, network, process, system）であること

**Given** dictionary/ ディレクトリが存在する場合
**When** tools/ 内の .json ファイル数を確認すると
**Then** 4ファイル（git, npm, pip, npx）であること

**Given** dictionary/os/ が存在する場合
**When** ディレクトリの内容を確認すると
**Then** .gitkeep が存在し、.json ファイルは存在しないこと

### Scenario: metadata 整合性
- **Property**: P7（metadata 整合性）
- **Validates**: AC-2

**Given** 各辞書ファイルが存在する場合
**When** version フィールドを確認すると
**Then** 全ファイルで `"2.0.0"` であること

**Given** core/ 内の各ファイルが存在する場合
**When** metadata.layer を確認すると
**Then** `"core"` であること

**Given** tools/ 内の各ファイルが存在する場合
**When** metadata.layer を確認すると
**Then** `"tools"` であること

**Given** 各辞書ファイルが存在する場合
**When** metadata.name とファイル名を比較すると
**Then** ファイル名（拡張子なし）と一致すること

### Scenario: スキーマ適合性
- **Property**: P9（スキーマ適合性）
- **Validates**: AC-6

**Given** 各辞書ファイルが存在する場合
**When** 各コマンドの必須フィールドを確認すると
**Then** name, description, baseRisk, category が全て存在すること

**Given** 各コマンドの baseRisk を確認すると
**When** 値を列挙すると
**Then** "low", "medium", "high", "critical" のいずれかであること

**Given** 各コマンドの category を確認すると
**When** 値を列挙すると
**Then** Phase 2 の11値のいずれかであること

### Scenario: description 言語完全性
- **Property**: P10（description 言語完全性）
- **Validates**: AC-6

**Given** 全コマンドの description を確認すると
**When** ja と en フィールドを検証すると
**Then** 両方が存在し、空文字でないこと

**Given** flags を持つコマンドの各フラグの description を確認すると
**When** ja と en フィールドを検証すると
**Then** 両方が存在し、空文字でないこと

**Given** subcommands を持つコマンドの各サブコマンドの description を確認すると
**When** ja と en フィールドを検証すると
**Then** 両方が存在し、空文字でないこと

### Scenario: os ディレクトリ
- **Property**: P11（os ディレクトリ）
- **Validates**: AC-4

**Given** dictionary/os/ ディレクトリが存在する場合
**When** .gitkeep の存在を確認すると
**Then** ファイルが存在すること

**When** .json ファイルの存在を確認すると
**Then** 存在しないこと

---

## migration.test.ts

### Scenario: コマンド総数の保存
- **Property**: P3（コマンド総数の保存）
- **Validates**: AC-2, AC-5

**Given** dictionaryLoader で dictionary/ を読み込んだ場合
**When** totalCommands を確認すると
**Then** 37 であること

### Scenario: コマンドの完全性
- **Property**: P4（コマンドの完全性）
- **Validates**: AC-5

**Given** Phase 1 の37コマンド名リストが定義されている場合
**When** dictionaryLoader の結果と照合すると
**Then** 37コマンド全てが存在すること

### Scenario: コマンドの一意性
- **Property**: P5（コマンドの一意性）
- **Validates**: AC-5

**Given** 全辞書ファイルを個別に読み込んだ場合
**When** 全コマンドキーを収集すると
**Then** 重複するキーが存在しないこと

### Scenario: カテゴリ再分類の正確性
- **Property**: P6（カテゴリ再分類の正確性）
- **Validates**: AC-3

**Given** dictionaryLoader で読み込んだ結果がある場合
**When** grep, find, head, tail, wc, sort, uniq, sed, awk の category を確認すると
**Then** 全て `"text"` であること

**When** cd, pwd, echo, which, xargs, export, source の category を確認すると
**Then** 全て `"shell"` であること

**When** ls, cat, mkdir 等の再分類されないコマンドの category を確認すると
**Then** Phase 1 と同一の値であること

### Scenario: データ保全
- **Property**: P8（データ保全）
- **Validates**: AC-2

**Given** Phase 1 の commands.json と新辞書のコマンドを比較する場合
**When** 各コマンドの name, description, baseRisk, flags, subcommands を確認すると
**Then** category を除き全て同一であること
