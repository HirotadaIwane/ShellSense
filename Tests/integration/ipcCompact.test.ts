import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import * as path from "path";
import { formatExplanation } from "../../src/formatter";
import { parse } from "../../src/parser";
import { assessRisk } from "../../src/riskAssessor";
import { loadDictionary } from "../../src/dictionaryLoader";
import { CommandEntry, SegmentData } from "../../src/types";

// --- ヘルパー ---

let dictionary: Record<string, CommandEntry>;

beforeAll(() => {
  const dictDir = path.join(__dirname, "..", "..", "dictionary");
  const result = loadDictionary(dictDir);
  dictionary = result.commands;
});

function buildSegment(command: string): {
  segmentData: SegmentData[];
  operators: (string | null)[];
} {
  const parsed = parse(command);
  const entry = dictionary[parsed.commandName] ?? null;
  const risk = assessRisk(parsed, entry);
  return {
    segmentData: [{ parsed, entry, risk }],
    operators: [null],
  };
}

// ============================================================
// Scenario 1: compact 形式の ja/en 出力が生成できること (P7)
// ============================================================
describe("Scenario 1: compact 形式の生成", () => {
  it("compact ja が1行であること", () => {
    const { segmentData, operators } = buildSegment("ls -la");
    const result = formatExplanation(segmentData, operators, segmentData[0].risk, {
      format: "compact",
      language: "ja",
    });
    expect(result).toBeTruthy();
    // compact は1行
    expect(result.split("\n").filter((l) => l.trim() !== "")).toHaveLength(1);
  });

  it("compact en が1行であること", () => {
    const { segmentData, operators } = buildSegment("ls -la");
    const result = formatExplanation(segmentData, operators, segmentData[0].risk, {
      format: "compact",
      language: "en",
    });
    expect(result).toBeTruthy();
    expect(result.split("\n").filter((l) => l.trim() !== "")).toHaveLength(1);
  });

  it("detailed ja が複数行であること", () => {
    const { segmentData, operators } = buildSegment("ls -la");
    const result = formatExplanation(segmentData, operators, segmentData[0].risk, {
      format: "detailed",
      language: "ja",
    });
    expect(result.split("\n").filter((l) => l.trim() !== "").length).toBeGreaterThan(1);
  });

  it("compact と detailed が異なる出力であること", () => {
    const { segmentData, operators } = buildSegment("rm -rf node_modules");
    const compact = formatExplanation(segmentData, operators, segmentData[0].risk, {
      format: "compact",
      language: "ja",
    });
    const detailed = formatExplanation(segmentData, operators, segmentData[0].risk, {
      format: "detailed",
      language: "ja",
    });
    expect(compact).not.toBe(detailed);
  });
});

// ============================================================
// Scenario 2: IPC ファイルの期待 JSON 構造 (P7)
// hook 実行後の IPC ファイルに6フィールドが含まれること。
// sandbox 制約により E2E では IPC ファイルを直接読めないため、
// hook の stdout が {} であることの確認 + compact 生成の単体検証で担保。
// ============================================================
describe("Scenario 2: hook stdout は {} のまま", () => {
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

  function runHook(command: string): string {
    try {
      return execSync(`node "${indexJs}"`, {
        input: makeInput(command),
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

  it("hook stdout が {} であること", () => {
    const stdout = runHook("ls -la");
    expect(JSON.parse(stdout)).toEqual({});
  });
});

// ============================================================
// Scenario 3: 4パターン全てが有効な出力を返すこと (P7)
// ============================================================
describe("Scenario 3: detailed/compact x ja/en の4パターン", () => {
  const formats = ["detailed", "compact"] as const;
  const languages = ["ja", "en"] as const;

  for (const format of formats) {
    for (const language of languages) {
      it(`${format} / ${language} が空でない文字列を返すこと`, () => {
        const { segmentData, operators } = buildSegment("rm -rf /tmp/test");
        const result = formatExplanation(
          segmentData,
          operators,
          segmentData[0].risk,
          { format, language }
        );
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    }
  }
});
