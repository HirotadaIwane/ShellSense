import { describe, it, expect } from "vitest";
import { makeParsed, makeEntry } from "../helpers/factories";
import {
  formatNotification,
  meetsMinRisk,
  resolveCompoundSubcommand,
  RISK_LABEL,
  RISK_ORDER,
  SegmentData,
} from "../../vscode-extension/src/notificationUtils";
import { RiskLevel } from "../../src/types";
import { getFormatterConfig } from "../../src/configLoader";

// ============================================================
// Scenario 1: meetsMinRisk — 全16パターン (P4, REQ-4)
// ============================================================

describe("Scenario 1: meetsMinRisk — リスクフィルタリング全パターン", () => {
  const levels = [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High, RiskLevel.Critical];

  // risk >= minRisk なら true
  const expected: boolean[][] = [
    // minRisk: Low  Med   High  Crit
    [true,  false, false, false], // risk: Low
    [true,  true,  false, false], // risk: Medium
    [true,  true,  true,  false], // risk: High
    [true,  true,  true,  true],  // risk: Critical
  ];

  for (let r = 0; r < levels.length; r++) {
    for (let m = 0; m < levels.length; m++) {
      const riskLabel = levels[r];
      const minLabel = levels[m];
      const exp = expected[r][m];
      it(`risk=${riskLabel}, minRisk=${minLabel} → ${exp}`, () => {
        expect(meetsMinRisk(riskLabel, minLabel)).toBe(exp);
      });
    }
  }
});

// ============================================================
// Scenario 2-5: resolveCompoundSubcommand (P5, REQ-5)
// ============================================================

describe("Scenario 2: resolveCompoundSubcommand — 単純サブコマンド", () => {
  it("辞書に単純サブコマンドがある場合、そのまま返す", () => {
    const parsed = makeParsed({ commandName: "git", subcommand: "commit", args: ["-m", "msg"] });
    const entry = makeEntry({
      name: "git",
      subcommands: {
        commit: { description: { ja: "コミット", en: "Commit" } },
      },
    });
    const result = resolveCompoundSubcommand(parsed, entry);
    expect(result.subcommand).toBe("commit");
    expect(result.args).toEqual(["-m", "msg"]);
  });
});

describe("Scenario 3: resolveCompoundSubcommand — 複合サブコマンド", () => {
  it("compose + up → 'compose up' に解決し、args[0] を消費する", () => {
    const parsed = makeParsed({ commandName: "docker", subcommand: "compose", args: ["up", "-d"] });
    const entry = makeEntry({
      name: "docker",
      subcommands: {
        "compose up": { description: { ja: "コンテナ起動", en: "Start containers" } },
      },
    });
    const result = resolveCompoundSubcommand(parsed, entry);
    expect(result.subcommand).toBe("compose up");
    expect(result.args).toEqual(["-d"]);
  });
});

describe("Scenario 4: resolveCompoundSubcommand — entry が null", () => {
  it("entry が null の場合、入力をそのまま返す", () => {
    const parsed = makeParsed({ subcommand: "something", args: ["a"] });
    const result = resolveCompoundSubcommand(parsed, null);
    expect(result.subcommand).toBe("something");
    expect(result.args).toEqual(["a"]);
  });
});

describe("Scenario 5: resolveCompoundSubcommand — subcommand が null", () => {
  it("subcommand が null の場合、そのまま返す", () => {
    const parsed = makeParsed({ subcommand: null, args: ["file.txt"] });
    const entry = makeEntry();
    const result = resolveCompoundSubcommand(parsed, entry);
    expect(result.subcommand).toBeNull();
    expect(result.args).toEqual(["file.txt"]);
  });
});

// ============================================================
// Scenario 6-8: formatNotification — 単一コマンド (P1, REQ-1)
// ============================================================

describe("Scenario 6: formatNotification — 単一の既知コマンド (ja)", () => {
  it("[ShellSense 🟢 低] ls — {description.ja} のフォーマットで出力する", () => {
    const segments: SegmentData[] = [
      {
        parsed: makeParsed({ commandName: "ls" }),
        entry: makeEntry({ name: "ls", description: { ja: "ファイル一覧", en: "List files" } }),
        risk: RiskLevel.Low,
      },
    ];
    const result = formatNotification(segments, RiskLevel.Low, "ja");
    const config = getFormatterConfig();
    const l = config.labels.ja;
    expect(result).toBe(`[ShellSense ${l.risk_low_short}] ls${l.delimiter}ファイル一覧`);
  });
});

describe("Scenario 7: formatNotification — 未知コマンド", () => {
  it("entry が null の場合、コマンド名 — ? で表示する", () => {
    const segments: SegmentData[] = [
      {
        parsed: makeParsed({ commandName: "mycmd" }),
        entry: null,
        risk: RiskLevel.Medium,
      },
    ];
    const result = formatNotification(segments, RiskLevel.Medium, "ja");
    const config = getFormatterConfig();
    const l = config.labels.ja;
    expect(result).toBe(`[ShellSense ${l.unknownRisk_short}] mycmd${l.delimiter}?`);
  });
});

describe("Scenario 8: formatNotification — サブコマンド付き", () => {
  it("サブコマンドの説明が表示される", () => {
    const segments: SegmentData[] = [
      {
        parsed: makeParsed({ commandName: "git", subcommand: "status" }),
        entry: makeEntry({
          name: "git",
          description: { ja: "バージョン管理", en: "Version control" },
          subcommands: {
            status: { description: { ja: "状態を表示", en: "Show status" } },
          },
        }),
        risk: RiskLevel.Low,
      },
    ];
    const result = formatNotification(segments, RiskLevel.Low, "ja");
    const config = getFormatterConfig();
    const l = config.labels.ja;
    expect(result).toBe(`[ShellSense ${l.risk_low_short}] git status${l.delimiter}状態を表示`);
  });
});

// ============================================================
// Scenario 9: formatNotification — チェーンコマンド (P2, REQ-2)
// ============================================================

describe("Scenario 9: formatNotification — チェーンコマンド", () => {
  it("複数セグメントが | で連結される", () => {
    const segments: SegmentData[] = [
      {
        parsed: makeParsed({ commandName: "mkdir" }),
        entry: makeEntry({ name: "mkdir", description: { ja: "フォルダ作成", en: "Make dir" } }),
        risk: RiskLevel.Medium,
      },
      {
        parsed: makeParsed({ commandName: "cp" }),
        entry: makeEntry({ name: "cp", description: { ja: "コピー", en: "Copy" } }),
        risk: RiskLevel.Medium,
      },
    ];
    const result = formatNotification(segments, RiskLevel.Medium, "ja");
    const config = getFormatterConfig();
    const l = config.labels.ja;
    expect(result).toBe(`[ShellSense ${l.risk_medium_short}] mkdir${l.delimiter}フォルダ作成 | cp${l.delimiter}コピー`);
  });
});

// ============================================================
// Scenario 10: formatNotification — 英語出力 (P3, REQ-3)
// ============================================================

describe("Scenario 10: formatNotification — 英語出力", () => {
  it("language='en' でリスクラベルと説明が英語になる", () => {
    const segments: SegmentData[] = [
      {
        parsed: makeParsed({ commandName: "ls" }),
        entry: makeEntry({ name: "ls", description: { ja: "ファイル一覧", en: "List files" } }),
        risk: RiskLevel.Low,
      },
    ];
    const result = formatNotification(segments, RiskLevel.Low, "en");
    const config = getFormatterConfig();
    const l = config.labels.en;
    expect(result).toBe(`[ShellSense ${l.risk_low_short}] ls${l.delimiter}List files`);
  });
});

// ============================================================
// Scenario 11: formatNotification — Critical リスク (P1, P3, REQ-1, REQ-3)
// ============================================================

describe("Scenario 11: formatNotification — Critical リスク (ja)", () => {
  it("リスクラベルが 🚨 最高 になる", () => {
    const segments: SegmentData[] = [
      {
        parsed: makeParsed({ commandName: "sudo" }),
        entry: makeEntry({ name: "sudo", description: { ja: "管理者権限で実行", en: "Run as admin" } }),
        risk: RiskLevel.Critical,
      },
    ];
    const result = formatNotification(segments, RiskLevel.Critical, "ja");
    const config = getFormatterConfig();
    const l = config.labels.ja;
    expect(result).toBe(`[ShellSense ${l.risk_critical_short}] sudo${l.delimiter}管理者権限で実行`);
  });
});
