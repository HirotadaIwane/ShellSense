import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { RiskLevel } from "../../src/types";
import { RISK_LABEL } from "../../vscode-extension/src/notificationUtils";
import { getFormatterConfig } from "../../src/configLoader";

// --- ソースコード読み込み ---

const notificationPath = path.join(
  __dirname, "..", "..",
  "vscode-extension", "src", "notificationUtils.ts"
);
const source = fs.readFileSync(notificationPath, "utf8");

// ============================================================
// Part A: RISK_LABEL 値互換 (P4)
// ============================================================

describe("RISK_LABEL 値互換 (P4)", () => {
  const config = getFormatterConfig();

  it("low/ja が config の risk_low_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.Low]["ja"]).toBe(config.labels.ja.risk_low_short);
  });

  it("low/en が config の risk_low_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.Low]["en"]).toBe(config.labels.en.risk_low_short);
  });

  it("medium/ja が config の risk_medium_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.Medium]["ja"]).toBe(config.labels.ja.risk_medium_short);
  });

  it("medium/en が config の risk_medium_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.Medium]["en"]).toBe(config.labels.en.risk_medium_short);
  });

  it("high/ja が config の risk_high_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.High]["ja"]).toBe(config.labels.ja.risk_high_short);
  });

  it("high/en が config の risk_high_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.High]["en"]).toBe(config.labels.en.risk_high_short);
  });

  it("critical/ja が config の risk_critical_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.Critical]["ja"]).toBe(config.labels.ja.risk_critical_short);
  });

  it("critical/en が config の risk_critical_short と一致すること", () => {
    expect(RISK_LABEL[RiskLevel.Critical]["en"]).toBe(config.labels.en.risk_critical_short);
  });
});

// ============================================================
// Part B: ハードコード削除 (P6)
// ============================================================

describe("RISK_LABEL ハードコード削除 (P6)", () => {
  it("'🟢 低' がハードコードされていないこと", () => {
    expect(source).not.toContain("'🟢 低'");
  });

  it("'🔶 中' がハードコードされていないこと", () => {
    expect(source).not.toContain("'🔶 中'");
  });

  it("'⚠️ 高' がハードコードされていないこと", () => {
    expect(source).not.toContain("'⚠️ 高'");
  });

  it("'🚨 最高' がハードコードされていないこと", () => {
    expect(source).not.toContain("'🚨 最高'");
  });
});

// ============================================================
// Part C: configLoader 使用 (P4)
// ============================================================

describe("notificationUtils configLoader 使用 (P4)", () => {
  it("getFormatterConfig が configLoader からインポートされていること", () => {
    expect(source).toMatch(
      /import\s*\{[^}]*getFormatterConfig[^}]*\}\s*from\s*['"][^'"]*configLoader['"]/
    );
  });

  it("buildRiskLabel 関数が定義されていること", () => {
    expect(source).toContain("buildRiskLabel");
  });
});
