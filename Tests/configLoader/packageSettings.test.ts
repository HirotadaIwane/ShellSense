import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- package.json 読み込み ---

const packageJsonPath = path.join(
  __dirname, "..", "..",
  "vscode-extension", "package.json"
);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const properties = packageJson.contributes.configuration.properties;

// ============================================================
// Part A: shellsense.style 設定 (P1)
// ============================================================

describe("shellsense.style 設定 (P1)", () => {
  const styleProp = properties["shellsense.style"];

  it("shellsense.style が定義されていること", () => {
    expect(styleProp).toBeDefined();
  });

  it("type が string であること", () => {
    expect(styleProp.type).toBe("string");
  });

  it("default が emoji であること", () => {
    expect(styleProp.default).toBe("emoji");
  });

  it("enum に 4 つのスタイルが含まれること", () => {
    expect(styleProp.enum).toEqual(["emoji", "legend", "ascii", "pro"]);
  });

  it("enumDescriptions が 4 つあること", () => {
    expect(styleProp.enumDescriptions).toHaveLength(4);
  });

  it("description が定義されていること", () => {
    expect(styleProp.description).toBeDefined();
    expect(styleProp.description.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Part B: shellsense.chainNumbering 設定 (P2)
// ============================================================

describe("shellsense.chainNumbering 設定 (P2)", () => {
  const chainProp = properties["shellsense.chainNumbering"];

  it("shellsense.chainNumbering が定義されていること", () => {
    expect(chainProp).toBeDefined();
  });

  it("type が string であること", () => {
    expect(chainProp.type).toBe("string");
  });

  it("default が dot であること", () => {
    expect(chainProp.default).toBe("dot");
  });

  it("enum に 5 つのスタイルが含まれること", () => {
    expect(chainProp.enum).toEqual(["dot", "circled", "keycap", "dingbat", "none"]);
  });

  it("enumDescriptions が 5 つあること", () => {
    expect(chainProp.enumDescriptions).toHaveLength(5);
  });

  it("description が定義されていること", () => {
    expect(chainProp.description).toBeDefined();
    expect(chainProp.description.length).toBeGreaterThan(0);
  });
});
