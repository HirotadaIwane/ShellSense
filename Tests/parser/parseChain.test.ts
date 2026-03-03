import { describe, it, expect } from "vitest";
import { parseChain } from "../../src/parser";

// --- Scenario 1: 単一コマンドの互換性 (Property 1) ---
describe("単一コマンドの互換性", () => {
  it("単一コマンドで segments.length === 1, isChain === false", () => {
    const result = parseChain("ls -la");
    expect(result.segments).toHaveLength(1);
    expect(result.isChain).toBe(false);
    expect(result.segments[0].operator).toBeNull();
    expect(result.segments[0].parsed.commandName).toBe("ls");
  });
});

// --- Scenario 2: 2コマンド && チェーン (Property 2) ---
describe("2コマンド && チェーン", () => {
  it("rm -rf && npm install を正しく分割する", () => {
    const result = parseChain("rm -rf node_modules && npm install");
    expect(result.segments).toHaveLength(2);
    expect(result.isChain).toBe(true);
    expect(result.segments[0].parsed.commandName).toBe("rm");
    expect(result.segments[0].operator).toBeNull();
    expect(result.segments[1].parsed.commandName).toBe("npm");
    expect(result.segments[1].operator).toBe("&&");
  });
});

// --- Scenario 3: 2コマンド || チェーン (Property 5) ---
describe("2コマンド || チェーン", () => {
  it("|| で正しく分割する", () => {
    const result = parseChain("cmd1 || cmd2");
    expect(result.segments).toHaveLength(2);
    expect(result.isChain).toBe(true);
    expect(result.segments[1].operator).toBe("||");
  });
});

// --- Scenario 4: 2コマンド | パイプ (Property 5) ---
describe("2コマンド | パイプ", () => {
  it("| で正しく分割する", () => {
    const result = parseChain("ls -la | grep test");
    expect(result.segments).toHaveLength(2);
    expect(result.isChain).toBe(true);
    expect(result.segments[0].parsed.commandName).toBe("ls");
    expect(result.segments[1].parsed.commandName).toBe("grep");
    expect(result.segments[1].operator).toBe("|");
  });
});

// --- Scenario 5: 2コマンド ; セミコロン (Property 5) ---
describe("2コマンド ; セミコロン", () => {
  it("; で正しく分割する", () => {
    const result = parseChain("echo hello ; echo world");
    expect(result.segments).toHaveLength(2);
    expect(result.isChain).toBe(true);
    expect(result.segments[1].operator).toBe(";");
  });
});

// --- Scenario 6: 3コマンドチェーン (Property 3) ---
describe("3コマンドチェーン", () => {
  it("3つのコマンドを正しく分割する", () => {
    const result = parseChain("mkdir -p /tmp/test && cd /tmp/test && ls");
    expect(result.segments).toHaveLength(3);
    expect(result.isChain).toBe(true);
    expect(result.segments[0].parsed.commandName).toBe("mkdir");
    expect(result.segments[0].operator).toBeNull();
    expect(result.segments[1].parsed.commandName).toBe("cd");
    expect(result.segments[1].operator).toBe("&&");
    expect(result.segments[2].parsed.commandName).toBe("ls");
    expect(result.segments[2].operator).toBe("&&");
  });
});

// --- Scenario 7: シングルクォート内の演算子は無視 (Property 4) ---
describe("シングルクォート内の演算子は無視", () => {
  it("引用符内の && を分割しない", () => {
    const result = parseChain("echo 'a && b'");
    expect(result.segments).toHaveLength(1);
    expect(result.isChain).toBe(false);
  });
});

// --- Scenario 8: ダブルクォート内の演算子は無視 (Property 4) ---
describe("ダブルクォート内の演算子は無視", () => {
  it("ダブルクォート内の || を分割しない", () => {
    const result = parseChain('echo "a || b"');
    expect(result.segments).toHaveLength(1);
    expect(result.isChain).toBe(false);
  });
});

// --- Scenario 9: 各セグメントのフラグ・引数が正確 (Property 6) ---
describe("各セグメントのフラグ・引数が正確", () => {
  it("各セグメントのパース結果が正しい", () => {
    const result = parseChain("rm -rf node_modules && npm install --save-dev vitest");
    expect(result.segments[0].parsed.flags).toContain("-r");
    expect(result.segments[0].parsed.flags).toContain("-f");
    expect(result.segments[0].parsed.args).toContain("node_modules");
    expect(result.segments[1].parsed.commandName).toBe("npm");
    expect(result.segments[1].parsed.subcommand).toBe("install");
    expect(result.segments[1].parsed.flags).toContain("--save-dev");
  });
});

// --- Scenario 10: 空文字列の安全処理 (Property 7) ---
describe("空文字列の安全処理", () => {
  it("空文字列で segments.length === 1, isChain === false", () => {
    const result = parseChain("");
    expect(result.segments).toHaveLength(1);
    expect(result.isChain).toBe(false);
    expect(result.segments[0].parsed.commandName).toBe("");
  });
});

// --- Scenario 11: raw フィールドの保持 ---
describe("raw フィールドの保持", () => {
  it("元の入力文字列が raw に保持される", () => {
    const input = "rm -rf foo && npm install";
    const result = parseChain(input);
    expect(result.raw).toBe(input);
  });
});

// --- Scenario 12: 混合演算子チェーン (Property 3, 5) ---
describe("混合演算子チェーン", () => {
  it("異なる演算子で4つに分割される", () => {
    const result = parseChain("cmd1 && cmd2 | cmd3 ; cmd4");
    expect(result.segments).toHaveLength(4);
    expect(result.segments[0].operator).toBeNull();
    expect(result.segments[1].operator).toBe("&&");
    expect(result.segments[2].operator).toBe("|");
    expect(result.segments[3].operator).toBe(";");
  });
});
