// ============================================================
// buildPlaceholderValues.test.ts — Phase 16 Unit 1 Bolt 2
// ============================================================

import { describe, it, expect } from "vitest";
import { buildPlaceholderValues } from "../../src/templateEngine";
import {
  makeParsed as _makeParsed,
  makeEntry as _makeEntry,
  makeLabels as _makeLabels,
} from "../helpers/factories";
import {
  RiskLevel,
  type ParsedCommand,
  type CommandEntry,
  type TemplateLabels,
  type SupportedLanguage,
} from "../../src/types";

// --- テスト用ヘルパー（shared factory + ローカルデフォルト） ---

function makeLabels(overrides?: Partial<TemplateLabels>): TemplateLabels {
  return _makeLabels({
    header: "---",
    risk_low: "🟢 低（読み取り専用）",
    risk_low_short: "LOW",
    risk_medium: "🟡 中（変更操作）",
    risk_medium_short: "MED",
    risk_high: "🔴 高（破壊操作）",
    risk_high_short: "HIGH",
    risk_critical: "🔥 致命的（不可逆操作）",
    risk_critical_short: "CRIT",
    unknownRisk: "⚠️ 不明",
    unknownRisk_short: "???",
    unknownCommand: "このコマンドはShellSenseの辞書に未登録です",
    target: "対象:",
    delimiter: " — ",
    indent: "  ",
    chainNotice: "チェーンコマンド",
    chainNumbering: "dot",
    sudoNotice: "sudo: 管理者権限で実行されます（リスクが昇格します）",
    "operator_&&": "━✅━▸",
    "operator_||": "━❌━▸",
    "operator_|": "━▸",
    "operator_;": "━▸",
    ...overrides,
  });
}

function makeParsed(overrides?: Partial<ParsedCommand>): ParsedCommand {
  return _makeParsed({
    raw: "rm",
    commandName: "rm",
    ...overrides,
  });
}

function makeEntry(overrides?: Partial<CommandEntry>): CommandEntry {
  return _makeEntry({
    name: "rm",
    description: {
      ja: "ファイルやディレクトリを削除する",
      en: "Remove files or directories",
    },
    baseRisk: RiskLevel.High,
    category: "filesystem",
    flags: {
      "-r": {
        description: { ja: "再帰的に削除する", en: "Remove recursively" },
      },
      "-f": {
        description: {
          ja: "確認なしで強制削除する",
          en: "Force removal without confirmation",
        },
        riskModifier: RiskLevel.Critical,
      },
    },
    ...overrides,
  });
}

const lang: SupportedLanguage = "ja";

// ============================================================
// Property 1: 既知コマンドの {command} 生成
// ============================================================

describe("Property 1: 既知コマンドの {command} 生成", () => {
  it("Scenario 1.1: 通常コマンド — commandName + delimiter + description", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.command).toBe("rm — ファイルやディレクトリを削除する");
  });

  it("Scenario 1.2: サブコマンド付き — commandName + subcommand + delimiter + sub.description", () => {
    const entry = makeEntry({
      name: "docker",
      description: { ja: "コンテナ管理", en: "Container management" },
      subcommands: {
        "compose up": {
          description: {
            ja: "コンテナを作成して起動する",
            en: "Create and start containers",
          },
        },
      },
    });
    const parsed = makeParsed({
      raw: "docker compose up",
      commandName: "docker",
      subcommand: "compose up",
    });
    const result = buildPlaceholderValues(
      makeLabels(),
      parsed,
      entry,
      RiskLevel.Low,
      lang
    );
    expect(result.command).toBe(
      "docker compose up — コンテナを作成して起動する"
    );
  });

  it("Scenario 1.3: sudo プレフィックス — sudo + commandName + delimiter + description", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ hasSudo: true }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.command).toBe(
      "sudo rm — ファイルやディレクトリを削除する"
    );
  });

  it("Scenario 1.4: チェーン番号付き — chainPrefix + commandName + delimiter + description", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang,
      { chainNumber: 2 }
    );
    expect(result.command).toBe(
      "2. rm — ファイルやディレクトリを削除する"
    );
  });

  it("Scenario 1.5: sudo + チェーン番号の複合 — chainPrefix + sudoPrefix + commandName", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ hasSudo: true }),
      makeEntry(),
      RiskLevel.High,
      lang,
      { chainNumber: 1 }
    );
    expect(result.command).toBe(
      "1. sudo rm — ファイルやディレクトリを削除する"
    );
  });
});

// ============================================================
// Property 2: 未知コマンドの {command} 生成
// ============================================================

describe("Property 2: 未知コマンドの {command} 生成", () => {
  it("Scenario 2.1: 未知コマンド — commandName + delimiter + unknownCommand", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ commandName: "foo", raw: "foo" }),
      null,
      RiskLevel.Medium,
      lang
    );
    expect(result.command).toBe(
      "foo — このコマンドはShellSenseの辞書に未登録です"
    );
  });

  it("Scenario 2.2: 未知コマンド + sudo", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ commandName: "foo", raw: "sudo foo", hasSudo: true }),
      null,
      RiskLevel.Medium,
      lang
    );
    expect(result.command).toBe(
      "sudo foo — このコマンドはShellSenseの辞書に未登録です"
    );
  });
});

// ============================================================
// Property 3: {flags} 生成
// ============================================================

describe("Property 3: {flags} 生成", () => {
  it("Scenario 3.1: 複数フラグあり — indent + flag + ': ' + description", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ flags: ["-r", "-f"] }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.flags).toEqual([
      "  -r: 再帰的に削除する",
      "  -f: 確認なしで強制削除する",
    ]);
  });

  it("Scenario 3.2: フラグなし — 空配列", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ flags: [] }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.flags).toEqual([]);
  });

  it("Scenario 3.3: 辞書にないフラグはスキップ", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ flags: ["-r", "-x"] }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.flags).toEqual(["  -r: 再帰的に削除する"]);
  });

  it("Scenario 3.4: サブコマンドのフラグ優先", () => {
    const entry = makeEntry({
      name: "docker",
      subcommands: {
        up: {
          description: { ja: "起動する", en: "Start" },
          flags: {
            "-d": {
              description: {
                ja: "デタッチモードで起動",
                en: "Detached mode",
              },
            },
          },
        },
      },
    });
    const parsed = makeParsed({
      commandName: "docker",
      subcommand: "up",
      flags: ["-d"],
    });
    const result = buildPlaceholderValues(
      makeLabels(),
      parsed,
      entry,
      RiskLevel.Low,
      lang
    );
    expect(result.flags).toEqual(["  -d: デタッチモードで起動"]);
  });

  it("Scenario 3.5: 未知コマンドのフラグ — 空配列", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ commandName: "foo", flags: ["-f"] }),
      null,
      RiskLevel.Medium,
      lang
    );
    expect(result.flags).toEqual([]);
  });
});

// ============================================================
// Property 4: {target} 生成
// ============================================================

describe("Property 4: {target} 生成", () => {
  it("Scenario 4.1: 引数あり — indent + target + ' ' + args.join(', ')", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ args: ["node_modules", "dist"] }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.target).toBe("  対象: node_modules, dist");
  });

  it("Scenario 4.2: 引数なし — 空文字", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ args: [] }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.target).toBe("");
  });
});

// ============================================================
// Property 5: {sudo} 生成
// ============================================================

describe("Property 5: {sudo} 生成", () => {
  it("Scenario 5.1: sudo あり — indent + sudoNotice", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ hasSudo: true }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.sudo).toBe(
      "  sudo: 管理者権限で実行されます（リスクが昇格します）"
    );
  });

  it("Scenario 5.2: sudo なし — 空文字", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ hasSudo: false }),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.sudo).toBe("");
  });
});

// ============================================================
// Property 6: {risk} ラベル解決
// ============================================================

describe("Property 6: {risk} ラベル解決", () => {
  it("Scenario 6.1: long モード — risk_low を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.Low,
      lang,
      { isShort: false }
    );
    expect(result.risk).toBe("🟢 低（読み取り専用）");
  });

  it("Scenario 6.2: short モード — risk_low_short を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.Low,
      lang,
      { isShort: true }
    );
    expect(result.risk).toBe("LOW");
  });

  it("Scenario 6.3: _short フォールバック — _short 未定義時はデフォルト使用", () => {
    const labels = makeLabels({ risk_low_short: "" });
    const result = buildPlaceholderValues(
      labels,
      makeParsed(),
      makeEntry(),
      RiskLevel.Low,
      lang,
      { isShort: true }
    );
    expect(result.risk).toBe("🟢 低（読み取り専用）");
  });

  it("Scenario 6.4: 未知コマンドのリスク（long） — unknownRisk を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ commandName: "foo" }),
      null,
      RiskLevel.Medium,
      lang,
      { isShort: false }
    );
    expect(result.risk).toBe("⚠️ 不明");
  });

  it("Scenario 6.5: 未知コマンドのリスク（short） — unknownRisk_short を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed({ commandName: "foo" }),
      null,
      RiskLevel.Medium,
      lang,
      { isShort: true }
    );
    expect(result.risk).toBe("???");
  });
});

// ============================================================
// Property 7: 静的プレースホルダー解決
// ============================================================

describe("Property 7: 静的プレースホルダー解決", () => {
  it("Scenario 7.1: header — labels.header を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.header).toBe("---");
  });

  it("Scenario 7.2: operator — labels['operator_&&'] を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang,
      { operator: "&&" }
    );
    expect(result.operator).toBe("━✅━▸");
  });

  it("Scenario 7.3: operator 未指定 — 空文字", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.operator).toBe("");
  });

  it("Scenario 7.4: chainNotice あり — labels.chainNotice を使用", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang,
      { isChain: true }
    );
    expect(result.chainNotice).toBe("チェーンコマンド");
  });

  it("Scenario 7.5: chainNotice なし — 空文字", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang,
      { isChain: false }
    );
    expect(result.chainNotice).toBe("");
  });

  it("Scenario 7.6: overallRisk — risk と同じラベル解決ルール", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.overallRisk).toBe("🔴 高（破壊操作）");
  });

  it("Scenario 7.7: separator — 常に空文字", () => {
    const result = buildPlaceholderValues(
      makeLabels(),
      makeParsed(),
      makeEntry(),
      RiskLevel.High,
      lang
    );
    expect(result.separator).toBe("");
  });
});
