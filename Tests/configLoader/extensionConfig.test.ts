import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- ソースコード読み込み ---

const extensionPath = path.join(
  __dirname, "..", "..",
  "vscode-extension", "src", "extension.ts"
);
const source = fs.readFileSync(extensionPath, "utf8");

// ============================================================
// Part A: initFormatterConfig import (P2)
// ============================================================

describe("extension.ts initFormatterConfig import (P2)", () => {
  it("initFormatterConfig が configLoader からインポートされていること", () => {
    expect(source).toMatch(/import\s*\{[^}]*initFormatterConfig[^}]*\}\s*from\s*['"][^'"]*configLoader['"]/);
  });
});

// ============================================================
// Part B: 初期化順序 (P2)
// ============================================================

describe("extension.ts 初期化順序 (P2)", () => {
  it("initFormatterConfig が loadDictionary より前に呼ばれること", () => {
    const initIndex = source.indexOf("initFormatterConfig(");
    const dictIndex = source.indexOf("loadDictionary(");

    expect(initIndex).toBeGreaterThan(-1);
    expect(dictIndex).toBeGreaterThan(-1);
    expect(initIndex).toBeLessThan(dictIndex);
  });

  it("initFormatterConfig のパスが 'dist', 'config' を含むこと", () => {
    // path.join(context.extensionPath, 'dist', 'config') パターン
    const lines = source.split("\n");
    const configPathLine = lines.find(
      (line) => line.includes("initFormatterConfig") && !line.includes("import")
    );
    expect(configPathLine).toBeDefined();

    // 前後の行も含めて dist/config パスの構築を確認
    const initCallIndex = lines.findIndex(
      (line) => line.includes("initFormatterConfig") && !line.includes("import")
    );
    const surroundingCode = lines
      .slice(Math.max(0, initCallIndex - 7), initCallIndex + 1)
      .join("\n");
    expect(surroundingCode).toContain("'dist'");
    expect(surroundingCode).toContain("'config'");
  });
});

// ============================================================
// Part C: 初期化保護 (P3)
// ============================================================

describe("extension.ts 初期化保護 (P3)", () => {
  it("initFormatterConfig が try ブロック内にあること", () => {
    const lines = source.split("\n");
    const initLineIndex = lines.findIndex(
      (line) => line.includes("initFormatterConfig(") && !line.includes("import")
    );
    expect(initLineIndex).toBeGreaterThan(-1);

    // initFormatterConfig より前の行で最寄りの try を探す
    const precedingLines = lines.slice(0, initLineIndex).reverse();
    const tryFound = precedingLines.some((line) => line.includes("try"));
    expect(tryFound).toBe(true);
  });

  it("initFormatterConfig の try に対応する catch があること", () => {
    const lines = source.split("\n");
    const initLineIndex = lines.findIndex(
      (line) => line.includes("initFormatterConfig(") && !line.includes("import")
    );

    // initFormatterConfig より後ろの行で catch を探す
    const followingLines = lines.slice(initLineIndex);
    const catchFound = followingLines.some((line) => line.includes("catch"));
    expect(catchFound).toBe(true);
  });
});
