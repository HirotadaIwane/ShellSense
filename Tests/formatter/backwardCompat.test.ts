import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { assessRisk } from "../../src/riskAssessor";
import { formatExplanation } from "../../src/formatter";
import { resetFormatterConfig } from "../../src/configLoader";
import { makeParsed, makeEntry } from "../helpers/factories";
import {
  RiskLevel,
  type SegmentData,
} from "../../src/types";

// --- 既存形式の mock エントリ（SubcommandEntry に flags なし） ---

const gitOldEntry = makeEntry({
  name: "git",
  description: { ja: "Git", en: "Git" },
  baseRisk: RiskLevel.Low,
  category: "git",
  flags: {
    "--hard": {
      description: { ja: "ハードリセット", en: "Hard reset" },
      riskModifier: RiskLevel.Critical,
    },
    "--force": {
      description: { ja: "強制", en: "Force" },
      riskModifier: RiskLevel.Critical,
    },
  },
  subcommands: {
    reset: {
      description: { ja: "リセット", en: "Reset" },
      riskOverride: RiskLevel.High,
      // flags なし — 既存形式
    },
    push: {
      description: { ja: "プッシュ", en: "Push" },
      riskOverride: RiskLevel.Medium,
      // flags なし — 既存形式
    },
  },
});

beforeEach(() => resetFormatterConfig());
afterEach(() => resetFormatterConfig());

// --- P19: flags なし辞書のリスク評価 ---

describe("P19: flags なし辞書のリスク評価", () => {
  it("git reset --hard → コマンドレベル flags にフォールバックして critical", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
    });
    expect(assessRisk(parsed, gitOldEntry)).toBe(RiskLevel.Critical);
  });

  it("git push --force → コマンドレベル flags にフォールバックして critical", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--force"],
    });
    expect(assessRisk(parsed, gitOldEntry)).toBe(RiskLevel.Critical);
  });
});

// --- P20: flags なし辞書のフォーマッター ---

describe("P20: flags なし辞書のフォーマッター", () => {
  it("git reset --hard → コマンドレベル flags の説明が表示される", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
    });
    const segments: SegmentData[] = [
      { parsed, entry: gitOldEntry, risk: RiskLevel.Critical },
    ];
    const result = formatExplanation(segments, [null], RiskLevel.Critical, {
      format: "detailed",
      language: "ja",
    });
    expect(result).toContain("--hard: ハードリセット");
  });

  it("git push --force → コマンドレベル flags の説明が表示される", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--force"],
    });
    const segments: SegmentData[] = [
      { parsed, entry: gitOldEntry, risk: RiskLevel.Critical },
    ];
    const result = formatExplanation(segments, [null], RiskLevel.Critical, {
      format: "detailed",
      language: "ja",
    });
    expect(result).toContain("--force: 強制");
  });
});

// --- P21: 型コンパイル ---

describe("P21: 型コンパイル", () => {
  it("SubcommandEntry に flags がなくても型エラーなし", () => {
    // 既存形式のエントリが型エラーなく作成できることを確認
    const entry = makeEntry({
      name: "test",
      description: { ja: "テスト", en: "Test" },
      baseRisk: RiskLevel.Low,
      category: "other",
      subcommands: {
        sub: {
          description: { ja: "サブ", en: "Sub" },
          // flags なし — オプショナルのため型エラーにならない
        },
      },
    });
    expect(entry.subcommands!["sub"].flags).toBeUndefined();
  });
});
