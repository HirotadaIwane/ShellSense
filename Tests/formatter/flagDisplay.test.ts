import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatExplanation } from "../../src/formatter";
import { resetFormatterConfig } from "../../src/configLoader";
import { makeParsed, makeEntry } from "../helpers/factories";
import {
  RiskLevel,
  type SegmentData,
} from "../../src/types";

// --- mock エントリ ---

const gitEntry = makeEntry({
  name: "git",
  description: { ja: "Git", en: "Git" },
  baseRisk: RiskLevel.Low,
  category: "git",
  flags: {
    "--version": {
      description: { ja: "バージョン表示", en: "Show version" },
    },
  },
  subcommands: {
    push: {
      description: { ja: "プッシュ", en: "Push" },
      riskOverride: RiskLevel.Medium,
      flags: {
        "--force": {
          description: { ja: "強制プッシュ（データ消失の危険）", en: "Force push (risk of data loss)" },
          riskModifier: RiskLevel.Critical,
        },
      },
    },
    status: {
      description: { ja: "状態表示", en: "Show status" },
      riskOverride: RiskLevel.Low,
    },
  },
});

beforeEach(() => resetFormatterConfig());
afterEach(() => resetFormatterConfig());

// --- P5: サブコマンドフラグ説明の優先表示 ---

describe("P5: サブコマンドフラグ説明の優先表示", () => {
  it("git push --force → push.flags の description が表示される", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--force"],
    });
    const segments: SegmentData[] = [
      { parsed, entry: gitEntry, risk: RiskLevel.Critical },
    ];
    const result = formatExplanation(segments, [null], RiskLevel.Critical, {
      format: "detailed",
      language: "ja",
    });
    expect(result).toContain("--force: 強制プッシュ（データ消失の危険）");
  });
});

// --- P6: コマンドフラグ説明のフォールバック ---

describe("P6: コマンドフラグ説明のフォールバック", () => {
  it("git status --version → git.flags の description にフォールバック", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "status",
      flags: ["--version"],
    });
    const segments: SegmentData[] = [
      { parsed, entry: gitEntry, risk: RiskLevel.Low },
    ];
    const result = formatExplanation(segments, [null], RiskLevel.Low, {
      format: "detailed",
      language: "ja",
    });
    expect(result).toContain("--version: バージョン表示");
  });
});

// --- P7: フラグ説明の非表示 ---

describe("P7: フラグ説明の非表示", () => {
  it("git push --unknown → 未定義フラグの説明行は出力されない", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--unknown"],
    });
    const segments: SegmentData[] = [
      { parsed, entry: gitEntry, risk: RiskLevel.Medium },
    ];
    const result = formatExplanation(segments, [null], RiskLevel.Medium, {
      format: "detailed",
      language: "ja",
    });
    expect(result).not.toContain("--unknown");
  });
});
