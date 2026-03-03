import { describe, it, expect } from "vitest";
import { scanOutsideQuotes } from "../../src/parser";

// ============================================================
// P1: scanOutsideQuotes はクォート外の文字でのみコールバックを呼ぶ
// ============================================================
describe("P1: クォート外の文字でのみコールバックを呼ぶ", () => {
  it("クォートなしの文字列では全文字でコールバックが呼ばれる", () => {
    const chars: string[] = [];
    scanOutsideQuotes("abc", (ch) => { chars.push(ch); });
    expect(chars).toEqual(["a", "b", "c"]);
  });

  it("コールバックに正しい index が渡される", () => {
    const indices: number[] = [];
    scanOutsideQuotes("abc", (_ch, i) => { indices.push(i); });
    expect(indices).toEqual([0, 1, 2]);
  });

  it("コールバックに元の input が渡される", () => {
    const inputs: string[] = [];
    scanOutsideQuotes("ab", (_ch, _i, inp) => { inputs.push(inp); });
    expect(inputs).toEqual(["ab", "ab"]);
  });
});

// ============================================================
// P2: シングルクォート内の文字をスキップする
// ============================================================
describe("P2: シングルクォート内の文字をスキップ", () => {
  it("シングルクォート内の文字ではコールバックが呼ばれない", () => {
    const chars: string[] = [];
    scanOutsideQuotes("a'bc'd", (ch) => { chars.push(ch); });
    expect(chars).toEqual(["a", "d"]);
  });

  it("シングルクォートのみの文字列ではコールバックが呼ばれない", () => {
    const chars: string[] = [];
    scanOutsideQuotes("'abc'", (ch) => { chars.push(ch); });
    expect(chars).toEqual([]);
  });
});

// ============================================================
// P3: ダブルクォート内の文字をスキップする
// ============================================================
describe("P3: ダブルクォート内の文字をスキップ", () => {
  it("ダブルクォート内の文字ではコールバックが呼ばれない", () => {
    const chars: string[] = [];
    scanOutsideQuotes('a"bc"d', (ch) => { chars.push(ch); });
    expect(chars).toEqual(["a", "d"]);
  });

  it("ダブルクォート内のシングルクォートはスキップされる", () => {
    const chars: string[] = [];
    scanOutsideQuotes(`a"b'c"d`, (ch) => { chars.push(ch); });
    expect(chars).toEqual(["a", "d"]);
  });

  it("シングルクォート内のダブルクォートはスキップされる", () => {
    const chars: string[] = [];
    scanOutsideQuotes(`a'b"c'd`, (ch) => { chars.push(ch); });
    expect(chars).toEqual(["a", "d"]);
  });
});

// ============================================================
// P4: コールバックが true を返すとスキャンが即座に停止する
// ============================================================
describe("P4: true で早期終了", () => {
  it("コールバックが true を返すと以降の文字は処理されない", () => {
    const chars: string[] = [];
    scanOutsideQuotes("abcde", (ch) => {
      chars.push(ch);
      if (ch === "c") return true;
    });
    expect(chars).toEqual(["a", "b", "c"]);
  });

  it("最初の文字で true を返すと1文字のみ処理される", () => {
    const chars: string[] = [];
    scanOutsideQuotes("abc", (ch) => {
      chars.push(ch);
      return true;
    });
    expect(chars).toEqual(["a"]);
  });
});

// ============================================================
// P5: コールバックが数値を返すとその文字数分スキップする
// ============================================================
describe("P5: 数値でスキップ", () => {
  it("2 を返すと次の1文字がスキップされる", () => {
    const chars: string[] = [];
    scanOutsideQuotes("abcde", (ch) => {
      chars.push(ch);
      if (ch === "b") return 2;
    });
    expect(chars).toEqual(["a", "b", "d", "e"]);
  });

  it("3 を返すと次の2文字がスキップされる", () => {
    const chars: string[] = [];
    scanOutsideQuotes("abcde", (ch) => {
      chars.push(ch);
      if (ch === "a") return 3;
    });
    expect(chars).toEqual(["a", "d", "e"]);
  });

  it("|| 演算子の長さ分スキップできる（splitChain のユースケース）", () => {
    const chars: string[] = [];
    scanOutsideQuotes("a||b", (ch, i, inp) => {
      if (inp.substring(i, i + 2) === "||") {
        chars.push("OP");
        return 2;
      }
      chars.push(ch);
    });
    expect(chars).toEqual(["a", "OP", "b"]);
  });
});

// ============================================================
// P6: 空文字列入力ではコールバックが呼ばれない
// ============================================================
describe("P6: 空文字列", () => {
  it("空文字列ではコールバックが一度も呼ばれない", () => {
    let callCount = 0;
    scanOutsideQuotes("", () => { callCount++; });
    expect(callCount).toBe(0);
  });
});

// ============================================================
// P9: CHAIN_OPERATORS がモジュール内で1箇所のみに定義されている
// P10: expandFlags で MAX_SHORT_FLAG_LENGTH が使用されている
// ============================================================
describe("P9/P10: 定数確認（ソースコード検査）", () => {
  // ソースコードを読み取って定数の使用を検証する
  const fs = require("fs");
  const path = require("path");
  const source = fs.readFileSync(
    path.resolve(__dirname, "../../src/parser.ts"),
    "utf-8"
  ) as string;

  it("P9: CHAIN_OPERATORS がモジュールレベルで1箇所のみ定義されている", () => {
    const declarations = source.match(/^const CHAIN_OPERATORS\b/gm);
    expect(declarations).not.toBeNull();
    expect(declarations!.length).toBe(1);
  });

  it("P9: ローカルな operators 配列が存在しない", () => {
    // 関数内で const operators = [...] が定義されていないことを確認
    const localOperators = source.match(/const operators\s*=\s*\[/g);
    expect(localOperators).toBeNull();
  });

  it("P10: MAX_SHORT_FLAG_LENGTH がモジュールレベルで定義されている", () => {
    const declarations = source.match(/^const MAX_SHORT_FLAG_LENGTH\b/gm);
    expect(declarations).not.toBeNull();
    expect(declarations!.length).toBe(1);
  });

  it("P10: expandFlags 内で MAX_SHORT_FLAG_LENGTH が使用されている", () => {
    // expandFlags 関数内に MAX_SHORT_FLAG_LENGTH が存在することを確認
    const expandFlagsMatch = source.match(
      /function expandFlags[\s\S]*?^}/m
    );
    expect(expandFlagsMatch).not.toBeNull();
    expect(expandFlagsMatch![0]).toContain("MAX_SHORT_FLAG_LENGTH");
  });

  it("P10: expandFlags 内にマジックナンバー 2 が残っていない", () => {
    const expandFlagsMatch = source.match(
      /function expandFlags[\s\S]*?^}/m
    );
    expect(expandFlagsMatch).not.toBeNull();
    // token.length <= 2 のパターンが存在しないことを確認
    expect(expandFlagsMatch![0]).not.toMatch(/token\.length\s*<=\s*2/);
  });
});
