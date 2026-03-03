import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const packageJsonPath = path.join(
  __dirname,
  "..",
  "..",
  "vscode-extension",
  "package.json"
);

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const properties = pkg.contributes?.configuration?.properties ?? {};

// ============================================================
// Scenario 1: hookEnabled 設定スキーマ (P1)
// ============================================================
describe("Scenario 1: shellsense.hookEnabled", () => {
  const setting = properties["shellsense.hookEnabled"];

  it("設定が定義されていること", () => {
    expect(setting).toBeDefined();
  });

  it("型が boolean であること", () => {
    expect(setting.type).toBe("boolean");
  });

  it("デフォルト値が true であること", () => {
    expect(setting.default).toBe(true);
  });

  it("description が定義されていること", () => {
    expect(setting.description).toBeTruthy();
  });
});

// ============================================================
// Scenario 2: terminalEnabled 設定スキーマ (P1)
// ============================================================
describe("Scenario 2: shellsense.terminalEnabled", () => {
  const setting = properties["shellsense.terminalEnabled"];

  it("設定が定義されていること", () => {
    expect(setting).toBeDefined();
  });

  it("型が boolean であること", () => {
    expect(setting.type).toBe("boolean");
  });

  it("デフォルト値が true であること", () => {
    expect(setting.default).toBe(true);
  });

  it("description が定義されていること", () => {
    expect(setting.description).toBeTruthy();
  });
});

// ============================================================
// Scenario 3: notificationFormat 設定スキーマ (P1)
// ============================================================
describe("Scenario 3: shellsense.notificationFormat", () => {
  const setting = properties["shellsense.notificationFormat"];

  it("設定が定義されていること", () => {
    expect(setting).toBeDefined();
  });

  it("型が string であること", () => {
    expect(setting.type).toBe("string");
  });

  it("デフォルト値が 'detailed' であること", () => {
    expect(setting.default).toBe("detailed");
  });

  it("enum に 'detailed' と 'compact' が含まれること", () => {
    expect(setting.enum).toEqual(["detailed", "compact"]);
  });

  it("enumDescriptions が2つ定義されていること", () => {
    expect(setting.enumDescriptions).toHaveLength(2);
  });

  it("description が定義されていること", () => {
    expect(setting.description).toBeTruthy();
  });
});

// ============================================================
// Scenario 4: 既存設定の維持 (P1)
// ============================================================
describe("Scenario 4: 既存設定の維持", () => {
  it("shellsense.enabled が維持されていること", () => {
    expect(properties["shellsense.enabled"]).toBeDefined();
    expect(properties["shellsense.enabled"].type).toBe("boolean");
    expect(properties["shellsense.enabled"].default).toBe(true);
  });

  it("shellsense.language が維持されていること", () => {
    expect(properties["shellsense.language"]).toBeDefined();
    expect(properties["shellsense.language"].enum).toEqual(["ja", "en"]);
  });

  it("shellsense.minRiskLevel が維持されていること", () => {
    expect(properties["shellsense.minRiskLevel"]).toBeDefined();
    expect(properties["shellsense.minRiskLevel"].enum).toEqual([
      "low",
      "medium",
      "high",
      "critical",
    ]);
  });
});
