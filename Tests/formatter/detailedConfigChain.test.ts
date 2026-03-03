import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatExplanation } from "../../src/formatter";
import { parseChain } from "../../src/parser";
import { assessRisk } from "../../src/riskAssessor";
import { loadDictionary } from "../../src/dictionaryLoader";
import {
  getFormatterConfig,
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import type { SegmentData, FormatterConfig } from "../../src/types";
import { RiskLevel } from "../../src/types";
import * as path from "path";

// --- 辞書読み込み ---

const dictDir = path.join(__dirname, "..", "..", "dictionary");
const dictionary = loadDictionary(dictDir).commands;

// --- ヘルパー ---

function buildChainSegments(command: string): {
  segmentData: SegmentData[];
  operators: (string | null)[];
  overallRisk: RiskLevel;
} {
  const chain = parseChain(command);
  const segmentData: SegmentData[] = [];
  const operators: (string | null)[] = [];
  let overallRisk = RiskLevel.Low;

  for (const seg of chain.segments) {
    const entry = dictionary[seg.parsed.commandName] ?? null;
    const risk = assessRisk(seg.parsed, entry);
    segmentData.push({ parsed: seg.parsed, entry, risk });
    operators.push(seg.operator);

    const riskOrder = [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High, RiskLevel.Critical];
    if (riskOrder.indexOf(risk) > riskOrder.indexOf(overallRisk)) {
      overallRisk = risk;
    }
  }

  return { segmentData, operators, overallRisk };
}

function chainDetailedResult(
  command: string,
  language: "ja" | "en" = "ja"
): string {
  const { segmentData, operators, overallRisk } = buildChainSegments(command);
  return formatExplanation(segmentData, operators, overallRisk, {
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
// Part A: Header レイアウト (P6)
// ============================================================

describe("detailedChain Header レイアウト (P6)", () => {
  it("chainHeader テンプレートに {header} があれば先頭行が header であること", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install");
    const config = getFormatterConfig();
    const template = config.templates_long.chainHeader;
    if (template.includes("{header}")) {
      expect(result.split("\n")[0]).toBe(config.labels.ja.header);
    }
  });

  it("ja/en のヘッダーがテンプレートに従って出力されること", () => {
    const config = getFormatterConfig();
    const template = config.templates_long.chainHeader;

    if (template.includes("{header}")) {
      const jaResult = chainDetailedResult("ls && pwd", "ja");
      expect(jaResult.split("\n")[0]).toBe(config.labels["ja"].header);

      const enResult = chainDetailedResult("ls && pwd", "en");
      expect(enResult.split("\n")[0]).toBe(config.labels["en"].header);
    }
  });
});

// ============================================================
// Part B: Segment レイアウト (P7)
// ============================================================

describe("detailedChain Segment レイアウト (P7)", () => {
  it("各セグメントが commandDescription → flagDescriptions → targetArguments の順で出力", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install");
    const lines = result.split("\n");
    const config = getFormatterConfig();
    const l = config.labels.ja;

    // Segment 1: rm with delimiter
    expect(result).toContain(`1. rm${l.delimiter}`);
    // Flags
    expect(lines.some(line => line.match(/^\s+-r:/))).toBe(true);
    expect(lines.some(line => line.match(/^\s+-f:/))).toBe(true);
    // Target
    expect(result).toContain(l.target);
    // Operator
    expect(result).toContain(l["operator_&&"]);
    // Segment 2: npm install
    expect(result).toContain(`2. npm install${l.delimiter}`);
  });

  it("フラグなしセグメントではフラグ行がスキップされること", () => {
    const result = chainDetailedResult("ls && pwd");
    const config = getFormatterConfig();
    const l = config.labels.ja;

    expect(result).toContain(`1. ls${l.delimiter}`);
    expect(result).toContain(l["operator_&&"]);
    expect(result).toContain(`2. pwd${l.delimiter}`);
  });
});

// ============================================================
// Part C: Footer レイアウト (P8)
// ============================================================

describe("detailedChain Footer レイアウト (P8)", () => {
  it("出力に overallRisk ラベルが含まれること", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels.ja.risk_high);
  });

  it("en でも overallRisk が正しく表示", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install", "en");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels.en.risk_high);
  });
});

// ============================================================
// Part D: 演算子 config 化 (P9)
// ============================================================

describe("detailedChain 演算子 config 化 (P9)", () => {
  it("デフォルト config で && が config の operator_&& で表示", () => {
    const result = chainDetailedResult("ls && pwd");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels.ja["operator_&&"]);
  });

  it("デフォルト config で || が config の operator_|| で表示", () => {
    const result = chainDetailedResult("ls || pwd");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels.ja["operator_||"]);
  });

  it("カスタム config で演算子表示が変更されること", () => {
    const config = getFormatterConfig();
    const defaultOp = config.labels.ja["operator_&&"];
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: { ...config.labels["ja"], "operator_&&": "→THEN→" },
        en: { ...config.labels["en"], "operator_&&": "→THEN→" },
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");
    expect(result).toContain("→THEN→");
    expect(result).not.toContain(defaultOp);
  });
});

// ============================================================
// Part E: チェーン番号スタイル (P10)
// ============================================================

describe("detailedChain 番号スタイル (P10)", () => {
  it("デフォルト dot スタイルで番号が付くこと", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install");
    const lines = result.split("\n");

    expect(lines.some(line => /^1\. rm/.test(line))).toBe(true);
    expect(lines.some(line => /^2\. npm/.test(line))).toBe(true);
  });

  it("dot スタイルの番号にデリミタが続くこと", () => {
    const result = chainDetailedResult("ls && pwd");
    const l = getFormatterConfig().labels.ja;
    expect(result).toContain(`1. ls${l.delimiter}`);
    expect(result).toContain(`2. pwd${l.delimiter}`);
  });
});

// ============================================================
// Part F: チェーンデリミタ config 化 (P5+P7)
// ============================================================

describe("detailedChain commandDelimiter (P5+P7)", () => {
  it("デフォルトデリミタが使われること", () => {
    const result = chainDetailedResult("ls && pwd");
    const l = getFormatterConfig().labels.ja;
    expect(result).toContain(`1. ls${l.delimiter}`);
    expect(result).toContain(`2. pwd${l.delimiter}`);
  });

  it("カスタムデリミタが全セグメントに反映されること", () => {
    const config = getFormatterConfig();
    const defaultDelimiter = config.labels.ja.delimiter;
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: { ...config.labels["ja"], delimiter: " >> " },
        en: { ...config.labels["en"], delimiter: " >> " },
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");
    expect(result).toContain("1. ls >> ");
    expect(result).toContain("2. pwd >> ");
    // Verify command lines don't use old delimiter pattern
    expect(result).not.toContain(`1. ls${defaultDelimiter}`);
    expect(result).not.toContain(`2. pwd${defaultDelimiter}`);
  });
});

// ============================================================
// Part G: 出力互換性 (P12)
// ============================================================

describe("detailedChain 出力互換性 (P12)", () => {
  it("rm -rf && npm install の detailed/ja 出力が正しい要素を含むこと", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install");
    const lines = result.split("\n");
    const config = getFormatterConfig();
    const l = config.labels.ja;

    // Segment 1: rm with delimiter
    expect(result).toContain(`1. rm${l.delimiter}`);
    // Flags
    expect(lines.some(line => line.match(/^\s+-r: .+/))).toBe(true);
    expect(lines.some(line => line.match(/^\s+-f: .+/))).toBe(true);
    // Target
    expect(result).toContain(`${l.target} node_modules`);
    // Operator
    expect(result).toContain(l["operator_&&"]);
    // Segment 2: npm install
    expect(result).toContain(`2. npm install${l.delimiter}`);
    // Overall risk
    expect(result).toContain(l.risk_high);
    // Header — only if template includes {header}
    if (config.templates_long.chainHeader.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });
});
