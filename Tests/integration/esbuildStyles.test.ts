import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// --- esbuild ビルド実行 ---

const extensionRoot = path.join(__dirname, "..", "..", "vscode-extension");
const distStylesDir = path.join(extensionRoot, "dist", "config", "styles");

beforeAll(() => {
  execSync("node esbuild.js", {
    cwd: extensionRoot,
    encoding: "utf8",
    timeout: 30000,
  });
});

// ============================================================
// Part A: スタイルファイル出力 (P6)
// ============================================================

describe("esbuild スタイルファイル出力 (P6)", () => {
  it("dist/config/styles/emoji.json が存在すること", () => {
    expect(fs.existsSync(path.join(distStylesDir, "emoji.json"))).toBe(true);
  });

  it("dist/config/styles/legend.json が存在すること", () => {
    expect(fs.existsSync(path.join(distStylesDir, "legend.json"))).toBe(true);
  });

  it("dist/config/styles/ascii.json が存在すること", () => {
    expect(fs.existsSync(path.join(distStylesDir, "ascii.json"))).toBe(true);
  });

  it("dist/config/styles/pro.json が存在すること", () => {
    expect(fs.existsSync(path.join(distStylesDir, "pro.json"))).toBe(true);
  });

  it("各スタイルファイルが有効な JSON であること", () => {
    for (const name of ["emoji", "legend", "ascii", "pro"]) {
      const filePath = path.join(distStylesDir, `${name}.json`);
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      expect(parsed).toHaveProperty("version");
      expect(parsed).toHaveProperty("templates_long");
      expect(parsed).toHaveProperty("templates_short");
      expect(parsed).toHaveProperty("labels");
    }
  });
});
