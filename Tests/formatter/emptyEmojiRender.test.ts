import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatExplanation } from "../../src/formatter";
import { parse } from "../../src/parser";
import { assessRisk } from "../../src/riskAssessor";
import { loadDictionary } from "../../src/dictionaryLoader";
import {
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import type { SegmentData, FormatterConfig } from "../../src/types";
import { RiskLevel } from "../../src/types";
import * as fs from "fs";
import * as path from "path";

// --- 辞書読み込み ---

const dictDir = path.join(__dirname, "..", "..", "dictionary");
const dictionary = loadDictionary(dictDir).commands;

// --- スタイル読み込み ---

const stylesDir = path.join(__dirname, "..", "..", "config", "styles");

const legendConfig = JSON.parse(
  fs.readFileSync(path.join(stylesDir, "legend.json"), "utf8")
) as FormatterConfig;

const emojiConfig = JSON.parse(
  fs.readFileSync(path.join(stylesDir, "emoji.json"), "utf8")
) as FormatterConfig;

// --- ヘルパー ---

function detailedSingle(
  command: string,
  config: FormatterConfig,
  language: "ja" | "en" = "ja"
): string {
  setFormatterConfig(config);
  const parsed = parse(command);
  const entry = dictionary[parsed.commandName] ?? null;
  const risk = assessRisk(parsed, entry);
  const segmentData: SegmentData[] = [{ parsed, entry, risk }];
  return formatExplanation(segmentData, [null], risk, {
    format: "detailed",
    language,
  });
}

function detailedChain(
  commands: string[],
  operators: (string | null)[],
  config: FormatterConfig,
  language: "ja" | "en" = "ja"
): string {
  setFormatterConfig(config);
  const segments: SegmentData[] = commands.map((cmd) => {
    const parsed = parse(cmd);
    const entry = dictionary[parsed.commandName] ?? null;
    const risk = assessRisk(parsed, entry);
    return { parsed, entry, risk };
  });
  const overallRisk = segments.reduce(
    (max, s) => {
      const order = [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High, RiskLevel.Critical];
      return order.indexOf(s.risk) > order.indexOf(max) ? s.risk : max;
    },
    RiskLevel.Low
  );
  return formatExplanation(segments, operators, overallRisk, {
    format: "detailed",
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
// Part A: legend スタイルのリスクラベル出力 (P5)
// ============================================================

describe("legend スタイルのリスクラベル出力 (P5)", () => {
  it("ja: legend スタイルで risk ラベルにブロックシェードゲージが含まれること", () => {
    const result = detailedSingle("ls", legendConfig, "ja");
    expect(result).toContain("░░░█ LOW ");
  });

  it("en: legend スタイルで risk ラベルにブロックシェードゲージが含まれること", () => {
    const result = detailedSingle("ls", legendConfig, "en");
    expect(result).toContain("░░░█ LOW ");
  });

  it("ja: legend スタイルで未知コマンドの risk ラベルにゲージが含まれること", () => {
    const result = detailedSingle("unknowncmd123", legendConfig, "ja");
    expect(result).toContain("░░▓█ ???");
  });
});

// ============================================================
// Part B: legend スタイルのチェーンコマンド出力 (P6)
// ============================================================

describe("legend スタイルのチェーンコマンド出力 (P6)", () => {
  it("ja: legend スタイルで overallRisk にブロックシェードゲージが含まれること", () => {
    const result = detailedChain(
      ["ls", "cat"],
      [null, "&&"],
      legendConfig,
      "ja"
    );
    expect(result).toContain("░░░█ LOW ");
  });

  it("en: legend スタイルで overallRisk にブロックシェードゲージが含まれること", () => {
    const result = detailedChain(
      ["ls", "cat"],
      [null, "&&"],
      legendConfig,
      "en"
    );
    expect(result).toContain("░░░█ LOW ");
  });
});

// ============================================================
// Part C: emoji スタイルのリスクラベル出力 (P8)
// ============================================================

describe("emoji スタイルのリスクラベル出力 (P8)", () => {
  const emojiLabelsJa = (emojiConfig as FormatterConfig).labels.ja;

  it("ja: emoji スタイルで risk ラベルが config 値と一致すること", () => {
    const result = detailedSingle("ls", emojiConfig, "ja");
    expect(result).toContain(emojiLabelsJa.risk_low);
  });

  it("ja: emoji スタイルで overallRisk ラベルが config 値と一致すること", () => {
    const result = detailedChain(
      ["ls", "cat"],
      [null, "&&"],
      emojiConfig,
      "ja"
    );
    expect(result).toContain(emojiLabelsJa.risk_low);
  });

  it("ja: emoji スタイルで header がテンプレートに従うこと", () => {
    const result = detailedSingle("ls", emojiConfig, "ja");
    const lines = result.split("\n");
    const template = (emojiConfig as FormatterConfig).templates_long.singleCommand;
    if (template.includes("{header}")) {
      expect(lines[0]).toBe(emojiLabelsJa.header);
    } else {
      // template has no {header} — first line should be first template element
      expect(lines[0]).not.toBe(emojiLabelsJa.header);
    }
  });
});
