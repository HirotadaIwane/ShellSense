# Test Story — Unit 4 Bolt 1: ツール辞書ファイル作成

> 入力コンテキスト: `Phase2/Unit4/Bolt1/design.md` (Correctness Properties P1-P10)

## Scenario 1: ファイル存在と配置
- **Property**: P1（ファイル存在と配置）
- **Validates**: AC-1, AC-2, AC-3, AC-4, AC-5

**Given** dictionary/tools/ ディレクトリを確認した場合
**When** ファイル一覧を取得すると
**Then** docker.json, kubectl.json, terraform.json, aws.json, gcloud.json の5ファイルが存在すること

## Scenario 2: カテゴリ正確性
- **Property**: P3（カテゴリ正確性）
- **Validates**: AC-1 (category), AC-2 (category), AC-3 (category), AC-4 (category), AC-5 (category)

**Given** docker.json と kubectl.json を読み込んだ場合
**When** コマンドの category を確認すると
**Then** `"container"` であること

**Given** terraform.json, aws.json, gcloud.json を読み込んだ場合
**When** コマンドの category を確認すると
**Then** `"cloud"` であること

## Scenario 3: baseRisk 正確性
- **Property**: P4（baseRisk 正確性）
- **Validates**: AC-1〜AC-5 (baseRisk)

**Given** 5つのツール辞書ファイルを読み込んだ場合
**When** 各コマンドの baseRisk を確認すると
**Then** 全て `"medium"` であること

## Scenario 4: サブコマンド存在
- **Property**: P5（サブコマンド存在）
- **Validates**: AC-1 (subcommands), AC-2 (subcommands), AC-3 (subcommands), AC-4 (subcommands), AC-5 (subcommands)

**Given** docker.json を読み込んだ場合
**When** サブコマンドのキー一覧を確認すると
**Then** run, build, ps, images, exec, stop, rm, logs, pull, push, network, volume, "compose up", "compose down", "compose build", "compose ps" の16個が存在すること

**Given** kubectl.json を読み込んだ場合
**When** サブコマンドのキー一覧を確認すると
**Then** get, describe, apply, delete, logs, exec, port-forward, create, scale, rollout の10個が存在すること

**Given** terraform.json を読み込んだ場合
**When** サブコマンドのキー一覧を確認すると
**Then** init, plan, apply, destroy, validate, fmt, state, output, import, workspace の10個が存在すること

**Given** aws.json を読み込んだ場合
**When** サブコマンドのキー一覧を確認すると
**Then** s3, ec2, iam, lambda, ecs, cloudformation, sts, logs の8個が存在すること

**Given** gcloud.json を読み込んだ場合
**When** サブコマンドのキー一覧を確認すると
**Then** compute, container, iam, app, functions, config, auth の7個が存在すること

## Scenario 5: riskOverride 正確性
- **Property**: P6（riskOverride 正確性）
- **Validates**: AC-1 (riskOverride), AC-2 (riskOverride), AC-3 (riskOverride)

**Given** docker.json を読み込んだ場合
**When** 破壊的サブコマンドの riskOverride を確認すると
**Then** rm は `"high"`、stop は `"medium"` であること

**Given** kubectl.json を読み込んだ場合
**When** 破壊的サブコマンドの riskOverride を確認すると
**Then** delete は `"high"` であること

**Given** terraform.json を読み込んだ場合
**When** 破壊的サブコマンドの riskOverride を確認すると
**Then** destroy は `"critical"`、apply は `"high"` であること

## Scenario 6: 複合サブコマンドキー
- **Property**: P7（複合サブコマンドキー）
- **Validates**: AC-1 (compose subcommands)

**Given** docker.json を読み込んだ場合
**When** subcommands のキー一覧にスペースを含むキーを確認すると
**Then** `"compose up"`, `"compose down"`, `"compose build"`, `"compose ps"` の4つが存在すること

## Scenario 7: description 言語完全性
- **Property**: P8（description 言語完全性）
- **Validates**: AC-6 (description)

**Given** 5つのツール辞書ファイルを読み込んだ場合
**When** 各コマンドの description を確認すると
**Then** ja と en が存在し空文字でないこと

**Given** 5つのツール辞書ファイルを読み込んだ場合
**When** 各サブコマンドの description を確認すると
**Then** ja と en が存在し空文字でないこと
