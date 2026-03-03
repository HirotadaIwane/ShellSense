# ShellSense スタイルファイル リファレンス

> 対象: `config/styles/*.json`（emoji.json, ascii.json, legend.json, pro.json）
>
> スキーマ: `config/formatter.schema.json#/definitions/StyleFile`
>
> バージョン: 2.0.0

---

## 概要

スタイルファイルは通知テキストの**見た目**を定義する JSON ファイルである。
`formatter.ts` がこのファイルを読み込み、テンプレートエンジン (`templateEngine.ts`) で通知テキストを組み立てる。

構造は 3 セクション:

```
{
  "version":         "2.0.0",
  "templates_long":  detailed 形式のテンプレート文字列,
  "templates_short": compact 形式のテンプレート文字列,
  "labels":          言語別テキスト（TemplateLabels）
}
```

---

## 1. `templates_long` — detailed 形式テンプレート

単一コマンドやチェーンコマンドの **detailed（詳細）** 形式の出力テンプレートを定義する。
テンプレート内の `{placeholder}` は `buildPlaceholderValues()` が生成する値で置換される。

| キー | 用途 | デフォルト値 (emoji.json) |
|------|------|--------------------------|
| `singleCommand` | 単一コマンドの出力テンプレート | `"{header}\n{command}\n{flags}\n{target}\n{sudo}\n{separator}\n{risk}"` |
| `chainHeader` | チェーンの先頭（1回） | `"{header}"` |
| `chainSegment` | チェーンの各セグメント（繰り返し） | `"{command}\n{flags}\n{target}\n{sudo}"` |
| `chainOperator` | セグメント間の演算子 | `"  {operator}"` |
| `chainFooter` | チェーンの末尾（1回） | `"{separator}\n{overallRisk}"` |

### テンプレートエンジンの動作

- `{placeholder}` が空文字に解決された場合、**その行は自動的に除去**される
- `{separator}` は特殊処理され、常に**空行**として保持される
- `{flags}` が `string[]` の場合、複数行に展開される。空配列は行除去

### 出力例（単一コマンド: `rm -rf node_modules`）

```
</>                                          ← {header}
rm — ファイルやディレクトリを削除              ← {command}
  -r: 再帰的に削除                            ← {flags}[0]
  -f: 確認なしで強制削除                      ← {flags}[1]
  対象: node_modules                          ← {target}
                                              ← {separator}
⚠️ 高（削除・上書きを含む）                   ← {risk}
```

### 出力例（チェーンコマンド: `cd /foo && git commit`）

```
</>                                          ← chainHeader: {header}
1. cd — 作業ディレクトリを移動                ← chainSegment: {command}
  対象: /foo                                  ←              {target}
  ━✅━▸                                      ← chainOperator: {operator}
2. git commit — ステージングされた変更を記録  ← chainSegment: {command}
                                              ← chainFooter: {separator}
⚠️ 高（削除・上書きを含む）                   ←              {overallRisk}
```

---

## 2. `templates_short` — compact 形式テンプレート

compact（簡潔）形式の出力テンプレートを定義する。

| キー | 用途 | デフォルト値 (emoji.json) |
|------|------|--------------------------|
| `singleCommand` | 単一コマンド | `"[ShellSense {risk}] {commands}"` |
| `chainCommand` | チェーンコマンド | `"[ShellSense {risk}] {commands}"` |

### 出力例

```
[ShellSense 🔶 中] rm — ファイルやディレクトリを削除
```

### `{commands}` の構築

`{commands}` は `buildPlaceholderValues()` の責務外。呼び出し側が全セグメントの
`commandName + delimiter + description` を `" | "` で結合して値 Map にマージする。

---

## 3. `labels` — 言語別テキスト（TemplateLabels）

`ja` と `en` のキーで言語ごとのテキストを定義する。
フォールバック: 指定言語のキーが存在しない場合、`en` が使用される。

### 3.1 一般ラベル

| キー | 必須 | 用途 | emoji.json (ja) |
|------|------|------|-----------------|
| `header` | Yes | 通知の先頭行に表示される区切り | `"</>"` |
| `target` | Yes | 引数表示行のラベル | `"対象:"` |
| `unknownCommand` | Yes | 辞書に未登録のコマンドの説明文 | `"このコマンドはShellSenseの辞書に未登録です"` |
| `delimiter` | Yes | コマンド名と説明の区切り文字 | `" — "` |
| `indent` | Yes | フラグ・対象行のインデント | `"  "` |
| `chainNotice` | Yes | チェーン注意文 | `"ℹ️ 注意: このコマンドは複数のコマンドが連結されています"` |
| `chainNumbering` | Yes | チェーン番号形式 | `"dot"` |
| `sudoNotice` | Yes | sudo 検出時の警告文 | `"sudo: 管理者権限で実行されます（リスクが昇格します）"` |

### 3.2 リスクラベル

各リスクレベルに **フル表記** と **短縮表記**（`_short` サフィックス）の 2 形式を定義する。
v2.0.0 では絵文字がラベル自体に統合されている（旧 `emoji.risk` + `labels.risk.label` の合体）。

| キー | 用途 | emoji.json (ja) |
|------|------|-----------------|
| `risk_low` | 低リスク（detailed） | `"🟢 低（読み取り専用）"` |
| `risk_low_short` | 低リスク（compact） | `"🟢 低"` |
| `risk_medium` | 中リスク（detailed） | `"🔶 中（ファイルの変更を含む）"` |
| `risk_medium_short` | 中リスク（compact） | `"🔶 中"` |
| `risk_high` | 高リスク（detailed） | `"⚠️ 高（削除・上書きを含む）"` |
| `risk_high_short` | 高リスク（compact） | `"⚠️ 高"` |
| `risk_critical` | 最高リスク（detailed） | `"🚨 最高（システムレベルの変更・不可逆操作）"` |
| `risk_critical_short` | 最高リスク（compact） | `"🚨 最高"` |
| `unknownRisk` | 未知コマンドのリスク（detailed） | `"🔶 中（不明なコマンドのため注意してください）"` |
| `unknownRisk_short` | 未知コマンドのリスク（compact） | `"🔶 中"` |

### 3.3 演算子ラベル

チェーンコマンドのセグメント間に挿入される演算子の視覚表現。
キー名は `operator_` プレフィックス + 演算子文字列。

| キー | 意味 | emoji.json (ja) |
|------|------|-----------------|
| `operator_&&` | 前のコマンドが成功したら次を実行 | `"━✅━▸"` |
| `operator_\|\|` | 前のコマンドが失敗したら次を実行 | `"━❌━▸"` |
| `operator_\|` | 前のコマンドの標準出力をパイプ | `"━📤━▸"` |
| `operator_;` | 無条件で次を実行 | `"━━━▸"` |

### 3.4 `chainNumbering` の選択肢

| 値 | 出力例 | 説明 |
|----|--------|------|
| `"dot"` | `1. cd` | ドット番号 |
| `"keycap"` | `1️⃣ cd` | キーキャップ絵文字 |
| `"dingbat"` | `➊ cd` | Dingbat 丸数字 |
| `"circled"` | `① cd` | 丸囲み数字 |
| `"none"` | `cd` | 番号なし |

### 3.5 スタイル間の比較

| スタイル | `risk_high` | `header` | `operator_&&` | `delimiter` |
|---------|-------------|----------|---------------|-------------|
| emoji | `"⚠️ 高（削除・上書きを含む）"` | `"</>"` | `"━✅━▸"` | `" — "` |
| ascii | `"[!] High (may delete or overwrite)"` | `"==="` | `"==>>>"` | `" -- "` |
| legend | `"░▓██ HIGH"` | `""` | `"&&"` | `" ▸ "` |
| pro | `"High"` | `"---"` | `">>"` | `" -- "` |

---

## 4. 描画フロー全体像

```
formatExplanation(segments, operators, overallRisk, options)
  │
  ├── format === "compact"
  │     └── formatCompact()
  │           ├── {commands} を全セグメントから構築
  │           ├── templates_short.singleCommand or chainCommand を選択
  │           └── renderTemplate(template, values) で出力
  │
  ├── segments.length === 1（単一コマンド）
  │     └── formatDetailedSingle()
  │           ├── buildPlaceholderValues(labels, parsed, entry, risk, lang)
  │           └── renderTemplate(templates_long.singleCommand, values)
  │
  └── segments.length > 1（チェーンコマンド）
        └── formatDetailedChain()
              ├── renderTemplate(chainHeader, headerValues)
              ├── for each segment:
              │     ├── renderTemplate(chainSegment, segValues)
              │     └── 次セグメントがあれば renderTemplate(chainOperator, opValues)
              └── renderTemplate(chainFooter, footerValues)
```

---

## 5. プレースホルダー一覧

| プレースホルダー | 型 | 生成元 | 説明 |
|-----------------|-----|--------|------|
| `{header}` | `string` | 静的 | `labels.header` の値（例: `</>`） |
| `{command}` | `string` | 動的 | **単一セグメント**の説明: `[chainPrefix][sudoPrefix]commandName + delimiter + description` |
| `{flags}` | `string[]` | 動的 | フラグ一覧。複数行に展開される。空配列の場合は行ごと除去 |
| `{target}` | `string` | 動的 | `indent + target + " " + args`。引数なしの場合は空文字（行除去） |
| `{sudo}` | `string` | 動的 | `indent + sudoNotice`。sudo なしの場合は空文字（行除去） |
| `{risk}` | `string` | 静的 | リスクラベル。`isShort` に応じて `_short` サフィックス付きキーを優先解決 |
| `{overallRisk}` | `string` | 静的 | `{risk}` と同じ解決ルール。チェーンフッター用 |
| `{operator}` | `string` | 静的 | `labels["operator_" + op]` の値。未指定時は空文字（行除去） |
| `{chainNotice}` | `string` | 静的 | `labels.chainNotice`。非チェーン時は空文字（行除去） |
| `{separator}` | 特殊 | 固定 | `renderTemplate()` が空行として保持する特殊パターン |
| `{commands}` | `string` | 動的 | **全セグメント集約**（short 用）: 各セグメントの `commandName + delimiter + description` を ` | ` で結合 |

### `{command}` と `{commands}` の違い

| | `{command}` | `{commands}` |
|--|-------------|--------------|
| **スコープ** | 単一セグメント | 全セグメント集約 |
| **使用テンプレート** | `templates_long` の各テンプレート | `templates_short` のみ |
| **生成元** | `buildPlaceholderValues()` | 呼び出し側（formatCompact 等）で構築 |
| **例** | `rm — ファイルやディレクトリを削除する` | `rm — 削除 | cp — コピー` |

---

## 6. カスタマイズ例

### テンプレートのカスタマイズ

**リスクをヘッダー直後に表示する**:

```json
"templates_long": {
  "singleCommand": "{header}\n{risk}\n{command}\n{flags}\n{target}\n{sudo}"
}
```

**フラグ説明を非表示にする**:

```json
"templates_long": {
  "singleCommand": "{header}\n{command}\n{target}\n{sudo}\n{separator}\n{risk}"
}
```

テンプレートからプレースホルダーを削除するだけで、その項目は非表示になる。

### ラベルのカスタマイズ

**絵文字なしのリスクラベル** (pro スタイル):

```json
"labels": {
  "ja": {
    "risk_high": "高（削除・上書きを含む）",
    "risk_high_short": "高"
  }
}
```

**短縮表記のみの compact テンプレート** (pro スタイル):

```json
"templates_short": {
  "singleCommand": "{risk} {commands}",
  "chainCommand": "{risk} {commands}"
}
```
