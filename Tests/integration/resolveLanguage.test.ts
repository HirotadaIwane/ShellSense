import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import * as path from "path";

// Phase 7 で resolveLanguage() / additionalContext は廃止。
// hook は常に {} を stdout に返す。
// SHELLSENSE_LANG の値に関わらず stdout は常に {}。

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

// --- Scenario 1: SHELLSENSE_LANG=en → stdout は {} (P1) ---
describe("Scenario 1: SHELLSENSE_LANG=en → stdout は {}", () => {
  it("stdout が {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", "en");
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 2: SHELLSENSE_LANG=ja → stdout は {} (P2) ---
describe("Scenario 2: SHELLSENSE_LANG=ja → stdout は {}", () => {
  it("stdout が {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", "ja");
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 3: SHELLSENSE_LANG 未設定 → stdout は {} (P3) ---
describe("Scenario 3: SHELLSENSE_LANG 未設定 → stdout は {}", () => {
  it("stdout が {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", undefined);
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// --- Scenario 4: 不正な SHELLSENSE_LANG → stdout は {} (P4) ---
describe("Scenario 4: 不正な SHELLSENSE_LANG → stdout は {}", () => {
  it("'fr' で stdout が {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", "fr");
    expect(JSON.parse(stdout)).toEqual({});
  });

  it("空文字で stdout が {} であること", () => {
    const { stdout } = runHookWithLang("ls -la", "");
    expect(JSON.parse(stdout)).toEqual({});
  });
});
