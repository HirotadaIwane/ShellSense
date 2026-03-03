import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- ファイル読み込み ---

const configDir = path.join(__dirname, "..", "..", "config");

const formatterJson = JSON.parse(
  fs.readFileSync(path.join(configDir, "formatter.json"), "utf8")
) as Record<string, unknown>;

const schema = JSON.parse(
  fs.readFileSync(path.join(configDir, "formatter.schema.json"), "utf8")
) as Record<string, unknown>;

// ============================================================
// Part A: formatter.json メタ設定構造 (P5)
// ============================================================

describe("formatter.json メタ設定構造 (P5)", () => {
  it("style フィールドが 'emoji' であること", () => {
    expect(formatterJson.style).toBe("emoji");
  });

  it("overrides フィールドが空オブジェクトであること", () => {
    expect(formatterJson.overrides).toEqual({});
  });

  it("$schema フィールドが存在すること", () => {
    expect(formatterJson).toHaveProperty("$schema");
  });

  it("旧 FormatterConfig プロパティが存在しないこと", () => {
    expect(formatterJson).not.toHaveProperty("version");
    expect(formatterJson).not.toHaveProperty("emoji");
    expect(formatterJson).not.toHaveProperty("labels");
    expect(formatterJson).not.toHaveProperty("layout");
  });
});

// ============================================================
// Part B: スキーマ二面化 (P6)
// ============================================================

describe("スキーマ二面化 (P6)", () => {
  it("トップレベル required に 'style' を含むこと", () => {
    const required = schema.required as string[];
    expect(required).toContain("style");
  });

  it("トップレベル properties に style と overrides があること", () => {
    const properties = schema.properties as Record<string, unknown>;
    expect(properties).toHaveProperty("style");
    expect(properties).toHaveProperty("overrides");
  });

  it("definitions.StyleFile が存在すること", () => {
    const definitions = schema.definitions as Record<string, unknown>;
    expect(definitions).toHaveProperty("StyleFile");
  });

  it("definitions.StyleFile.required に version, templates_long, templates_short, labels を含むこと", () => {
    const definitions = schema.definitions as Record<string, Record<string, unknown>>;
    const styleFile = definitions.StyleFile;
    const required = styleFile.required as string[];
    expect(required).toContain("version");
    expect(required).toContain("templates_long");
    expect(required).toContain("templates_short");
    expect(required).toContain("labels");
  });

  it("definitions に TemplateLabels が存在すること", () => {
    const definitions = schema.definitions as Record<string, unknown>;
    expect(definitions).toHaveProperty("TemplateLabels");
  });
});
