import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  initFormatterConfig,
  getFormatterConfig,
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import type { FormatterConfig } from "../../src/types";

// --- パス定義 ---

const realConfigDir = path.join(__dirname, "../../config");
const fixturesValidDir = path.join(__dirname, "fixtures/valid");
const fixturesMalformedDir = path.join(__dirname, "fixtures/malformed");
const configLoaderSourcePath = path.join(
  __dirname,
  "../../src/configLoader.ts"
);

// --- 各テスト前にキャッシュクリア ---

beforeEach(() => {
  resetFormatterConfig();
});

// ============================================================
// Part A: 正常読み込みテスト (P1, P2, P3)
// ============================================================

// Scenario A-1: getFormatterConfig() の基本動作 (P1)
describe("正常読み込み (P1)", () => {
  it("getFormatterConfig() が version, templates_long, templates_short, labels を持つオブジェクトを返すこと", () => {
    const config = getFormatterConfig();
    expect(config).toHaveProperty("version");
    expect(config).toHaveProperty("templates_long");
    expect(config).toHaveProperty("templates_short");
    expect(config).toHaveProperty("labels");
  });
});

// Scenario A-2: 返却値の正確性 (P2)
describe("値の正確性 (P2)", () => {
  it("version が config/styles/emoji.json の値と一致すること", () => {
    const config = getFormatterConfig();
    const rawJson = JSON.parse(
      fs.readFileSync(path.join(realConfigDir, "styles", "emoji.json"), "utf8")
    );
    expect(config.version).toBe(rawJson.version);
  });

  it("labels.ja.risk_low が config/styles/emoji.json の値と一致すること", () => {
    const config = getFormatterConfig();
    const rawJson = JSON.parse(
      fs.readFileSync(path.join(realConfigDir, "styles", "emoji.json"), "utf8")
    );
    expect(config.labels["ja"].risk_low).toBe(rawJson.labels.ja.risk_low);
  });
});

// Scenario A-3: 明示的パス初期化 (P3)
describe("明示的パス初期化 (P3)", () => {
  it("initFormatterConfig(fixturesValidDir) でフィクスチャを読み込めること", () => {
    initFormatterConfig(fixturesValidDir);
    const config = getFormatterConfig();
    expect(config.version).toBe("test-1.0.0");
  });

  it("フィクスチャ固有の labels 値が返ること", () => {
    initFormatterConfig(fixturesValidDir);
    const config = getFormatterConfig();
    expect(config.labels["ja"].risk_low_short).toBe("T_LOW");
    expect(config.labels["ja"]["operator_&&"]).toBe("T_AND");
  });

  it("フィクスチャ固有の labels.delimiter / chainNumbering 値が返ること", () => {
    initFormatterConfig(fixturesValidDir);
    const config = getFormatterConfig();
    expect(config.labels["ja"].delimiter).toBe(" -- ");
    expect(config.labels["ja"].chainNumbering).toBe("none");
  });
});

// ============================================================
// Part B: キャッシュ動作テスト (P4, P5, P6)
// ============================================================

// Scenario B-1: キャッシュ同一性 (P4)
describe("キャッシュ同一性 (P4)", () => {
  it("2回の getFormatterConfig() が同一参照を返すこと", () => {
    const first = getFormatterConfig();
    const second = getFormatterConfig();
    expect(second).toBe(first);
  });
});

// Scenario B-2: 明示的初期化後のキャッシュ (P5)
describe("明示的初期化後のキャッシュ (P5)", () => {
  it("initFormatterConfig() 後の getFormatterConfig() が同一参照を返すこと", () => {
    initFormatterConfig(fixturesValidDir);
    const first = getFormatterConfig();
    const second = getFormatterConfig();
    expect(second).toBe(first);
    expect(first.version).toBe("test-1.0.0");
  });
});

// Scenario B-3: 自動検出初期化 (P6)
describe("自動検出初期化 (P6)", () => {
  it("未初期化状態で getFormatterConfig() を呼ぶと自動検出で読み込むこと", () => {
    // resetFormatterConfig() は beforeEach で呼ばれている
    const config = getFormatterConfig();
    expect(config).toHaveProperty("version");
    expect(config.version).toBe("2.0.0");
  });
});

// ============================================================
// Part C: テスト用 API テスト (P7, P8)
// ============================================================

// Scenario C-1: setFormatterConfig (P7)
describe("setFormatterConfig (P7)", () => {
  it("setFormatterConfig() で設定したオブジェクトが getFormatterConfig() で返ること", () => {
    const custom: FormatterConfig = {
      version: "custom-test",
      templates_long: {
        singleCommand: "{header}\n{command}\n{flags}\n{target}\n{sudo}\n{separator}\n{risk}",
        chainHeader: "{header}",
        chainSegment: "{command}\n{flags}\n{target}\n{sudo}",
        chainOperator: "  {operator}",
        chainFooter: "{separator}\n{overallRisk}",
      },
      templates_short: {
        singleCommand: "[Custom {risk}] {commands}",
        chainCommand: "[Custom {risk}] {commands}",
      },
      labels: {
        ja: {
          header: "CS",
          risk_low: "CL", risk_low_short: "CS",
          risk_medium: "CM", risk_medium_short: "CMS",
          risk_high: "CH", risk_high_short: "CHS",
          risk_critical: "CC", risk_critical_short: "CCS",
          unknownRisk: "CU", unknownRisk_short: "CUS",
          unknownCommand: "CUC",
          target: "CT:", delimiter: " - ", indent: "  ",
          chainNotice: "CCN", chainNumbering: "dot",
          sudoNotice: "CSUDO",
          "operator_&&": "CA", "operator_||": "CO", "operator_|": "CP", "operator_;": "CS",
        },
      },
    };
    setFormatterConfig(custom);
    const result = getFormatterConfig();
    expect(result).toBe(custom);
    expect(result.version).toBe("custom-test");
  });
});

// Scenario C-2: resetFormatterConfig (P8)
describe("resetFormatterConfig (P8)", () => {
  it("reset 後に getFormatterConfig() がファイルから再読み込みすること", () => {
    const custom: FormatterConfig = {
      version: "will-be-reset",
      templates_long: {
        singleCommand: "", chainHeader: "", chainSegment: "",
        chainOperator: "", chainFooter: "",
      },
      templates_short: {
        singleCommand: "", chainCommand: "",
      },
      labels: {},
    };
    setFormatterConfig(custom);
    expect(getFormatterConfig().version).toBe("will-be-reset");

    resetFormatterConfig();
    const reloaded = getFormatterConfig();
    expect(reloaded).not.toBe(custom);
    expect(reloaded.version).toBe("2.0.0");
  });
});

// ============================================================
// Part D: エラー系テスト (P9, P10, P11)
// ============================================================

// Scenario D-1: 不正パスでフォールバック (P9)
describe("不正パスフォールバック (P9)", () => {
  it("存在しないパスで initFormatterConfig() がフォールバックconfigを返すこと", () => {
    resetFormatterConfig();
    initFormatterConfig("/nonexistent/path/that/does/not/exist");
    const config = getFormatterConfig();
    expect(config).toBeDefined();
    expect(config.version).toBe("2.0.0");
    expect(config.labels.ja).toBeDefined();
    expect(config.labels.en).toBeDefined();
  });
});

// Scenario D-2: 不正JSONでフォールバック (P10)
describe("不正JSONフォールバック (P10)", () => {
  it("不正な JSON で initFormatterConfig() がフォールバックconfigを返すこと", () => {
    resetFormatterConfig();
    initFormatterConfig(fixturesMalformedDir);
    const config = getFormatterConfig();
    expect(config).toBeDefined();
    expect(config.version).toBe("2.0.0");
    expect(config.labels.ja).toBeDefined();
  });
});

// Scenario D-3: エラーハンドリング (P11) — catch によるフォールバック
describe("エラーハンドリング (P11)", () => {
  it("configLoader.ts が catch でフォールバック処理を行うこと", () => {
    const source = fs.readFileSync(configLoaderSourcePath, "utf8");
    expect(source).toContain("catch");
    expect(source).toContain("getDefaultConfig()");
  });
});

// ============================================================
// Part E: ゼロ依存テスト (P12)
// ============================================================

// Scenario E-1: import 制約 (P12)
describe("ゼロ依存 (P12)", () => {
  it("configLoader.ts の import が fs, path, ./types のみであること", () => {
    const source = fs.readFileSync(configLoaderSourcePath, "utf8");
    const importLines = source
      .split("\n")
      .filter((line) => /^\s*import\b/.test(line));

    expect(importLines.length).toBe(3);

    const importSources = importLines.map((line) => {
      const match = line.match(/from\s+["']([^"']+)["']/);
      return match ? match[1] : "";
    });

    expect(importSources).toContain("fs");
    expect(importSources).toContain("path");
    expect(importSources).toContain("./types");
    expect(importSources).toHaveLength(3);
  });
});
