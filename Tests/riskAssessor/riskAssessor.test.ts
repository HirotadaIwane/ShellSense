import { describe, it, expect } from "vitest";
import { makeParsed, makeEntry } from "../helpers/factories";
import { assessRisk } from "../../src/riskAssessor";
import { RiskLevel } from "../../src/types";

// --- モック辞書エントリ ---

const lsEntry = makeEntry({
  name: "ls",
  description: { ja: "一覧表示", en: "List" },
  baseRisk: RiskLevel.Low,
  category: "filesystem",
  flags: {
    "-l": { description: { ja: "詳細", en: "Long" } },
    "-a": { description: { ja: "隠しファイル", en: "All" } },
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

const gitEntry = makeEntry({
  name: "git",
  description: { ja: "Git", en: "Git" },
  baseRisk: RiskLevel.Low,
  category: "git",
  subcommands: {
    status: {
      description: { ja: "状態表示", en: "Status" },
      riskOverride: RiskLevel.Low,
    },
    reset: {
      description: { ja: "リセット", en: "Reset" },
      riskOverride: RiskLevel.High,
    },
    push: {
      description: { ja: "プッシュ", en: "Push" },
      riskOverride: RiskLevel.Medium,
    },
  },
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
});

const npmEntry = makeEntry({
  name: "npm",
  description: { ja: "npm", en: "npm" },
  baseRisk: RiskLevel.Low,
  category: "package",
  subcommands: {
    install: {
      description: { ja: "インストール", en: "Install" },
      riskOverride: RiskLevel.Medium,
    },
  },
});

const chmodEntry = makeEntry({
  name: "chmod",
  description: { ja: "権限変更", en: "Change mode" },
  baseRisk: RiskLevel.High,
  category: "system",
});

const curlEntry = makeEntry({
  name: "curl",
  description: { ja: "データ転送", en: "Transfer data" },
  baseRisk: RiskLevel.Medium,
  category: "network",
});

// --- Scenario 1: 辞書ベースリスクの取得 (Property 1, AC-1.1) ---
describe("辞書ベースリスクの取得", () => {
  it("ls → low", () => {
    const parsed = makeParsed({ commandName: "ls", flags: ["-l", "-a"] });
    expect(assessRisk(parsed, lsEntry)).toBe(RiskLevel.Low);
  });

  it("rm → high", () => {
    const parsed = makeParsed({ commandName: "rm", args: ["file.txt"] });
    expect(assessRisk(parsed, rmEntry)).toBe(RiskLevel.High);
  });
});

// --- Scenario 2: サブコマンド riskOverride (Property 2, AC-1.2) ---
describe("サブコマンド riskOverride の優先適用", () => {
  it("git status → low (override)", () => {
    const parsed = makeParsed({ commandName: "git", subcommand: "status" });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Low);
  });

  it("git reset → high (override)", () => {
    const parsed = makeParsed({ commandName: "git", subcommand: "reset" });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.High);
  });
});

// --- Scenario 3: フラグ riskModifier の最大値 (Property 3, AC-1.3) ---
describe("フラグ riskModifier の最大値取得", () => {
  it("rm -rf → high (baseRisk: high, flagRisk: high)", () => {
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
    });
    expect(assessRisk(parsed, rmEntry)).toBe(RiskLevel.High);
  });
});

// --- Scenario 4: max(baseRisk, flagRisk, specialRisk) (Property 4, AC-1.4) ---
describe("max(baseRisk, flagRisk, specialRisk) の算出", () => {
  it("git reset --hard → critical (flagRisk が baseRisk を上回る)", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
    });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Critical);
  });

  it("git push --force → critical", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--force"],
    });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Critical);
  });
});

// --- Scenario 5: sudo による critical 昇格 (Property 5, AC-1.5) ---
describe("sudo による critical 昇格", () => {
  it("sudo chmod 777 / → critical", () => {
    const parsed = makeParsed({
      commandName: "chmod",
      args: ["777", "/"],
      hasSudo: true,
    });
    expect(assessRisk(parsed, chmodEntry)).toBe(RiskLevel.Critical);
  });
});

// --- Scenario 6: 未知コマンドのデフォルト (Property 6, AC-1.6) ---
describe("未知コマンドのデフォルト medium", () => {
  it("entry = null → medium", () => {
    const parsed = makeParsed({ commandName: "unknowncmd" });
    expect(assessRisk(parsed, null)).toBe(RiskLevel.Medium);
  });
});

// --- Scenario 7: Specs.md 計算例9パターン (Property 7, AC-1.7) ---
describe("Specs.md 計算例9パターン", () => {
  it("ls -la → low", () => {
    const parsed = makeParsed({ commandName: "ls", flags: ["-l", "-a"] });
    expect(assessRisk(parsed, lsEntry)).toBe(RiskLevel.Low);
  });

  it("rm file.txt → high", () => {
    const parsed = makeParsed({ commandName: "rm", args: ["file.txt"] });
    expect(assessRisk(parsed, rmEntry)).toBe(RiskLevel.High);
  });

  it("rm -rf node_modules → high", () => {
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
    });
    expect(assessRisk(parsed, rmEntry)).toBe(RiskLevel.High);
  });

  it("git status → low", () => {
    const parsed = makeParsed({ commandName: "git", subcommand: "status" });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Low);
  });

  it("git reset --hard → critical", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
    });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Critical);
  });

  it("git push --force → critical", () => {
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "push",
      flags: ["--force"],
    });
    expect(assessRisk(parsed, gitEntry)).toBe(RiskLevel.Critical);
  });

  it("npm install → medium", () => {
    const parsed = makeParsed({ commandName: "npm", subcommand: "install" });
    expect(assessRisk(parsed, npmEntry)).toBe(RiskLevel.Medium);
  });

  it("sudo chmod 777 / → critical", () => {
    const parsed = makeParsed({
      commandName: "chmod",
      args: ["777", "/"],
      hasSudo: true,
    });
    expect(assessRisk(parsed, chmodEntry)).toBe(RiskLevel.Critical);
  });

  it("curl https://example.com → medium", () => {
    const parsed = makeParsed({
      commandName: "curl",
      args: ["https://example.com"],
    });
    expect(assessRisk(parsed, curlEntry)).toBe(RiskLevel.Medium);
  });
});
