# ShellSense

Claude Code / VSCode ターミナルで実行されるシェルコマンドを自動解析し、その意味とリスクレベルをリアルタイムで通知する VSCode 拡張機能。

## なぜ ShellSense？

AI との開発では、AI がコマンドの実行許可を求めてきます。しかし、特に初心者はその内容を理解しないまま盲目的に承認してしまいがちです。

これは「AI に全てを委ねている状態」です。何をやろうとしているのか分からないまま進めると、最終的には自分のプロダクトの構造すら説明できなくなります。

ShellSense は、実行されるコマンドの意味とリスクを**その場で**伝えます。

- **ビギナー** — コマンドを一つずつ理解しながら開発を進められる教育ツールとして
- **ミドル** — 知らなかったフラグやコマンドの新たな発見の機会として

AI の力を借りつつも、自分が何を作っているのかを理解し続けるために。

## 特徴

- **コマンド自動解説** — `rm -rf node_modules` が実行される前に、何をするコマンドなのかを日本語（または英語）で通知
- **リスクレベル判定** — Low / Medium / High / Critical の4段階でコマンドの危険度を表示
- **320+ コマンド対応** — Git, Docker, AWS CLI, kubectl, npm など主要ツールをカバー
- **チェーンコマンド解析** — `&&`, `||`, `|`, `;` で連結されたコマンドも個別に解析
- **サブコマンド認識** — `git commit`, `docker build`, `npm install` などの複合コマンドに対応
- **デュアルソース検知** — Claude Code フック + VSCode Shell Integration の両方からコマンドをキャプチャ
- **4種のスタイルプリセット** — emoji / legend / ascii / pro から表示スタイルを選択可能
- **日本語・英語対応** — 全辞書エントリとUIラベルがバイリンガル
- **ゼロ依存** — ランタイム依存パッケージなし。起動時間を最小化

## 動作イメージ

```
┌─────────────────────────────────────────────────────┐
│  ℹ️ ShellSense                                       │
│                                                     │
│  ⚠️ Risk: HIGH                                       │
│  rm — ファイルやフォルダを削除                         │
│    -r: サブフォルダも再帰的に削除                      │
│    -f: 確認なしで強制削除                             │
│    対象: node_modules                                │
└─────────────────────────────────────────────────────┘
```

## インストール

### 前提条件

- VSCode 1.93 以上
- Node.js 18 以上
- Claude Code（フック連携を使う場合）

### セットアップ

1. リポジトリをクローン:

```bash
git clone https://github.com/HirotadaIwane/ShellSense.git
cd ShellSense
```

2. 依存をインストール:

```bash
npm install
```

3. ビルド:

```bash
npm run build
cd vscode-extension && node esbuild.js
```

4. VSCode にインストール:

   `vscode-extension/` フォルダを VSCode の拡張機能開発モードで読み込むか、`.vsix` パッケージを作成してインストール:

```bash
cd vscode-extension
npx @vscode/vsce package
code --install-extension shellsense-0.1.0.vsix
```

### Claude Code フックの自動登録

拡張機能を有効化すると、Claude Code のフック設定（`~/.claude/settings.json`）への登録を自動で提案します。承認すると、Claude Code が Bash コマンドを実行するたびに ShellSense が通知を表示します。

## 設定

VSCode の設定画面（`Ctrl+,`）で `shellsense` を検索するか、`settings.json` に直接記述できます。

| 設定 | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `shellsense.enabled` | boolean | `true` | ShellSense の有効/無効 |
| `shellsense.language` | `"ja"` \| `"en"` | `"ja"` | 通知の表示言語 |
| `shellsense.minRiskLevel` | `"low"` \| `"medium"` \| `"high"` \| `"critical"` | `"low"` | 通知を表示する最低リスクレベル |
| `shellsense.hookEnabled` | boolean | `true` | Claude Code フックからの通知 |
| `shellsense.terminalEnabled` | boolean | `true` | VSCode ターミナルからの通知 |
| `shellsense.notificationFormat` | `"detailed"` \| `"compact"` | `"detailed"` | 通知フォーマット |
| `shellsense.style` | `"emoji"` \| `"legend"` \| `"ascii"` \| `"pro"` | `"emoji"` | 表示スタイルプリセット |
| `shellsense.chainNumbering` | `"dot"` \| `"circled"` \| `"keycap"` \| `"dingbat"` \| `"none"` | `"dot"` | チェーンコマンドの番号スタイル |

### スタイルプリセット

| スタイル | リスク表示例 | 特徴 |
|---------|------------|------|
| **emoji** | 🟢 低（読み取り専用） / 🚨 最高（不可逆操作） | 絵文字で視覚的にリッチ |
| **legend** | ░░░█ LOW / ▓███ CRIT | ブロックシェードゲージ、HUD風 |
| **ascii** | [OK] Low (read-only) / [!!] Critical (irreversible) | ASCII のみ、レガシー端末対応 |
| **pro** | Low / Critical | 情報密度重視、最小限の装飾 |

### スタイルの仕組み

各スタイルは `config/styles/` に置かれた JSON ファイルで、**3つのレイヤー**で通知の見た目を制御します。

```
┌─────────────────────────────────────────────────┐
│  layout（骨格）                                  │
│  どのパーツを、どの順番で表示するか               │
│                                                 │
│  detailedSingle:                                │
│    ["sectionHeader",                            │
│     "commandDescription",  ← 辞書から動的に生成  │
│     "flagDescriptions",    ← 辞書から動的に生成  │
│     "targetArguments",                          │
│     "separator",                                │
│     "riskLevel",                                │
│     "chainNotice"]                              │
├─────────────────────────────────────────────────┤
│  labels（言語ラベル）          emoji（装飾）      │
│  "リスクレベル:" / "Risk:"     🟢 🔶 ⚠️ 🚨       │
│  "対象:" / "Target:"          ━✅━▸ ━❌━▸       │
│  "低（読み取り専用）"          "" (proは空)       │
├─────────────────────────────────────────────────┤
│  辞書（コマンド固有テキスト）                      │
│  "ファイルやフォルダを削除"                        │
│  "-r: サブフォルダも再帰的に削除"                  │
└─────────────────────────────────────────────────┘
```

- **layout** — 何をどの順で表示するか。配列からパーツを削除すれば非表示に、順序を変えれば表示順が変わる
- **labels** — 言語別の固定テキスト（`"リスクレベル:"` など）。`ja` と `en` を定義
- **emoji** — 装飾記号。空文字にすればプレーンテキストになる
- **辞書** — コマンド固有の説明文。レンダリング時に動的に埋め込まれる

利用可能なレイアウトパーツ:

| パーツ ID | 説明 |
|----------|------|
| `sectionHeader` | セクション区切り（`</>`, `---`, `===`） |
| `commandDescription` | コマンド名 + 辞書の説明文 |
| `flagDescriptions` | 各フラグの説明 |
| `targetArguments` | 対象ファイル・引数 |
| `separator` | 空行 |
| `riskLevel` | リスクレベル表示 |
| `overallRiskLevel` | チェーン全体のリスク |
| `chainNotice` | チェーンコマンドの注意書き |
| `operatorDisplay` | チェーン演算子の表示（`━✅━▸` など） |

例えば `riskLevel` を配列の先頭に移動すればリスクが最初に目に入るスタイルになり、`flagDescriptions` を削除すればフラグ説明が省略されます。

スタイルの JSON スキーマは `config/formatter.schema.json` で定義されています。

## アーキテクチャ

```
Claude Code                          VSCode
┌──────────┐    IPC File            ┌─────────────────────┐
│ hook.js  │───────────────────────▶│ handleNotificationFile│
│ (stdin → │  {command, ts}         │                     │
│  detect) │                        │   processAndNotify() │
└──────────┘                        │   ├─ parseChain()   │
                                    │   ├─ assessRisk()   │
VSCode Terminal                     │   ├─ formatExplan() │
┌──────────┐  Shell Integration     │   └─ showNotify()   │
│ Terminal  │───────────────────────▶│ handleShellExecution│
└──────────┘                        └─────────────────────┘
```

- **hook.js**: Claude Code の PreToolUse フックとして動作。Bash コマンドを検知し、IPC ファイル（`{command, ts}`）を一時ディレクトリに書き出す
- **extension.ts**: IPC ファイルの監視 + VSCode Shell Integration の両方からコマンドを受信し、`processAndNotify()` で統一的に処理

## リスクレベル

| レベル | 基準 | 例 |
|--------|------|---|
| **Low** | 読み取り専用 | `ls`, `cat`, `pwd`, `grep` |
| **Medium** | ファイル書き込み・変更 | `cp`, `mv`, `mkdir`, `npm install` |
| **High** | 削除・上書き | `rm`, `rm -rf`, `git reset` |
| **Critical** | システムレベル・不可逆 | `sudo`, `git push --force`, `curl \| sh` |

フラグによるリスク昇格もサポートしています（例: `rm` は Medium → `rm -rf` は High）。

## 辞書構成

3層構造で320以上のコマンドを収録:

| レイヤー | 内容 | コマンド数 |
|---------|------|-----------|
| **Core** | 基本コマンド（filesystem, text, network, process, shell, system） | 39 |
| **Tools** | 開発ツール（git, docker, npm, aws, kubectl, terraform 等） | 18（サブコマンド多数） |
| **OS** | OS固有コマンド（Linux 254 + macOS 9） | 263 |

## 開発

```bash
# ビルド
npm run build

# ウォッチモード
npm run dev

# テスト実行（1,052テスト）
npm test

# ユニットテストのみ
npm run test:unit

# 型チェック
npx tsc

# VSCode 拡張ビルド
cd vscode-extension && node esbuild.js
```

## 技術スタック

- **TypeScript** — strict モード
- **Vitest** — テストフレームワーク
- **esbuild** — VSCode 拡張のバンドル
- **ランタイム依存: 0** — 起動速度を最優先

## ライセンス

MIT

