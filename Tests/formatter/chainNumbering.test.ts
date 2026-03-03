import { describe, it, expect } from "vitest";
import { formatChainNumber } from "../../src/templateEngine";

// ============================================================
// Part A: dot スタイル (P4)
// ============================================================

describe("formatChainNumber dot (P4)", () => {
  const cases = [
    [1, "1. "],
    [5, "5. "],
    [9, "9. "],
    [10, "10. "],
    [12, "12. "],
    [20, "20. "],
  ] as const;

  for (const [n, expected] of cases) {
    it(`dot(${n}) → "${expected}"`, () => {
      expect(formatChainNumber(n, "dot")).toBe(expected);
    });
  }
});

// ============================================================
// Part B: circled スタイル (P5)
// ============================================================

describe("formatChainNumber circled (P5)", () => {
  const singleDigit = [
    [1, "① "],
    [2, "② "],
    [3, "③ "],
    [4, "④ "],
    [5, "⑤ "],
    [6, "⑥ "],
    [7, "⑦ "],
    [8, "⑧ "],
    [9, "⑨ "],
  ] as const;

  for (const [n, expected] of singleDigit) {
    it(`circled(${n}) → "${expected}"`, () => {
      expect(formatChainNumber(n, "circled")).toBe(expected);
    });
  }

  it("circled(10) → 桁ごと合成 \"①⓪ \"", () => {
    expect(formatChainNumber(10, "circled")).toBe("①⓪ ");
  });

  it("circled(12) → 桁ごと合成 \"①② \"", () => {
    expect(formatChainNumber(12, "circled")).toBe("①② ");
  });
});

// ============================================================
// Part C: keycap スタイル (P6)
// ============================================================

describe("formatChainNumber keycap (P6)", () => {
  it("keycap(1) → \"1\\uFE0F\\u20E3 \"", () => {
    expect(formatChainNumber(1, "keycap")).toBe("1\uFE0F\u20E3 ");
  });

  it("keycap(5) → \"5\\uFE0F\\u20E3 \"", () => {
    expect(formatChainNumber(5, "keycap")).toBe("5\uFE0F\u20E3 ");
  });

  it("keycap(10) → 桁ごと合成 \"1\\uFE0F\\u20E30\\uFE0F\\u20E3 \"", () => {
    expect(formatChainNumber(10, "keycap")).toBe(
      "1\uFE0F\u20E3" + "0\uFE0F\u20E3" + " "
    );
  });
});

// ============================================================
// Part D: dingbat スタイル (P7)
// ============================================================

describe("formatChainNumber dingbat (P7)", () => {
  it("dingbat(1) → \"➊ \"", () => {
    expect(formatChainNumber(1, "dingbat")).toBe("➊ ");
  });

  it("dingbat(5) → \"➎ \"", () => {
    expect(formatChainNumber(5, "dingbat")).toBe("➎ ");
  });

  it("dingbat(9) → \"➒ \"", () => {
    expect(formatChainNumber(9, "dingbat")).toBe("➒ ");
  });

  it("dingbat(10) → 桁ごと合成 \"➊⓪ \"", () => {
    expect(formatChainNumber(10, "dingbat")).toBe("➊⓪ ");
  });

  it("dingbat(12) → 桁ごと合成 \"➊➋ \"", () => {
    expect(formatChainNumber(12, "dingbat")).toBe("➊➋ ");
  });
});

// ============================================================
// Part E: none スタイル (P8)
// ============================================================

describe("formatChainNumber none (P8)", () => {
  it("none(1) → \"\"", () => {
    expect(formatChainNumber(1, "none")).toBe("");
  });

  it("none(10) → \"\"", () => {
    expect(formatChainNumber(10, "none")).toBe("");
  });
});

// ============================================================
// Part F: 未知スタイルのフォールバック
// ============================================================

describe("formatChainNumber 未知スタイル (フォールバック)", () => {
  it("未知スタイルは dot と同じ出力", () => {
    expect(formatChainNumber(1, "unknown")).toBe("1. ");
    expect(formatChainNumber(10, "unknown")).toBe("10. ");
  });
});
