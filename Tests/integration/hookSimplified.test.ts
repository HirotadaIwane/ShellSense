import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const indexJs = path.join(__dirname, "..", "..", "dist", "index.js");

// テスト専用の一時ディレクトリ（他テストとの IPC ファイル競合を回避）
let testTmpDir: string;
let notifyFile: string;

function makeInput(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    tool_name: "Bash",
    tool_input: { command: "ls -la" },
    hook_event_name: "PreToolUse",
    session_id: "test-session",
    transcript_path: "",
    cwd: ".",
    ...overrides,
  });
}

function runHook(input: string): string {
  try {
    return execSync(`node "${indexJs}"`, {
      input,
      encoding: "utf8",
      timeout: 5000,
      env: { ...process.env, TEMP: testTmpDir, TMP: testTmpDir },
    });
  } catch (error: unknown) {
    return (error as { stdout?: string }).stdout ?? "";
  }
}

function readNotifyFile(): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(notifyFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function cleanupNotifyFile(): void {
  try {
    fs.unlinkSync(notifyFile);
  } catch {
    // ignore
  }
}

beforeAll(() => {
  execSync("npx tsc", {
    cwd: path.join(__dirname, "..", ".."),
    encoding: "utf8",
  });
  testTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "shellsense-test-"));
  notifyFile = path.join(testTmpDir, "shellsense-notify.json");
});

beforeEach(() => {
  cleanupNotifyFile();
});

afterAll(() => {
  cleanupNotifyFile();
  try {
    fs.rmdirSync(testTmpDir);
  } catch {
    // ignore
  }
});

// ============================================================
// Scenario 1: IPC ファイルが新フォーマットであること (P2)
// ============================================================
describe("Scenario 1: IPC ファイルが { command, ts } 形式であること", () => {
  it("command フィールドにコマンド文字列が含まれること", () => {
    runHook(makeInput({ tool_input: { command: "echo hello" } }));
    const data = readNotifyFile();

    expect(data).not.toBeNull();
    expect(data!.command).toBe("echo hello");
  });

  it("ts フィールドが数値であること", () => {
    const before = Date.now();
    runHook(makeInput());
    const data = readNotifyFile();

    expect(data).not.toBeNull();
    expect(typeof data!.ts).toBe("number");
    expect(data!.ts as number).toBeGreaterThanOrEqual(before);
  });

  it("旧フォーマットのフィールドが存在しないこと", () => {
    runHook(makeInput());
    const data = readNotifyFile();

    expect(data).not.toBeNull();
    expect(data).not.toHaveProperty("ja");
    expect(data).not.toHaveProperty("en");
    expect(data).not.toHaveProperty("ja_compact");
    expect(data).not.toHaveProperty("en_compact");
    expect(data).not.toHaveProperty("risk");
  });

  it("stdout が {} であること", () => {
    const stdout = runHook(makeInput());
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// ============================================================
// Scenario 2: 空コマンドで IPC ファイルが生成されないこと (P3)
// ============================================================
describe("Scenario 2: 空コマンドで IPC ファイルが生成されないこと", () => {
  it("空文字コマンドで IPC ファイルが存在しないこと", () => {
    const stdout = runHook(makeInput({ tool_input: { command: "" } }));

    expect(JSON.parse(stdout)).toEqual({});
    expect(fs.existsSync(notifyFile)).toBe(false);
  });

  it("空白のみコマンドで IPC ファイルが存在しないこと", () => {
    const stdout = runHook(makeInput({ tool_input: { command: "   " } }));

    expect(JSON.parse(stdout)).toEqual({});
    expect(fs.existsSync(notifyFile)).toBe(false);
  });
});

// ============================================================
// Scenario 3: 非 Bash ツールで IPC ファイルが生成されないこと (P3)
// ============================================================
describe("Scenario 3: 非 Bash ツールで IPC ファイルが生成されないこと", () => {
  it("tool_name が Read の場合 IPC ファイルが存在しないこと", () => {
    const stdout = runHook(makeInput({ tool_name: "Read" }));

    expect(JSON.parse(stdout)).toEqual({});
    expect(fs.existsSync(notifyFile)).toBe(false);
  });
});
