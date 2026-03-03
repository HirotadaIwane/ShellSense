import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  singleDetailedResult,
  chainDetailedResult,
  findRiskLine,
  findOverallRiskLine,
  findFlagLines,
} from "../helpers/formatHelpers";
import {
  getFormatterConfig,
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import type { FormatterConfig } from "../../src/types";

// --- セットアップ ---

beforeEach(() => {
  resetFormatterConfig();
});

afterEach(() => {
  resetFormatterConfig();
});

// ============================================================
// chainNotice（Property 1-3, R1.1-R1.4）— 5 it
// ============================================================

describe("chainNotice がチェーンコマンドで表示される (Property 1, R1.1)", () => {
  it("chainSegment テンプレートに {chainNotice} を配置するとセグメントに表示される", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        chainSegment: "{command}\n{chainNotice}\n{flags}\n{target}\n{sudo}",
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");
    const lines = result.split("\n");

    // chainNotice が出力に含まれること
    const chainNoticeLines = lines.filter((l) =>
      l.includes(config.labels["ja"].chainNotice)
    );
    expect(chainNoticeLines.length).toBeGreaterThanOrEqual(1);
  });
});

describe("chainNotice にオペレーター/suffix が含まれない (Property 2, R1.2)", () => {
  it("chainNotice 行に（&&）が含まれない", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        chainSegment: "{command}\n{chainNotice}\n{flags}\n{target}\n{sudo}",
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");
    const lines = result.split("\n");

    const chainNoticeLines = lines.filter((l) =>
      l.includes(config.labels["ja"].chainNotice)
    );
    for (const line of chainNoticeLines) {
      expect(line).not.toContain("（&&）");
      expect(line).not.toContain("（||）");
    }
  });

  it("chainNotice 行は純粋な chainNotice テキストのみ", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        chainSegment: "{command}\n{chainNotice}\n{flags}\n{target}\n{sudo}",
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");

    // chainNotice のテキストが含まれること
    expect(result).toContain(config.labels["ja"].chainNotice);
  });
});

describe("chainNotice の配置場所に従う (Property 3, R1.3)", () => {
  it("chainHeader テンプレートに {chainNotice} を配置するとヘッダーに1回表示される", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        chainHeader: "{header}\n{chainNotice}",
        chainSegment: "{command}\n{flags}\n{target}\n{sudo}",
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");
    const lines = result.split("\n");

    // chainNotice テキストがヘッダー部分に含まれる
    const chainNoticeLines = lines.filter((l) =>
      l.includes(config.labels["ja"].chainNotice)
    );
    // ヘッダーに1回だけ
    expect(chainNoticeLines.length).toBe(1);
  });
});

describe("単一コマンドでは chainNotice 非表示 (Property 1, R1.4)", () => {
  it("singleCommand テンプレートに {chainNotice} があっても表示されない", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        singleCommand: "{header}\n{command}\n{chainNotice}\n{separator}\n{risk}",
      },
    };
    setFormatterConfig(custom);

    const result = singleDetailedResult("ls -la /tmp");

    expect(result).not.toContain(config.labels["ja"].chainNotice);
  });
});

// ============================================================
// emptyLabelSpace（Property 4-5, R2.1-R2.5）— 5 it
// ============================================================

describe("risk ラベル出力時のスペース除去 (Property 4, R2.1)", () => {
  it("デフォルト設定の場合、risk 行に先頭スペースが入らない", () => {
    const result = singleDetailedResult("ls");
    const riskLine = findRiskLine(result);

    expect(riskLine).toBeDefined();
    expect(riskLine!).not.toMatch(/^\s/);
  });
});

describe("カスタム risk ラベル時のスペース除去 (Property 4, R2.2)", () => {
  it("risk_low をカスタム値に変更しても先頭スペースが入らない", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: {
          ...config.labels["ja"],
          risk_low: "LOW-RISK",
        },
      },
    };
    setFormatterConfig(custom);

    const result = singleDetailedResult("ls");
    const lines = result.split("\n");
    const riskLine = lines.find((l) => l.includes("LOW-RISK"));

    expect(riskLine).toBeDefined();
    expect(riskLine!).not.toMatch(/^\s/);
  });
});

describe("risk ラベルのみ出力 (Property 4, R2.3)", () => {
  it("risk_low ラベルがそのまま risk 行として出力される", () => {
    const result = singleDetailedResult("ls");
    const riskLine = findRiskLine(result);

    expect(riskLine).toBeDefined();
    // 先頭スペースなし
    expect(riskLine!).not.toMatch(/^\s/);
    // リスク値が含まれる（emoji + label が一体化した risk_low）
    const config = getFormatterConfig();
    expect(riskLine!).toContain(config.labels["ja"].risk_low);
  });
});

describe("overallRisk 出力時のスペース除去 (Property 4, R2.4)", () => {
  it("チェーンコマンドの overallRisk 行に先頭スペースが入らない", () => {
    const result = chainDetailedResult("ls && pwd");
    const overallLine = findOverallRiskLine(result);

    expect(overallLine).toBeDefined();
    expect(overallLine!).not.toMatch(/^\s/);
  });
});

describe("全ラベル設定時は従来通りの出力 (Property 5, R2.5)", () => {
  it("デフォルトの labels 設定でリスク値が正しく出力される", () => {
    const config = getFormatterConfig();

    const result = singleDetailedResult("ls");
    const riskLine = findRiskLine(result);

    expect(riskLine).toBeDefined();
    // デフォルトの risk_low ラベルが含まれる
    expect(riskLine!).toContain(config.labels["ja"].risk_low);
  });
});

// ============================================================
// indentUnity（Property 6, R3.1-R3.2）— 2 it
// ============================================================

describe("チェーンコマンドのインデントが2スペース (Property 6, R3.1)", () => {
  it("チェーンのフラグ行が2スペースインデントであること", () => {
    const result = chainDetailedResult("rm -rf node_modules && npm install");
    const flagLines = findFlagLines(result);

    expect(flagLines.length).toBeGreaterThan(0);
    const config = getFormatterConfig();
    const indent = config.labels["ja"].indent;
    const indentRegex = new RegExp(`^${indent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\S`);
    for (const line of flagLines) {
      // config の indent で始まり、直後は非スペース
      expect(line).toMatch(indentRegex);
    }
  });
});

describe("単一コマンドとチェーンのインデント一致 (Property 6, R3.2)", () => {
  it("同じフラグ付きコマンドの indent 幅が一致すること", () => {
    const singleResult = singleDetailedResult("rm -rf node_modules");
    const chainResult = chainDetailedResult("rm -rf node_modules && ls");

    const singleFlags = findFlagLines(singleResult);
    const chainFlags = findFlagLines(chainResult);

    expect(singleFlags.length).toBeGreaterThan(0);
    expect(chainFlags.length).toBeGreaterThan(0);

    // 各フラグ行の先頭スペース数を比較
    const config = getFormatterConfig();
    const expectedIndent = config.labels["ja"].indent.length;
    const singleIndent = singleFlags[0].match(/^(\s+)/)![1].length;
    const chainIndent = chainFlags[0].match(/^(\s+)/)![1].length;

    expect(singleIndent).toBe(expectedIndent);
    expect(chainIndent).toBe(expectedIndent);
    expect(singleIndent).toBe(chainIndent);
  });
});

// ============================================================
// overallRiskPrefix（Property 1-3, R1.1-R1.3）— 3 it
// ============================================================

describe("overallRisk カスタムラベル (Property 1, R1.1)", () => {
  it("risk_low をカスタム値に設定した場合、チェーンフッターにその値が表示される", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      labels: {
        ...config.labels,
        ja: {
          ...config.labels["ja"],
          risk_low: "🔷 カスタム低リスク",
        },
      },
    };
    setFormatterConfig(custom);

    const result = chainDetailedResult("ls && pwd");

    // カスタムラベルが出力のどこかに含まれること
    expect(result).toContain("🔷 カスタム低リスク");
  });
});

describe("overallRisk デフォルトラベル (Property 2, R1.2)", () => {
  it("デフォルト設定で overallRisk 行にデフォルトの risk_low ラベルが表示される", () => {
    const config = getFormatterConfig();

    const result = chainDetailedResult("ls && pwd");
    const overallLine = findOverallRiskLine(result);

    expect(overallLine).toBeDefined();
    expect(overallLine!).toContain(config.labels["ja"].risk_low);
  });
});

describe("単一コマンド risk ラベル (Property 3, R1.3)", () => {
  it("単一コマンドの risk 行にデフォルトの risk_low ラベルが表示される", () => {
    const config = getFormatterConfig();

    const result = singleDetailedResult("ls");
    const riskLine = findRiskLine(result);

    expect(riskLine).toBeDefined();
    expect(riskLine!).toContain(config.labels["ja"].risk_low);
  });
});

// ============================================================
// unknownLayout（Property 4-6, R2.1-R2.5）— 4 it
// ============================================================

describe("未知コマンドがテンプレートに従う (Property 4, R2.1)", () => {
  it("未知コマンドがデフォルトの singleCommand テンプレートで出力される", () => {
    const result = singleDetailedResult("zzz_unknown_cmd");

    // 出力にヘッダーとリスク行が含まれること
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThan(0);

    // 未知コマンドのテキストが含まれること
    const config = getFormatterConfig();
    expect(result).toContain(config.labels["ja"].unknownCommand);
  });
});

describe("未知コマンドでテンプレート順序変更が反映される (Property 4, R2.2)", () => {
  it("risk を先頭に配置すると未知コマンドでもリスク行が最初に来る", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        singleCommand: "{risk}\n{header}\n{command}\n{separator}",
      },
    };
    setFormatterConfig(custom);

    const result = singleDetailedResult("zzz_unknown_cmd");
    const lines = result.split("\n").filter((l) => l.trim() !== "");

    // 最初の非空行がリスク行であること（リスクラベルを含む）
    const labels = config.labels["ja"];
    const riskValues = [labels.risk_low, labels.risk_medium, labels.risk_high, labels.risk_critical, labels.unknownRisk];
    expect(riskValues.some((v) => lines[0].includes(v))).toBe(true);

    // header がリスク行より後にあること
    const headerIdx = lines.findIndex((l) => l.includes(config.labels["ja"].header));
    expect(headerIdx).toBeGreaterThan(0);
  });
});

describe("未知コマンドでデータ不在プレースホルダーがスキップ (Property 5, R2.3)", () => {
  it("flags プレースホルダーがテンプレートに含まれていてもエラーなく動作する", () => {
    const config = getFormatterConfig();
    const custom: FormatterConfig = {
      ...config,
      templates_long: {
        ...config.templates_long,
        singleCommand: "{header}\n{risk}\n{command}\n{flags}\n{target}\n{separator}",
      },
    };
    setFormatterConfig(custom);

    // エラーなく実行されること
    const result = singleDetailedResult("zzz_unknown_cmd");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    // フラグ行（インデント + フラグ名）は含まれないこと
    const flagLines = result.split("\n").filter((l) => l.match(/^\s+-\w.*:/));
    expect(flagLines.length).toBe(0);
  });
});

describe("既知コマンドの出力不変 (Property 6, R2.5)", () => {
  it("既知コマンド ls -la /tmp のテンプレート出力が維持される", () => {
    const result = singleDetailedResult("ls -la /tmp");
    const config = getFormatterConfig();

    // テンプレートに {header} が含まれる場合、header が出力に含まれる
    if (config.templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(config.labels["ja"].header);
    }

    // リスク行が含まれる
    const labels = config.labels["ja"];
    const riskValues = [labels.risk_low, labels.risk_medium, labels.risk_high, labels.risk_critical, labels.unknownRisk];
    expect(riskValues.some((v) => result.includes(v))).toBe(true);

    // フラグ説明が含まれる（ls -la にはフラグがある）
    const flagLines = result.split("\n").filter((l) => l.match(/^\s+-\w.*:/));
    expect(flagLines.length).toBeGreaterThan(0);

    // 対象引数が含まれる
    expect(result).toContain("/tmp");
  });
});
