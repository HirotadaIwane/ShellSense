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

function runHookWithLang(
  command: string,
  lang?: string
): { stdout: string; stderr: string } {
  const env = { ...process.env };
  if (lang !== undefined) {
    env.SHELLSENSE_LANG = lang;
  } else {
    delete env.SHELLSENSE_LANG;
  }

  try {
    const stdout = execSync(`node "${indexJs}"`, {
      input: makeInput(command),
      encoding: "utf8",
      timeout: 5000,
      env,
    });
    return { stdout, stderr: "" };
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string };
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

// ビルド済みを確認
beforeAll(() => {
  execSync("npx tsc", {
    cwd: path.join(__dirname, "..", ".."),
    encoding: "utf8",
  });
});

// ============================================================
// Scenario 16: E2E — 英語環境 (P16)
// Phase 7: stdout は常に {}。英語説明の正確性は unit test で検証。
// ============================================================
describe("Scenario 16: E2E — SHELLSENSE_LANG=en で stdout は {}", () => {
  it("単一コマンドで {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", "en");
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("チェーンコマンドで {} であること", () => {
    const { stdout } = runHookWithLang("ls && rm -rf foo", "en");
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("未知コマンドで {} であること", () => {
    const { stdout } = runHookWithLang("unknowncmd123", "en");
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// ============================================================
// Scenario 17: E2E — デフォルト日本語環境 (P17)
// Phase 7: stdout は常に {}。
// ============================================================
describe("Scenario 17: E2E — SHELLSENSE_LANG 未設定で stdout は {}", () => {
  it("stdout が {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", undefined);
    expect(JSON.parse(stdout)).toEqual({});
  });
});
