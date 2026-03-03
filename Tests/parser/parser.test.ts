import { describe, it, expect } from "vitest";
import { parse } from "../../src/parser";

// Scenario 1: 基本コマンドのパース (Property 1, AC-1.1)
describe("基本コマンドのパース", () => {
  it('ls -la を正しくパースすること', () => {
    const result = parse("ls -la");
    expect(result.commandName).toBe("ls");
    expect(result.flags).toEqual(["-l", "-a"]);
    expect(result.args).toEqual([]);
    expect(result.subcommand).toBeNull();
    expect(result.hasChain).toBe(false);
    expect(result.hasSudo).toBe(false);
  });
});

// Scenario 2: サブコマンドの検出 (Property 2, AC-1.2)
describe("サブコマンドの検出", () => {
  it("git commit -m 'initial commit' を正しくパースすること", () => {
    const result = parse("git commit -m 'initial commit'");
    expect(result.commandName).toBe("git");
    expect(result.subcommand).toBe("commit");
    expect(result.flags).toEqual(["-m"]);
    expect(result.args).toEqual(["initial commit"]);
  });

  it("npm install を正しくパースすること", () => {
    const result = parse("npm install");
    expect(result.commandName).toBe("npm");
    expect(result.subcommand).toBe("install");
  });

  it("git -v ではサブコマンドが null であること", () => {
    const result = parse("git -v");
    expect(result.commandName).toBe("git");
    expect(result.subcommand).toBeNull();
    expect(result.flags).toEqual(["-v"]);
  });
});

// Scenario 3: 結合フラグの展開 (Property 3, AC-1.3)
describe("結合フラグの展開", () => {
  it("-rf を [-r, -f] に展開すること", () => {
    const result = parse("rm -rf node_modules");
    expect(result.flags).toEqual(["-r", "-f"]);
  });

  it("--all はそのまま保持すること", () => {
    const result = parse("ls --all");
    expect(result.flags).toEqual(["--all"]);
  });

  it("-v は1文字フラグとしてそのまま保持すること", () => {
    const result = parse("ls -v");
    expect(result.flags).toEqual(["-v"]);
  });
});

// Scenario 4: チェーン演算子の検出 (Property 4, AC-1.4)
describe("チェーン演算子の検出", () => {
  it("&& を検出すること", () => {
    const result = parse("rm -rf node_modules && npm install");
    expect(result.hasChain).toBe(true);
    expect(result.chainOperator).toBe("&&");
    expect(result.commandName).toBe("rm");
  });

  it("| を検出すること", () => {
    const result = parse("cat file.txt | grep error");
    expect(result.hasChain).toBe(true);
    expect(result.chainOperator).toBe("|");
  });

  it("引用符内の演算子は無視すること", () => {
    const result = parse("echo 'hello || world'");
    expect(result.hasChain).toBe(false);
  });
});

// Scenario 5: sudoプレフィックスの処理 (Property 5, AC-1.5)
describe("sudoプレフィックスの処理", () => {
  it("sudo を検出し、実コマンドをパースすること", () => {
    const result = parse("sudo rm -rf /tmp/cache");
    expect(result.commandName).toBe("rm");
    expect(result.hasSudo).toBe(true);
    expect(result.flags).toEqual(["-r", "-f"]);
    expect(result.args).toEqual(["/tmp/cache"]);
  });
});

// Scenario 6: 環境変数プレフィックスのスキップ (Property 6, AC-1.6)
describe("環境変数プレフィックスのスキップ", () => {
  it("NODE_ENV=production をスキップすること", () => {
    const result = parse("NODE_ENV=production node app.js");
    expect(result.commandName).toBe("node");
    expect(result.args).toEqual(["app.js"]);
  });

  it("複数の環境変数をスキップすること", () => {
    const result = parse("A=1 B=2 python script.py");
    expect(result.commandName).toBe("python");
  });
});

// Scenario 7: 引用符付き引数の保持 (Property 7, AC-1.7)
describe("引用符付き引数の保持", () => {
  it('ダブルクォート内のスペースを1引数として保持すること', () => {
    const result = parse('grep "hello world" file.txt');
    expect(result.args).toEqual(["hello world", "file.txt"]);
  });

  it("シングルクォート内のスペースを1引数として保持すること", () => {
    const result = parse("echo 'single quoted'");
    expect(result.args).toEqual(["single quoted"]);
  });
});

// Scenario 8: パス付きコマンドのベースネーム抽出 (Property 8, AC-1.8)
describe("パス付きコマンドのベースネーム抽出", () => {
  it("/usr/bin/git からベースネーム git を抽出すること", () => {
    const result = parse("/usr/bin/git status");
    expect(result.commandName).toBe("git");
    expect(result.subcommand).toBe("status");
  });
});

// Scenario 9: 空コマンドの安全処理 (Property 9, AC-1.9)
describe("空コマンドの安全処理", () => {
  it("空文字列でエラーなく処理すること", () => {
    const result = parse("");
    expect(result.commandName).toBe("");
    expect(result.flags).toEqual([]);
    expect(result.args).toEqual([]);
  });
});

// Scenario 10: rawフィールドの保持 (Property 10, AC-1.10)
describe("rawフィールドの保持", () => {
  it("元の入力文字列がそのまま保持されること", () => {
    const result = parse("rm -rf node_modules && npm install");
    expect(result.raw).toBe("rm -rf node_modules && npm install");
  });
});
