import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import * as path from "path";

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

beforeAll(() => {
  execSync("npx tsc", {
    cwd: path.join(__dirname, "..", ".."),
    encoding: "utf8",
  });
});

// --- Scenario 11: E2E チェーンコマンド (Property 8) ---
// Phase 7: stdout は常に {}。チェーン説明の正確性は unit test
// (chainExplanation.test.ts, formatter の detailed chain テスト) で検証。
describe("E2E — チェーンコマンド", () => {
  it("rm -rf && npm install で {} を返すこと", () => {
    const stdout = runHook(makeInput("rm -rf node_modules && npm install"));
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("3コマンドチェーンで {} を返すこと", () => {
    const stdout = runHook(makeInput("echo hello && ls -la | grep test"));
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("未知コマンドのチェーンで {} を返すこと", () => {
    const stdout = runHook(makeInput("unknowncmd && ls"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 12: E2E 単一コマンド既存互換 (Property 9) ---
describe("E2E — 単一コマンド既存互換", () => {
  it("単一コマンドで {} を返すこと", () => {
    const stdout = runHook(makeInput("ls -la"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});
