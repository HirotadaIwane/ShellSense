import { describe, it, expect } from "vitest";
import { assessRisk } from "../../src/riskAssessor";
import { makeParsed, makeEntry } from "../helpers/factories";
import { RiskLevel } from "../../src/types";

// --- mock エントリ（サブコマンドフラグ付き） ---

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
          description: { ja: "強制プッシュ", en: "Force push" },
          riskModifier: RiskLevel.Critical,
        },
      },
    },
    status: {
      description: { ja: "状態表示", en: "Show status" },
      riskOverride: RiskLevel.Low,
      // flags なし — フォールバックテスト用
    },
  },
});

const rmEntry = makeEntry({
  name: "rm",
  description: { ja: "削除", en: "Remove" },
  baseRisk: RiskLevel.High,
  category: "filesystem",
  flags: {
    "-r": {
      description: { ja: "再帰的", en: "Recursive" },
      riskModifier: RiskLevel.High,
    },
    "-f": {
      description: { ja: "強制", en: "Force" },
      riskModifier: RiskLevel.High,
    },
  },
});

// --- P1: サブコマンドフラグ優先解決 ---

describe("P1: サブコマンドフラグ優先解決", () => {
  it("git push --force → push.flags の riskModifier (critical) が使用される", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--force"],
    });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Critical);
  });
});

// --- P2: コマンドフラグフォールバック ---

describe("P2: コマンドフラグフォールバック", () => {
  it("git status --version → status に flags なし、git.flags にフォールバック", () => {
    const gitWithVersionRisk = makeEntry({
      ...gitEntry,
      flags: {
        "--version": {
          description: { ja: "バージョン表示", en: "Show version" },
          riskModifier: RiskLevel.Medium,
        },
      },
    });
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "status",
      flags: ["--version"],
    });
    // baseRisk=low (status riskOverride), flagRisk=medium (fallback to command), specialRisk=low
    // maxRisk(low, medium, low) = medium
    expect(assessRisk(parsed, gitWithVersionRisk)).toBe(RiskLevel.Medium);
  });
});

// --- P3: サブコマンドなしのフラグ解決 ---

describe("P3: サブコマンドなしのフラグ解決", () => {
  it("rm -rf → サブコマンドなし、コマンドレベル flags のみ参照", () => {
    const parsed = makeParsed({
      commandName: "rm",
      subcommand: null,
      flags: ["-r", "-f"],
      args: ["node_modules"],
    });
    expect(assessRisk(parsed, rmEntry)).toBe(RiskLevel.High);
  });
});

// --- P4: フラグ未定義時の無視 ---

describe("P4: フラグ未定義時の無視", () => {
  it("git push --unknown → どちらの flags にもないフラグはリスク影響なし", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--unknown"],
    });
    // baseRisk=medium (push riskOverride), flagRisk=low (unknown flag ignored), specialRisk=low
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Medium);
  });
});
