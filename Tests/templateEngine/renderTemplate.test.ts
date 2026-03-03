import { describe, it, expect } from "vitest";
import { renderTemplate } from "../../src/templateEngine";

// ============================================================
// Scenario 1: 基本プレースホルダー置換 (Property 1)
// ============================================================

describe("基本プレースホルダー置換 (Property 1, R1.1)", () => {
  it("テンプレート内の {name} が値で置換される", () => {
    const result = renderTemplate("{header}\n{risk}", {
      header: "</>",
      risk: "🟢 低",
    });
    expect(result).toBe("</>\n🟢 低");
  });
});

// ============================================================
// Scenario 2: 同一行に複数プレースホルダー (Property 1)
// ============================================================

describe("同一行に複数プレースホルダー (Property 1, R1.2)", () => {
  it("1行に複数の {placeholder} がある場合すべて置換される", () => {
    const result = renderTemplate("{a} - {b}", {
      a: "X",
      b: "Y",
    });
    expect(result).toBe("X - Y");
  });
});

// ============================================================
// Scenario 3: 複数行展開 (Property 2)
// ============================================================

describe("複数行展開 (Property 2, R1.3)", () => {
  it("値が string[] の場合、行が複数行に展開される", () => {
    const result = renderTemplate("{command}\n{flags}\n{target}", {
      command: "rm::削除",
      flags: ["  -r: 再帰", "  -f: 強制"],
      target: "  対象: foo",
    });
    const lines = result.split("\n");
    expect(lines).toEqual([
      "rm::削除",
      "  -r: 再帰",
      "  -f: 強制",
      "  対象: foo",
    ]);
  });
});

// ============================================================
// Scenario 4: 空値の行除去 (Property 3)
// ============================================================

describe("空値の行除去 (Property 3, R1.4)", () => {
  it("値が空文字の場合、その行は出力から除去される", () => {
    const result = renderTemplate("{header}\n{risk}\n{flags}\n{target}", {
      header: "</>",
      risk: "🟢 低",
      flags: "",
      target: "",
    });
    const lines = result.split("\n");
    expect(lines).toEqual(["</>", "🟢 低"]);
  });
});

// ============================================================
// Scenario 5: 空配列の行除去 (Property 3)
// ============================================================

describe("空配列の行除去 (Property 3, R1.5)", () => {
  it("値が空配列の場合、その行は出力から除去される", () => {
    const result = renderTemplate("{command}\n{flags}\n{target}", {
      command: "ls::一覧",
      flags: [],
      target: "",
    });
    const lines = result.split("\n");
    expect(lines).toEqual(["ls::一覧"]);
  });
});

// ============================================================
// Scenario 6: separator の空行保持 (Property 4)
// ============================================================

describe("separator の空行保持 (Property 4, R1.6)", () => {
  it("{separator} 行は空行として保持される", () => {
    const result = renderTemplate("{risk}\n{separator}\n{command}", {
      risk: "🟢 低",
      command: "ls::一覧",
    });
    const lines = result.split("\n");
    expect(lines).toEqual(["🟢 低", "", "ls::一覧"]);
  });
});

// ============================================================
// Scenario 7: 未定義プレースホルダーの透過 (Property 5)
// ============================================================

describe("未定義プレースホルダーの透過 (Property 5, R1.7)", () => {
  it("値 Map にないプレースホルダーはそのまま出力される", () => {
    const result = renderTemplate("{header}\n{unknown}\n{risk}", {
      header: "</>",
      risk: "🟢 低",
    });
    const lines = result.split("\n");
    expect(lines).toEqual(["</>", "{unknown}", "🟢 低"]);
  });
});

// ============================================================
// Scenario 8: 固定テキストの透過 (Property 6)
// ============================================================

describe("固定テキストの透過 (Property 6, R1.8)", () => {
  it("プレースホルダーを含まない行はそのまま出力される", () => {
    const result = renderTemplate("{header}\n---\n{risk}", {
      header: "</>",
      risk: "🟢 低",
    });
    const lines = result.split("\n");
    expect(lines).toEqual(["</>", "---", "🟢 低"]);
  });
});
