import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import * as path from "path";
import { parse, parseChain } from "../../src/parser";

// --- E2E ヘルパー ---

const indexJs = path.join(__dirname, "..", "..", "dist", "index.js");

function makeInput(command: string): string {
  return JSON.stringify({
    tool_name: "Bash",
    tool_input: { command },
    hook_event_name: "PreToolUse",
    session_id: "test-session",
    transcript_path: "",
    cwd: ".",
  });
}

function runHook(stdinInput: string): string {
  try {
    return execSync(`node "${indexJs}"`, {
      input: stdinInput,
      encoding: "utf8",
      timeout: 5000,
    });
  } catch (error: unknown) {
    return (error as { stdout?: string }).stdout ?? "";
  }
}

// --- Scenario 1: パラメータ追加 (P1) ---
describe("パラメータ追加", () => {
  it("parse() に subcommandCommands を渡すと docker のサブコマンドが認識される", () => {
    const result = parse("docker run nginx", ["docker", "git", "npm", "pip"]);
    expect(result.commandName).toBe("docker");
    expect(result.subcommand).toBe("run");
    expect(result.args).toContain("nginx");
  });

  it("parseChain() に subcommandCommands を渡すと両セグメントでサブコマンドが認識される", () => {
    const chain = parseChain("docker run nginx && git status", ["docker", "git", "npm", "pip"]);
    expect(chain.segments).toHaveLength(2);
    expect(chain.segments[0].parsed.commandName).toBe("docker");
    expect(chain.segments[0].parsed.subcommand).toBe("run");
    expect(chain.segments[1].parsed.commandName).toBe("git");
    expect(chain.segments[1].parsed.subcommand).toBe("status");
  });
});

// --- Scenario 2: デフォルト後方互換 (P2) ---
describe("デフォルト後方互換", () => {
  it("parse() を第2引数なしで呼ぶと git のサブコマンドが認識される", () => {
    const result = parse("git status");
    expect(result.subcommand).toBe("status");
  });

  it("parse() を第2引数なしで呼ぶと docker のサブコマンドは認識されない", () => {
    const result = parse("docker run nginx");
    expect(result.subcommand).toBeNull();
  });

  it("parseChain() を第2引数なしで呼ぶと npm のサブコマンドが認識される", () => {
    const chain = parseChain("npm install express");
    expect(chain.segments[0].parsed.subcommand).toBe("install");
  });
});

// --- Scenario 3: 動的リスト適用 (P3) ---
describe("動的リスト適用", () => {
  it("カスタムリストに含むコマンドのサブコマンドが認識される", () => {
    const result = parse("kubectl apply -f deploy.yaml", ["docker", "kubectl"]);
    expect(result.commandName).toBe("kubectl");
    expect(result.subcommand).toBe("apply");
  });

  it("カスタムリストに含まないコマンドのサブコマンドは認識されない", () => {
    const result = parse("git status", ["docker"]);
    expect(result.commandName).toBe("git");
    expect(result.subcommand).toBeNull();
  });

  it("空リストを渡すと全コマンドのサブコマンドが認識されない", () => {
    const result = parse("git status", []);
    expect(result.subcommand).toBeNull();
  });
});

// --- Scenario 4, 5, 6: 複合サブコマンド解決 + E2E パイプライン (P6, P7, P8, P9) ---
// Phase 7: stdout は常に {}。サブコマンド解決の正確性は unit test で検証。
describe("複合サブコマンド E2E", () => {
  beforeAll(() => {
    execSync("npx tsc", {
      cwd: path.join(__dirname, "..", ".."),
      encoding: "utf8",
    });
  });

  it("docker compose up -d で {} を返すこと", () => {
    const stdout = runHook(makeInput("docker compose up -d"));
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("docker compose down で {} を返すこと", () => {
    const stdout = runHook(makeInput("docker compose down"));
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("docker run nginx で {} を返すこと", () => {
    const stdout = runHook(makeInput("docker run nginx"));
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("kubectl apply -f deploy.yaml で {} を返すこと", () => {
    const stdout = runHook(makeInput("kubectl apply -f deploy.yaml"));
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("未知のサブコマンド docker unknown でもエラーにならないこと", () => {
    const stdout = runHook(makeInput("docker unknown"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});
