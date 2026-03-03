// ============================================================
// outputEquivalence.test.ts — Phase 16 Unit 2 Bolt 2
// Property 3-7: formatter 出力等価性テスト
// ============================================================

import { describe, it, expect, beforeEach } from "vitest";
import {
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import { formatExplanation } from "../../src/formatter";
import {
  makeParsed as _makeParsed,
  makeEntry,
  makeLabels,
  makeConfig,
} from "../helpers/factories";
import {
  RiskLevel,
  type ParsedCommand,
  type CommandEntry,
  type SegmentData,
  type FormatOptions,
  type FormatterConfig,
  type TemplateLabels,
} from "../../src/types";

// --- テスト用ヘルパー ---

function makeEmojiConfig(): FormatterConfig {
  return makeConfig();
}

function makeStyleConfig(
  style: "ascii" | "legend" | "pro"
): FormatterConfig {
  const configs: Record<string, { labels: TemplateLabels }> = {
    ascii: {
      labels: makeLabels({
        header: "===",
        risk_low: "[OK] Low (read-only)",
        risk_low_short: "[OK] Low",
        risk_medium: "[?] Medium (may modify files)",
        risk_medium_short: "[?] Medium",
        risk_high: "[!] High (may delete or overwrite)",
        risk_high_short: "[!] High",
        risk_critical: "[!!] Critical (system-level or irreversible)",
        risk_critical_short: "[!!] Critical",
        unknownRisk: "[?] Medium (unknown command, use with caution)",
        unknownRisk_short: "[?] Medium",
        unknownCommand:
          "This command is not registered in the ShellSense dictionary",
        target: "Target:",
        delimiter: " -- ",
        chainNotice:
          "[i] Note: This command consists of multiple chained commands",
        sudoNotice:
          "sudo: Running with elevated privileges (risk escalated)",
        "operator_&&": "==>>>",
        "operator_||": "==X>>",
        "operator_|": "==|>>",
        "operator_;": "====>",
      }),
    },
    legend: {
      labels: makeLabels({
        header: "",
        risk_low: "░░░█ LOW ",
        risk_low_short: "░░░█ LOW ",
        risk_medium: "░░▓█ MED ",
        risk_medium_short: "░░▓█ MED ",
        risk_high: "░▓██ HIGH",
        risk_high_short: "░▓██ HIGH",
        risk_critical: "▓███ CRIT",
        risk_critical_short: "▓███ CRIT",
        unknownRisk: "░░▓█ ??? ",
        unknownRisk_short: "░░▓█ ???",
        unknownCommand: "未登録コマンド",
        target: "▸",
        delimiter: " ▸ ",
        indent: "│   ",
        chainNotice: "⛓",
        sudoNotice: "⚡sudo",
        "operator_&&": "&&",
        "operator_||": "||",
        "operator_|": "|",
        "operator_;": ";",
      }),
    },
    pro: {
      labels: makeLabels({
        header: "---",
        risk_low: "Low",
        risk_low_short: "LOW",
        risk_medium: "Medium",
        risk_medium_short: "MED",
        risk_high: "High",
        risk_high_short: "HIGH",
        risk_critical: "Critical",
        risk_critical_short: "CRIT",
        unknownRisk: "Medium",
        unknownRisk_short: "MED",
        unknownCommand: "Unknown command",
        target: "Target:",
        delimiter: " -- ",
        chainNotice: "Chained commands",
        sudoNotice: "sudo: elevated privileges",
        "operator_&&": ">>",
        "operator_||": "X>",
        "operator_|": "|>",
        "operator_;": ">>",
      }),
    },
  };
  const c = configs[style];
  const templates_short = style === "pro"
    ? { singleCommand: "{risk} {commands}", chainCommand: "{risk} {commands}" }
    : style === "legend"
      ? { singleCommand: "{risk} ┃ {commands}", chainCommand: "{risk} ┃ {commands}" }
      : { singleCommand: "[ShellSense {risk}] {commands}", chainCommand: "[ShellSense {risk}] {commands}" };
  const overrides: Partial<FormatterConfig> = {
    templates_short,
    labels: { ja: c.labels, en: c.labels },
  };
  if (style === "legend") {
    overrides.templates_long = {
      singleCommand: "{risk} ┃ {command} ┃ {flags} ┃ {target}\n{sudo}",
      chainHeader: "{overallRisk} ┃ {chainNotice}\n{sudo}",
      chainSegment: "├── {command} ┃ {flags} ┃ {target}",
      chainOperator: "│   {operator}",
      chainFooter: "",
    };
  }
  return makeConfig(overrides);
}

function makeParsed(overrides?: Partial<ParsedCommand>): ParsedCommand {
  return _makeParsed({
    raw: "rm -rf node_modules",
    commandName: "rm",
    flags: ["-r", "-f"],
    args: ["node_modules"],
    ...overrides,
  });
}

function makeRmEntry() {
  return makeEntry({
    name: "rm",
    description: {
      ja: "ファイルやフォルダを削除",
      en: "Remove files or directories",
    },
    baseRisk: RiskLevel.High,
    category: "filesystem",
    flags: {
      "-r": {
        description: {
          ja: "フォルダの中身も含めて再帰的に削除",
          en: "Remove directories recursively",
        },
        riskModifier: RiskLevel.High,
      },
      "-f": {
        description: {
          ja: "確認なしで強制削除",
          en: "Force removal without confirmation",
        },
        riskModifier: RiskLevel.High,
      },
    },
  });
}

function makeLsEntry() {
  return makeEntry({
    name: "ls",
    description: {
      ja: "ファイルやフォルダの一覧を表示",
      en: "List directory contents",
    },
    baseRisk: RiskLevel.Low,
    category: "filesystem",
    flags: {
      "-l": {
        description: { ja: "詳細情報を表示", en: "Use long listing format" },
      },
      "-a": {
        description: { ja: "隠しファイルも表示", en: "Show hidden files" },
      },
    },
  });
}

function makeCdEntry() {
  return makeEntry({
    name: "cd",
    description: {
      ja: "作業ディレクトリを移動",
      en: "Change working directory",
    },
    baseRisk: RiskLevel.Low,
    category: "shell",
  });
}

function makeGitEntry() {
  return makeEntry({
    name: "git",
    description: {
      ja: "Gitバージョン管理システムを操作",
      en: "Git version control system",
    },
    baseRisk: RiskLevel.Low,
    category: "other",
    subcommands: {
      status: {
        description: {
          ja: "変更されたファイルの状態を表示",
          en: "Show working tree status",
        },
      },
    },
  });
}

function makeSegment(
  parsed: ParsedCommand,
  entry: CommandEntry | null,
  risk: RiskLevel
): SegmentData {
  return { parsed, entry, risk };
}

const detailedJa: FormatOptions = { format: "detailed", language: "ja" };
const detailedEn: FormatOptions = { format: "detailed", language: "en" };
const compactJa: FormatOptions = { format: "compact", language: "ja" };

beforeEach(() => {
  resetFormatterConfig();
});

// ============================================================
// Property 3: formatDetailedSingle の出力
// ============================================================

describe("Property 3: formatDetailedSingle の出力", () => {
  it("Scenario 3.1: 既知コマンド（emoji/ja） — rm -rf node_modules", () => {
    setFormatterConfig(makeEmojiConfig());
    const segment = makeSegment(makeParsed(), makeRmEntry(), RiskLevel.High);
    const result = formatExplanation([segment], [null], RiskLevel.High, detailedJa);

    expect(result).toBe(
      [
        "</>",
        "rm — ファイルやフォルダを削除",
        "  -r: フォルダの中身も含めて再帰的に削除",
        "  -f: 確認なしで強制削除",
        "  対象: node_modules",
        "",
        "⚠️ 高（削除・上書きを含む）",
      ].join("\n")
    );
  });

  it("Scenario 3.2: 未知コマンド（emoji/ja） — foo", () => {
    setFormatterConfig(makeEmojiConfig());
    const parsed = makeParsed({
      raw: "foo",
      commandName: "foo",
      flags: [],
      args: [],
    });
    const segment = makeSegment(parsed, null, RiskLevel.Medium);
    const result = formatExplanation([segment], [null], RiskLevel.Medium, detailedJa);

    expect(result).toBe(
      [
        "</>",
        "foo — このコマンドはShellSenseの辞書に未登録です",
        "",
        "🔶 中（不明なコマンドのため注意してください）",
      ].join("\n")
    );
  });

  it("Scenario 3.3: sudo 付きコマンド（emoji/ja） — sudo rm -rf /", () => {
    setFormatterConfig(makeEmojiConfig());
    const parsed = makeParsed({
      raw: "sudo rm -rf /",
      hasSudo: true,
      args: ["/"],
    });
    const segment = makeSegment(parsed, makeRmEntry(), RiskLevel.Critical);
    const result = formatExplanation([segment], [null], RiskLevel.Critical, detailedJa);

    expect(result).toBe(
      [
        "</>",
        "sudo rm — ファイルやフォルダを削除",
        "  -r: フォルダの中身も含めて再帰的に削除",
        "  -f: 確認なしで強制削除",
        "  対象: /",
        "  sudo: 管理者権限で実行されます（リスクが昇格します）",
        "",
        "🚨 最高（システムレベルの変更・不可逆操作）",
      ].join("\n")
    );
  });

  it("Scenario 3.4: 既知コマンド（emoji/en） — rm -rf node_modules", () => {
    setFormatterConfig(makeEmojiConfig());
    const segment = makeSegment(makeParsed(), makeRmEntry(), RiskLevel.High);
    const result = formatExplanation([segment], [null], RiskLevel.High, detailedEn);

    expect(result).toBe(
      [
        "</>",
        "rm — Remove files or directories",
        "  -r: Remove directories recursively",
        "  -f: Force removal without confirmation",
        "  Target: node_modules",
        "",
        "⚠️ High (may delete or overwrite)",
      ].join("\n")
    );
  });
});

// ============================================================
// Property 4: formatDetailedChain の出力
// ============================================================

describe("Property 4: formatDetailedChain の出力", () => {
  it("Scenario 4.1: 2セグメントチェーン（emoji/ja） — cd /foo && git status", () => {
    setFormatterConfig(makeEmojiConfig());

    const cdParsed = makeParsed({
      raw: "cd /foo",
      commandName: "cd",
      flags: [],
      args: ["/foo"],
      hasChain: true,
      chainOperator: "&&",
    });
    const gitParsed = makeParsed({
      raw: "git status",
      commandName: "git",
      subcommand: "status",
      flags: [],
      args: [],
      hasChain: true,
      chainOperator: "&&",
    });

    const segments: SegmentData[] = [
      makeSegment(cdParsed, makeCdEntry(), RiskLevel.Low),
      makeSegment(gitParsed, makeGitEntry(), RiskLevel.Low),
    ];
    const operators: (string | null)[] = [null, "&&"];

    const result = formatExplanation(
      segments,
      operators,
      RiskLevel.Low,
      detailedJa
    );

    expect(result).toBe(
      [
        "</>",
        "1. cd — 作業ディレクトリを移動",
        "  対象: /foo",
        "  ━✅━▸",
        "2. git status — 変更されたファイルの状態を表示",
        "",
        "🟢 低（読み取り専用）",
      ].join("\n")
    );
  });
});

// ============================================================
// Property 5: formatCompact の出力
// ============================================================

describe("Property 5: formatCompact の出力", () => {
  it("Scenario 5.1: 単一コマンド compact（emoji/ja） — ls -la /tmp", () => {
    setFormatterConfig(makeEmojiConfig());
    const parsed = makeParsed({
      raw: "ls -la /tmp",
      commandName: "ls",
      flags: ["-l", "-a"],
      args: ["/tmp"],
    });
    const segment = makeSegment(parsed, makeLsEntry(), RiskLevel.Low);
    const result = formatExplanation([segment], [null], RiskLevel.Low, compactJa);

    expect(result).toBe(
      "[ShellSense 🟢 低] ls — ファイルやフォルダの一覧を表示"
    );
  });

  it("Scenario 5.2: チェーン compact（emoji/ja） — cd /foo && git status", () => {
    setFormatterConfig(makeEmojiConfig());

    const cdParsed = makeParsed({
      raw: "cd /foo",
      commandName: "cd",
      flags: [],
      args: ["/foo"],
      hasChain: true,
    });
    const gitParsed = makeParsed({
      raw: "git status",
      commandName: "git",
      subcommand: "status",
      flags: [],
      args: [],
      hasChain: true,
    });

    const segments: SegmentData[] = [
      makeSegment(cdParsed, makeCdEntry(), RiskLevel.Low),
      makeSegment(gitParsed, makeGitEntry(), RiskLevel.Low),
    ];

    const result = formatExplanation(
      segments,
      [null, "&&"],
      RiskLevel.Low,
      compactJa
    );

    expect(result).toBe(
      "[ShellSense 🟢 低] cd — 作業ディレクトリを移動 | git status — 変更されたファイルの状態を表示"
    );
  });
});

// ============================================================
// Property 6: formatExplanation API 互換性
// ============================================================

describe("Property 6: formatExplanation API 互換性", () => {
  it("Scenario 6.1: formatExplanation が関数として export されている", () => {
    expect(typeof formatExplanation).toBe("function");
    expect(formatExplanation.length).toBe(4);
  });

  it("Scenario 6.2: compact / detailed single / detailed chain の分岐", () => {
    setFormatterConfig(makeEmojiConfig());
    const rmSeg = makeSegment(makeParsed(), makeRmEntry(), RiskLevel.High);

    // compact
    const compact = formatExplanation(
      [rmSeg],
      [null],
      RiskLevel.High,
      compactJa
    );
    expect(compact).toContain("[ShellSense");

    // detailed single
    const single = formatExplanation(
      [rmSeg],
      [null],
      RiskLevel.High,
      detailedJa
    );
    expect(single).toContain("</>");
    expect(single).not.toContain("[ShellSense");

    // detailed chain
    const cdSeg = makeSegment(
      makeParsed({ raw: "cd /", commandName: "cd", flags: [], args: ["/"] }),
      makeCdEntry(),
      RiskLevel.Low
    );
    const chain = formatExplanation(
      [cdSeg, rmSeg],
      [null, "&&"],
      RiskLevel.High,
      detailedJa
    );
    expect(chain).toContain("1. ");
    expect(chain).toContain("2. ");
  });
});

// ============================================================
// Property 7: 多スタイル検証
// ============================================================

describe("Property 7: 多スタイル検証", () => {
  it("Scenario 7.1: ascii スタイル detailed", () => {
    setFormatterConfig(makeStyleConfig("ascii"));
    const segment = makeSegment(makeParsed(), makeRmEntry(), RiskLevel.High);
    const result = formatExplanation([segment], [null], RiskLevel.High, detailedJa);

    expect(result).toContain("===");
    expect(result).toContain("[!] High (may delete or overwrite)");
    expect(result).toContain("rm -- ");
  });

  it("Scenario 7.2: legend スタイル detailed", () => {
    setFormatterConfig(makeStyleConfig("legend"));
    const segment = makeSegment(makeParsed(), makeRmEntry(), RiskLevel.High);
    const result = formatExplanation([segment], [null], RiskLevel.High, detailedJa);

    expect(result).toContain("░▓██ HIGH");
    expect(result).toContain("┃");
    expect(result).toContain("rm ▸ ");
  });

  it("Scenario 7.3: pro スタイル detailed", () => {
    setFormatterConfig(makeStyleConfig("pro"));
    const segment = makeSegment(makeParsed(), makeRmEntry(), RiskLevel.High);
    const result = formatExplanation([segment], [null], RiskLevel.High, detailedJa);

    expect(result).toContain("---");
    expect(result).toContain("High");
    expect(result).toContain("rm -- ");
  });

  it("Scenario 7.4: ascii compact", () => {
    setFormatterConfig(makeStyleConfig("ascii"));
    const parsed = makeParsed({
      commandName: "ls",
      flags: [],
      args: [],
    });
    const segment = makeSegment(parsed, makeLsEntry(), RiskLevel.Low);
    const result = formatExplanation([segment], [null], RiskLevel.Low, compactJa);

    expect(result).toContain("[ShellSense [OK] Low]");
  });

  it("Scenario 7.5: legend compact", () => {
    setFormatterConfig(makeStyleConfig("legend"));
    const parsed = makeParsed({
      commandName: "ls",
      flags: [],
      args: [],
    });
    const segment = makeSegment(parsed, makeLsEntry(), RiskLevel.Low);
    const result = formatExplanation([segment], [null], RiskLevel.Low, compactJa);

    expect(result).toContain("░░░█ LOW ");
    expect(result).toContain("┃");
  });

  it("Scenario 7.6: pro compact", () => {
    setFormatterConfig(makeStyleConfig("pro"));
    const parsed = makeParsed({
      commandName: "ls",
      flags: [],
      args: [],
    });
    const segment = makeSegment(parsed, makeLsEntry(), RiskLevel.Low);
    const result = formatExplanation([segment], [null], RiskLevel.Low, compactJa);

    expect(result).toBe("LOW ls -- ファイルやフォルダの一覧を表示");
  });
});
