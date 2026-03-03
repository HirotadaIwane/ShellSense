import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- ソースコード読み込み ---

const formatterPath = path.join(__dirname, "..", "..", "src", "formatter.ts");
const source = fs.readFileSync(formatterPath, "utf8");

// ============================================================
// 旧定数削除検証 (P11)
// ============================================================

describe("旧定数削除 (P11)", () => {
  it("RISK_DISPLAY 定数が formatter.ts に存在しないこと (AC-4.1)", () => {
    expect(source).not.toContain("RISK_DISPLAY");
  });

  it("TemplateLabels インターフェースが formatter.ts に存在しないこと (AC-4.2)", () => {
    expect(source).not.toContain("TemplateLabels");
  });

  it("LABELS 定数が formatter.ts に存在しないこと (AC-4.3)", () => {
    // "LABELS" が単独のトークンとして存在しないことを検証
    // （LanguageLabels 等の部分一致は除外）
    expect(source).not.toMatch(/\bLABELS\b(?!:)/);
  });

  it("OPERATOR_DISPLAY 定数が formatter.ts に存在しないこと (AC-4.4)", () => {
    expect(source).not.toContain("OPERATOR_DISPLAY");
  });

  it("旧定数に依存する import が残っていないこと", () => {
    // SupportedLanguage は型として残るが、RISK_DISPLAY 等の定数参照はないこと
    const lines = source.split("\n");
    const constLines = lines.filter(
      (line) => line.includes("const RISK_DISPLAY") ||
                line.includes("const LABELS") ||
                line.includes("const OPERATOR_DISPLAY") ||
                line.includes("interface TemplateLabels")
    );
    expect(constLines).toHaveLength(0);
  });
});
