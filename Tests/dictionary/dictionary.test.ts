import { describe, it, expect } from "vitest";
import type { CommandEntry } from "../../src/types";
import { loadDictionary } from "../../src/dictionaryLoader";

const { commands } = loadDictionary();

const EXPECTED_COMMANDS = [
  "ls", "cat", "mkdir", "rm", "cp", "mv", "touch",
  "git", "npm", "pip", "grep", "find", "curl", "chmod",
  "cd", "pwd", "echo", "node", "python",
];

const VALID_RISKS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "git", "package", "network", "process", "system", "other",
  "text", "shell", "container", "cloud",
];

// Scenario 1: コマンドの網羅性 (Property 1)
// 注: Unit 5 で辞書拡充を行うため、コマンド数はMVP19個以上であることを検証する。
describe("コマンドの網羅性", () => {
  it("MVP19個以上のコマンドが含まれる", () => {
    expect(Object.keys(commands).length).toBeGreaterThanOrEqual(19);
  });

  it.each(EXPECTED_COMMANDS)("%s が存在する", (cmd) => {
    expect(commands[cmd]).toBeDefined();
  });
});

// Scenario 2: 必須フィールドの存在 (Property 2)
describe("必須フィールドの存在", () => {
  it.each(EXPECTED_COMMANDS)("%s が全必須フィールドを持つ", (cmd) => {
    const entry = commands[cmd];
    expect(typeof entry.name).toBe("string");
    expect(typeof entry.description.ja).toBe("string");
    expect(typeof entry.description.en).toBe("string");
    expect(VALID_RISKS).toContain(entry.baseRisk);
    expect(VALID_CATEGORIES).toContain(entry.category);
  });
});

// Scenario 3: baseRiskの正確性 (Property 3)
describe("baseRiskの正確性", () => {
  const expectedRisks: Record<string, string> = {
    ls: "low", cat: "low", grep: "low", find: "low",
    cd: "low", pwd: "low", echo: "low", git: "low", npm: "low",
    mkdir: "medium", cp: "medium", mv: "medium", touch: "medium",
    pip: "medium", curl: "medium", node: "medium", python: "medium",
    rm: "high", chmod: "high",
  };

  it.each(Object.entries(expectedRisks))(
    "%s の baseRisk は %s",
    (cmd, risk) => {
      expect(commands[cmd].baseRisk).toBe(risk);
    }
  );
});

// Scenario 4: gitサブコマンドの完全性 (Property 4)
// 注: Phase 12 Unit 2 で 50 サブコマンドに拡張済み
describe("gitサブコマンド", () => {
  const EXPECTED_GIT_SUBCOMMANDS = [
    "status", "add", "commit", "push", "pull", "diff",
    "log", "clone", "checkout", "branch", "reset", "stash",
  ];

  it("12個以上のサブコマンドが存在する", () => {
    expect(Object.keys(commands.git.subcommands!).length).toBeGreaterThanOrEqual(12);
  });

  it.each(EXPECTED_GIT_SUBCOMMANDS)("git %s が存在する", (sub) => {
    const subcommand = commands.git.subcommands![sub];
    expect(subcommand).toBeDefined();
    expect(typeof subcommand.description.ja).toBe("string");
    expect(subcommand.riskOverride).toBeDefined();
  });
});

// Scenario 5: npmサブコマンドの完全性 (Property 5)
describe("npmサブコマンド", () => {
  const EXPECTED_NPM_SUBCOMMANDS = ["install", "run", "test", "build"];

  it("15個のサブコマンドが存在する", () => {
    expect(Object.keys(commands.npm.subcommands!)).toHaveLength(15);
  });

  it.each(EXPECTED_NPM_SUBCOMMANDS)("npm %s が存在する", (sub) => {
    expect(commands.npm.subcommands![sub]).toBeDefined();
  });
});

// Scenario 6: rmフラグの正確性 (Property 6)
describe("rmフラグ", () => {
  it("-r, -f, -i が定義されている", () => {
    const flags = commands.rm.flags!;
    expect(flags["-r"]).toBeDefined();
    expect(flags["-f"]).toBeDefined();
    expect(flags["-i"]).toBeDefined();
  });

  it("-r の riskModifier が high", () => {
    expect(commands.rm.flags!["-r"].riskModifier).toBe("high");
  });

  it("-f の riskModifier が high", () => {
    expect(commands.rm.flags!["-f"].riskModifier).toBe("high");
  });
});

// Scenario 7: gitフラグの正確性 (Property 7)
// 注: Phase 12 Unit 2 で --force は push.flags、--hard は reset.flags に移動済み
describe("gitフラグ", () => {
  it("--force が push サブコマンドに定義されている", () => {
    const pushFlags = commands.git.subcommands!.push.flags!;
    expect(pushFlags["--force"]).toBeDefined();
  });

  it("--hard が reset サブコマンドに定義されている", () => {
    const resetFlags = commands.git.subcommands!.reset.flags!;
    expect(resetFlags["--hard"]).toBeDefined();
  });

  it("--force の riskModifier が critical", () => {
    expect(commands.git.subcommands!.push.flags!["--force"].riskModifier).toBe("critical");
  });

  it("--hard の riskModifier が critical", () => {
    expect(commands.git.subcommands!.reset.flags!["--hard"].riskModifier).toBe("critical");
  });
});

