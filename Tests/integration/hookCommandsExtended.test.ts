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

// --- Scenario 8: E2E — kill -9 コマンド (Property 8) ---
// Phase 7: stdout は常に {}。コマンド説明の正確性は unit test で検証。
describe("E2E — kill コマンド", () => {
  it("kill -9 1234 で stdout は {} であること", () => {
    const stdout = runHook(makeInput("kill -9 1234"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 9: E2E — npx コマンド (Property 8) ---
describe("E2E — npx コマンド", () => {
  it("npx tsc で stdout は {} であること", () => {
    const stdout = runHook(makeInput("npx tsc"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 10: E2E — pip install コマンド (Property 8) ---
describe("E2E — pip install コマンド", () => {
  it("pip install requests で stdout は {} であること", () => {
    const stdout = runHook(makeInput("pip install requests"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});
