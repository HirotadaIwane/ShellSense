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
import type { SegmentData, FormatterConfig } from "../../src/types";
import { RiskLevel } from "../../src/types";
import * as path from "path";

// --- 辞書読み込み ---

const dictDir = path.join(__dirname, "..", "..", "dictionary");
const dictionary = loadDictionary(dictDir).commands;

// --- ヘルパー ---

function detailedResult(
  command: string,
  language: "ja" | "en" = "ja"
): string {
  const parsed = parse(command);
  const entry = dictionary[parsed.commandName] ?? null;
  const risk = assessRisk(parsed, entry);
  const segmentData: SegmentData[] = [{ parsed, entry, risk }];
  return formatExplanation(segmentData, [null], risk, {
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
// Part A: レイアウト駆動 (P1)
// ============================================================

describe("detailedSingle テンプレート出力 (P1)", () => {
  it("デフォルト config で ls -la /tmp の出力がテンプレート構造に従うこと", () => {
    const result = detailedResult("ls -la /tmp");
    const lines = result.split("\n");
    const config = getFormatterConfig();
    const l = config.labels.ja;
    const template = config.templates_long.singleCommand;

    // command with delimiter
    expect(result).toContain(`ls${l.delimiter}`);
    // flags
    const flagLines = lines.filter(line => line.match(/^\s+-\w.*:/));
    expect(flagLines.length).toBe(2); // -l, -a
    // target
    expect(result).toContain(`${l.target} /tmp`);
    // risk label
    expect(result).toContain(l.risk_low);
    // header — only if template includes {header}
    if (template.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });

  it("フラグなし・引数なしのコマンドでも出力がテンプレート構造に従うこと", () => {
    const result = detailedResult("ls");
    const config = getFormatterConfig();
    const l = config.labels.ja;

    expect(result).toContain(`ls${l.delimiter}`);
    expect(result).toContain(l.risk_low);
  });
});

// ============================================================
// Part B: ラベル config 化 (P2)
// ============================================================

describe("detailedSingle ラベル config 化 (P2)", () => {
  it("ja の header がテンプレートに従って出力されること", () => {
    const result = detailedResult("ls", "ja");
    const config = getFormatterConfig();
    const template = config.templates_long.singleCommand;
    if (template.includes("{header}")) {
      expect(result).toContain(config.labels["ja"].header);
    }
  });

  it("en の header がテンプレートに従って出力されること", () => {
    const result = detailedResult("ls", "en");
    const config = getFormatterConfig();
    const template = config.templates_long.singleCommand;
    if (template.includes("{header}")) {
      expect(result).toContain(config.labels["en"].header);
    }
  });

  it("ja のリスクラベルが config.labels.ja.risk_low を含む", () => {
    const result = detailedResult("ls", "ja");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels["ja"].risk_low);
  });

  it("en のリスクラベルが config.labels.en.risk_low を含む", () => {
    const result = detailedResult("ls", "en");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels["en"].risk_low);
  });

  it("ja の target ラベルが config.labels.ja.target と一致", () => {
    const result = detailedResult("ls /tmp", "ja");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels["ja"].target);
  });

  it("en の target ラベルが config.labels.en.target と一致", () => {
    const result = detailedResult("ls /tmp", "en");
    const config = getFormatterConfig();
    expect(result).toContain(config.labels["en"].target);
  });
});

// ============================================================
// Part C: リスク合成 (P3)
// ============================================================

describe("detailedSingle リスク合成 (P3)", () => {
  it("ja / low のリスク表示が composeRiskFull の結果を含む", () => {
    const result = detailedResult("ls", "ja");
    expect(result).toContain(getFormatterConfig().labels.ja.risk_low);
  });

  it("en / low のリスク表示が composeRiskFull の結果を含む", () => {
    const result = detailedResult("ls", "en");
    expect(result).toContain(getFormatterConfig().labels.en.risk_low);
  });

  it("ja / high のリスク表示が composeRiskFull の結果を含む", () => {
    const result = detailedResult("rm -rf node_modules", "ja");
    expect(result).toContain(getFormatterConfig().labels.ja.risk_high);
  });

  it("en / high のリスク表示が composeRiskFull の結果を含む", () => {
    const result = detailedResult("rm -rf node_modules", "en");
    expect(result).toContain(getFormatterConfig().labels.en.risk_high);
  });
});

// ============================================================
// Part D: 未知コマンドリスク合成 (P4)
// ============================================================

describe("detailedSingle 未知コマンドリスク合成 (P4)", () => {
  it("ja の未知コマンドで composeUnknownRisk の結果が含まれる", () => {
    const result = detailedResult("unknowncmd123", "ja");
    expect(result).toContain(getFormatterConfig().labels.ja.unknownRisk);
  });

  it("en の未知コマンドで composeUnknownRisk の結果が含まれる", () => {
    const result = detailedResult("unknowncmd123", "en");
    expect(result).toContain(getFormatterConfig().labels.en.unknownRisk);
  });

  it("未知コマンドの unknownCommand ラベルが含まれる", () => {
    const result = detailedResult("unknowncmd123", "ja");
    expect(result).toContain(getFormatterConfig().labels.ja.unknownCommand);
  });
});

// ============================================================
// Part E: commandDelimiter (P5)
// ============================================================

describe("detailedSingle commandDelimiter (P5)", () => {
  it("デフォルトデリミタが使われること", () => {
    const result = detailedResult("ls");
    const l = getFormatterConfig().labels.ja;
    expect(result).toContain(`ls${l.delimiter}`);
  });

  it("カスタムデリミタが反映されること", () => {
    const config = getFormatterConfig();
    const defaultDelimiter = config.labels.ja.delimiter;
    const customDelimiter = defaultDelimiter === " :: " ? " >> " : " :: ";
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: { ...config.labels["ja"], delimiter: customDelimiter },
        en: { ...config.labels["en"], delimiter: customDelimiter },
      },
    };
    setFormatterConfig(custom);

    const result = detailedResult("ls");
    expect(result).toContain(`ls${customDelimiter}`);
    expect(result).not.toContain(`ls${defaultDelimiter}`);
  });

  it("未知コマンドでもカスタムデリミタが反映", () => {
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

    const result = detailedResult("unknowncmd123");
    expect(result).toContain("unknowncmd123 >> ");
    expect(result).not.toContain(defaultDelimiter);
  });
});

// ============================================================
// Part F: 出力互換性 (P12)
// ============================================================

describe("detailedSingle 出力互換性 (P12)", () => {
  it("ls -la /tmp の detailed/ja 出力が正しい要素を含むこと", () => {
    const result = detailedResult("ls -la /tmp", "ja");
    const lines = result.split("\n");
    const config = getFormatterConfig();
    const l = config.labels.ja;

    expect(result).toContain(`ls${l.delimiter}`);
    expect(lines.some(line => line.match(/^\s+-l: .+/))).toBe(true);
    expect(lines.some(line => line.match(/^\s+-a: .+/))).toBe(true);
    expect(result).toContain(`${l.target} /tmp`);
    expect(result).toContain(l.risk_low);
    if (config.templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });

  it("未知コマンドの detailed/ja 出力が正しい要素を含むこと", () => {
    const result = detailedResult("unknowncmd123", "ja");
    const config = getFormatterConfig();
    const l = config.labels.ja;

    expect(result).toContain(`unknowncmd123${l.delimiter}`);
    expect(result).toContain(l.unknownRisk);
  });
});
