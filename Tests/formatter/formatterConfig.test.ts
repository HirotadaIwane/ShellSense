// ============================================================
// formatterConfig.test.ts — Phase 16 Unit 2 Bolt 2
// Property 1: FormatterConfig 型整合性
// Property 2: configLoader 新形式読み込み
// ============================================================

import { describe, it, expect, beforeEach } from "vitest";
import {
  setFormatterConfig,
  getFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import type { FormatterConfig, TemplateLabels } from "../../src/types";

// --- テスト用ヘルパー ---

function makeConfig(): FormatterConfig {
  return {
    version: "2.0.0",
    templates_long: {
      singleCommand:
        "{header}\n{command}\n{flags}\n{target}\n{sudo}\n{separator}\n{risk}",
      chainHeader: "{header}",
      chainSegment: "{command}\n{flags}\n{target}\n{sudo}",
      chainOperator: "  {operator}",
      chainFooter: "{separator}\n{overallRisk}",
    },
    templates_short: {
      singleCommand: "[ShellSense {risk}] {commands}",
      chainCommand: "[ShellSense {risk}] {commands}",
    },
    labels: {
      ja: {
        header: "</>",
        risk_low: "🟢 低（読み取り専用）",
        risk_low_short: "🟢 低",
        risk_medium: "🔶 中（ファイルの変更を含む）",
        risk_medium_short: "🔶 中",
        risk_high: "⚠️ 高（削除・上書きを含む）",
        risk_high_short: "⚠️ 高",
        risk_critical: "🚨 最高（システムレベルの変更・不可逆操作）",
        risk_critical_short: "🚨 最高",
        unknownRisk: "🔶 中（不明なコマンドのため注意してください）",
        unknownRisk_short: "🔶 中",
        unknownCommand: "このコマンドはShellSenseの辞書に未登録です",
        target: "対象:",
        delimiter: " — ",
        indent: "  ",
        chainNotice:
          "ℹ️ 注意: このコマンドは複数のコマンドが連結されています",
        chainNumbering: "dot",
        sudoNotice:
          "sudo: 管理者権限で実行されます（リスクが昇格します）",
        "operator_&&": "━✅━▸",
        "operator_||": "━❌━▸",
        "operator_|": "━📤━▸",
        "operator_;": "━━━▸",
      } as TemplateLabels,
      en: {
        header: "</>",
        risk_low: "🟢 Low (read-only)",
        risk_low_short: "🟢 Low",
        risk_medium: "🔶 Medium (may modify files)",
        risk_medium_short: "🔶 Medium",
        risk_high: "⚠️ High (may delete or overwrite)",
        risk_high_short: "⚠️ High",
        risk_critical: "🚨 Critical (system-level or irreversible)",
        risk_critical_short: "🚨 Critical",
        unknownRisk: "🔶 Medium (unknown command, use with caution)",
        unknownRisk_short: "🔶 Medium",
        unknownCommand:
          "This command is not registered in the ShellSense dictionary",
        target: "Target:",
        delimiter: " — ",
        indent: "  ",
        chainNotice:
          "ℹ️ Note: This command consists of multiple chained commands",
        chainNumbering: "dot",
        sudoNotice:
          "sudo: Running with elevated privileges (risk escalated)",
        "operator_&&": "━✅━▸",
        "operator_||": "━❌━▸",
        "operator_|": "━📤━▸",
        "operator_;": "━━━▸",
      } as TemplateLabels,
    },
  };
}

beforeEach(() => {
  resetFormatterConfig();
});

// ============================================================
// Property 1: FormatterConfig 型の整合性
// ============================================================

describe("Property 1: FormatterConfig 型の整合性", () => {
  it("Scenario 1.1: 新 FormatterConfig の必須フィールド", () => {
    const config = makeConfig();
    setFormatterConfig(config);
    const result = getFormatterConfig();

    expect(result).toHaveProperty("version");
    expect(result).toHaveProperty("templates_long");
    expect(result).toHaveProperty("templates_short");
    expect(result).toHaveProperty("labels");
  });

  it("Scenario 1.2: templates_long の5キー", () => {
    const config = makeConfig();
    setFormatterConfig(config);
    const result = getFormatterConfig();

    expect(result.templates_long).toHaveProperty("singleCommand");
    expect(result.templates_long).toHaveProperty("chainHeader");
    expect(result.templates_long).toHaveProperty("chainSegment");
    expect(result.templates_long).toHaveProperty("chainOperator");
    expect(result.templates_long).toHaveProperty("chainFooter");
    expect(typeof result.templates_long.singleCommand).toBe("string");
    expect(typeof result.templates_long.chainHeader).toBe("string");
  });

  it("Scenario 1.3: templates_short の2キー", () => {
    const config = makeConfig();
    setFormatterConfig(config);
    const result = getFormatterConfig();

    expect(result.templates_short).toHaveProperty("singleCommand");
    expect(result.templates_short).toHaveProperty("chainCommand");
    expect(typeof result.templates_short.singleCommand).toBe("string");
    expect(typeof result.templates_short.chainCommand).toBe("string");
  });

  it("Scenario 1.4: 旧フィールドの非存在", () => {
    const config = makeConfig();
    setFormatterConfig(config);
    const result = getFormatterConfig() as Record<string, unknown>;

    expect(result).not.toHaveProperty("emoji");
    expect(result).not.toHaveProperty("layout");
  });
});

// ============================================================
// Property 2: configLoader の新形式読み込み
// ============================================================

describe("Property 2: configLoader の新形式読み込み", () => {
  it("Scenario 2.1: labels の言語キーが TemplateLabels 構造を持つ", () => {
    const config = makeConfig();
    setFormatterConfig(config);
    const result = getFormatterConfig();

    const ja = result.labels["ja"];
    expect(ja).toBeDefined();
    expect(ja.header).toBe("</>");
    expect(ja.risk_low).toBe("🟢 低（読み取り専用）");
    expect(ja.delimiter).toBe(" — ");
    expect(ja.indent).toBe("  ");
    expect(ja.unknownCommand).toBe(
      "このコマンドはShellSenseの辞書に未登録です"
    );
  });

  it("Scenario 2.2: setFormatterConfig / getFormatterConfig の往復", () => {
    const config = makeConfig();
    setFormatterConfig(config);
    const result = getFormatterConfig();

    expect(result).toBe(config);
  });
});
