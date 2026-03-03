import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Part A: 型エクスポート検証 (P7)
// ============================================================

const typesSourcePath = path.join(__dirname, "../../src/types.ts");

describe("StyleOptions / DeepPartial エクスポート (P7)", () => {
  it("types.ts に StyleOptions の export 定義が存在すること", () => {
    const source = fs.readFileSync(typesSourcePath, "utf8");
    expect(source).toMatch(/export\s+interface\s+StyleOptions/);
  });

  it("types.ts に DeepPartial の export 定義が存在すること", () => {
    const source = fs.readFileSync(typesSourcePath, "utf8");
    expect(source).toMatch(/export\s+type\s+DeepPartial/);
  });

  it("StyleOptions が style?: string を持つこと", () => {
    const source = fs.readFileSync(typesSourcePath, "utf8");
    expect(source).toMatch(/style\?\s*:\s*string/);
  });

  it("StyleOptions が overrides?: DeepPartial<FormatterConfig> を持つこと", () => {
    const source = fs.readFileSync(typesSourcePath, "utf8");
    expect(source).toMatch(/overrides\?\s*:\s*DeepPartial\s*<\s*FormatterConfig\s*>/);
  });

  it("DeepPartial が再帰的な型定義であること", () => {
    const source = fs.readFileSync(typesSourcePath, "utf8");
    // DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }
    expect(source).toMatch(/DeepPartial\s*<\s*T\s*>/);
    expect(source).toMatch(/DeepPartial\s*<\s*T\s*\[\s*P\s*\]\s*>/);
  });
});
