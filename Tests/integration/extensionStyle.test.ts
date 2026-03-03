import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- extension.ts ソースコード読み込み ---

const extensionPath = path.join(
  __dirname, "..", "..",
  "vscode-extension", "src", "extension.ts"
);
const source = fs.readFileSync(extensionPath, "utf8");
const lines = source.split("\n");

// ============================================================
// Part A: 設定読み取り (P3)
// ============================================================

describe("extension.ts 設定読み取り (P3)", () => {
  it("initFormatterConfig 呼び出し付近で getConfiguration('shellsense') があること", () => {
    const initLineIndex = lines.findIndex(
      (line) => line.includes("initFormatterConfig(") && !line.includes("import")
    );
    expect(initLineIndex).toBeGreaterThan(-1);

    // initFormatterConfig の前 10 行以内に getConfiguration があること
    const surroundingLines = lines.slice(
      Math.max(0, initLineIndex - 10),
      initLineIndex + 1
    ).join("\n");
    expect(surroundingLines).toContain("getConfiguration('shellsense')");
  });

  it("style の設定取得が含まれること", () => {
    // .get<string>('style', ...) パターン（ジェネリック型パラメータ対応）
    expect(source).toMatch(/\.get[^(]*\(\s*['"]style['"]/);
  });

  it("chainNumbering の設定取得が含まれること", () => {
    // .get<string>('chainNumbering', ...) パターン（ジェネリック型パラメータ対応）
    expect(source).toMatch(/\.get[^(]*\(\s*['"]chainNumbering['"]/);
  });
});

// ============================================================
// Part B: initFormatterConfig オプション付き呼び出し (P4)
// ============================================================

describe("extension.ts initFormatterConfig 呼び出し (P4)", () => {
  it("initFormatterConfig が第 2 引数を持つこと", () => {
    // initFormatterConfig(configPath, { ... }) パターン
    const initCallLine = lines.find(
      (line) => line.includes("initFormatterConfig(") && !line.includes("import")
    );
    expect(initCallLine).toBeDefined();
    expect(initCallLine).toContain(",");
  });

  it("overrides が layout.chainNumbering を含むこと", () => {
    // initFormatterConfig 呼び出し周辺のコードブロックを確認
    const initLineIndex = lines.findIndex(
      (line) => line.includes("initFormatterConfig(") && !line.includes("import")
    );
    const codeBlock = lines.slice(initLineIndex, initLineIndex + 5).join("\n");
    expect(codeBlock).toContain("overrides");
    expect(codeBlock).toContain("chainNumbering");
  });
});

// ============================================================
// Part C: デフォルト値の後方互換 (P5)
// ============================================================

describe("extension.ts デフォルト値 (P5)", () => {
  it("style のデフォルト値が 'emoji' であること", () => {
    // .get<string>('style', 'emoji') パターン
    expect(source).toMatch(/['"]style['"]\s*,\s*['"]emoji['"]/);
  });

  it("chainNumbering のデフォルト値が 'dot' であること", () => {
    // .get<string>('chainNumbering', 'dot') パターン
    expect(source).toMatch(/['"]chainNumbering['"]\s*,\s*['"]dot['"]/);
  });
});
