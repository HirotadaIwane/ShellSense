import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatExplanation } from "../../src/formatter";
import { parse } from "../../src/parser";
import { assessRisk } from "../../src/riskAssessor";
import { loadDictionary } from "../../src/dictionaryLoader";
import {
  getFormatterConfig,
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import type {
  SegmentData,
  FormatterConfig,
  CommandEntry,
} from "../../src/types";
import { RiskLevel } from "../../src/types";
import * as path from "path";

// --- 辞書読み込み ---

const dictDir = path.join(__dirname, "..", "..", "dictionary");
const dictionary = loadDictionary(dictDir).commands;

// --- ヘルパー ---

function buildSegment(command: string): {
  segmentData: SegmentData[];
  operators: (string | null)[];
} {
  const parsed = parse(command);
  const entry = dictionary[parsed.commandName] ?? null;
  const risk = assessRisk(parsed, entry);
  return {
    segmentData: [{ parsed, entry, risk }],
    operators: [null],
  };
}

function compactResult(command: string, language: "ja" | "en" = "ja"): string {
  const { segmentData, operators } = buildSegment(command);
  return formatExplanation(segmentData, operators, segmentData[0].risk, {
    format: "compact",
    language,
  });
}

// --- セットアップ ---

beforeEach(() => {
  resetFormatterConfig();
});

afterEach(() => {
  resetFormatterConfig();
});

// ============================================================
// Part A: テンプレート置換 (P9)
// ============================================================

describe("compact テンプレート置換 (P9)", () => {
  it("デフォルトテンプレートで {risk} が置換されること", () => {
    const result = compactResult("ls");
    // デフォルト: "[ShellSense {risk}] {commands}"
    expect(result).toMatch(/^\[ShellSense .+\] .+/);
    expect(result).not.toContain("{risk}");
    expect(result).not.toContain("{commands}");
  });

  it("カスタムテンプレートが反映されること", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_short: {
        ...config.templates_short,
        singleCommand: "<<{risk}>> {commands}",
      },
    };
    setFormatterConfig(custom);

    const result = compactResult("ls");
    expect(result).toMatch(/^<<.+>> .+/);
    expect(result).not.toContain("{risk}");
    expect(result).not.toContain("{commands}");
  });
});

// ============================================================
// Part B: commandDelimiter (P10)
// ============================================================

describe("compact commandDelimiter (P10)", () => {
  it("デフォルトデリミタが使われること", () => {
    const result = compactResult("ls");
    const delim = getFormatterConfig().labels["ja"].delimiter;
    expect(result).toContain(`ls${delim}`);
  });

  it("カスタムデリミタが反映されること", () => {
    const config = getFormatterConfig();
    const defaultDelim = config.labels["ja"].delimiter;
    const customDelim = defaultDelim === " :: " ? " >> " : " :: ";
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: { ...config.labels["ja"], delimiter: customDelim },
        en: { ...config.labels["en"], delimiter: customDelim },
      },
    };
    setFormatterConfig(custom);

    const result = compactResult("ls");
    expect(result).toContain(`ls${customDelim}`);
    expect(result).not.toContain(`ls${defaultDelim}`);
  });

  it("未知コマンドでもデリミタが使われること", () => {
    const result = compactResult("unknowncmd123");
    const delim = getFormatterConfig().labels["ja"].delimiter;
    expect(result).toContain(`unknowncmd123${delim}?`);
  });

  it("カスタムデリミタで未知コマンドも反映", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: { ...config.labels["ja"], delimiter: " >> " },
        en: { ...config.labels["en"], delimiter: " >> " },
      },
    };
    setFormatterConfig(custom);

    const result = compactResult("unknowncmd123");
    expect(result).toContain("unknowncmd123 >> ?");
  });
});

// ============================================================
// Part C: riskShort 合成 (P11)
// ============================================================

describe("compact riskShort 合成 (P11)", () => {
  it("ja / low のリスク表示が risk_low_short を含むこと", () => {
    const result = compactResult("ls", "ja");
    expect(result).toContain(getFormatterConfig().labels["ja"].risk_low_short);
  });

  it("en / low のリスク表示が risk_low_short を含むこと", () => {
    const result = compactResult("ls", "en");
    expect(result).toContain(getFormatterConfig().labels["en"].risk_low_short);
  });

  it("ja / high のリスク表示が risk_high_short を含むこと", () => {
    const result = compactResult("rm -rf node_modules", "ja");
    expect(result).toContain(getFormatterConfig().labels["ja"].risk_high_short);
  });

  it("en / high のリスク表示が risk_high_short を含むこと", () => {
    const result = compactResult("rm -rf node_modules", "en");
    expect(result).toContain(getFormatterConfig().labels["en"].risk_high_short);
  });
});

// ============================================================
// Part D: デフォルト config 出力互換性 (P12)
// ============================================================

describe("compact 出力互換性 (P12)", () => {
  // regex-escape helper
  const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  it("ls の compact/ja が現行形式と一致", () => {
    const result = compactResult("ls", "ja");
    const l = getFormatterConfig().labels["ja"];
    expect(result).toMatch(
      new RegExp(`^\\[ShellSense ${esc(l.risk_low_short)}\\] ls${esc(l.delimiter)}.+`),
    );
  });

  it("ls の compact/en が現行形式と一致", () => {
    const result = compactResult("ls", "en");
    const l = getFormatterConfig().labels["en"];
    expect(result).toMatch(
      new RegExp(`^\\[ShellSense ${esc(l.risk_low_short)}\\] ls${esc(l.delimiter)}.+`),
    );
  });

  it("rm -rf の compact/ja が現行形式と一致", () => {
    const result = compactResult("rm -rf node_modules", "ja");
    const l = getFormatterConfig().labels["ja"];
    expect(result).toMatch(
      new RegExp(`^\\[ShellSense ${esc(l.risk_high_short)}\\] rm${esc(l.delimiter)}.+`),
    );
  });

  it("未知コマンドの compact 出力が現行形式と一致", () => {
    const result = compactResult("unknowncmd123", "ja");
    const l = getFormatterConfig().labels["ja"];
    expect(result).toMatch(
      new RegExp(`^\\[ShellSense ${esc(l.unknownRisk_short)}\\] unknowncmd123${esc(l.delimiter)}\\?$`),
    );
  });
});
