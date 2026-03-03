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

// --- Scenario 8: E2E — head コマンド (Property 8) ---
// Phase 7: stdout は常に {}。コマンド説明の正確性は unit test で検証。
describe("E2E — head コマンド", () => {
  it("head -n 10 で stdout は {} であること", () => {
    const stdout = runHook(makeInput("head -n 10 file.txt"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 9: E2E — sed -i コマンド (Property 8) ---
describe("E2E — sed -i コマンド", () => {
  it("sed -i で stdout は {} であること", () => {
    const stdout = runHook(makeInput("sed -i 's/foo/bar/' file.txt"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 10: E2E — tar コマンド (Property 8) ---
describe("E2E — tar コマンド", () => {
  it("tar -czf で stdout は {} であること", () => {
    const stdout = runHook(makeInput("tar -czf archive.tar.gz src/"));
    expect(JSON.parse(stdout)).toEqual({});
  });
});
