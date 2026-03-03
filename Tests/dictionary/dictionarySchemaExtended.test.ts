import { describe, it, expect, beforeAll } from "vitest";
import { loadDictionary } from "../../src/dictionaryLoader";

// --- 辞書読み込み ---

interface FlagEntry {
  description: { ja: string; en: string };
  riskModifier?: string;
}

interface SubcommandEntry {
  description: { ja: string; en: string };
  riskOverride?: string;
}

interface CommandEntry {
  name: string;
  description: { ja: string; en: string };
  baseRisk: string;
  category: string;
  flags?: Record<string, FlagEntry>;
  subcommands?: Record<string, SubcommandEntry>;
}

let commands: Record<string, CommandEntry>;

beforeAll(() => {
  const result = loadDictionary();
  commands = result.commands as Record<string, CommandEntry>;
});

// --- Bolt 2 で追加する8コマンド ---

const BOLT2_COMMANDS = [
  "which", "xargs", "tee", "export", "source",
  "ps", "kill", "npx",
] as const;

// --- Scenario 1: 8コマンドが辞書に存在する (Property 1) ---
describe("8コマンドが辞書に存在する", () => {
  it.each(BOLT2_COMMANDS)("%s が辞書に存在する", (cmd) => {
    expect(commands[cmd]).toBeDefined();
  });
});

// --- Scenario 2: 必須フィールドの存在 (Property 2) ---
describe("必須フィールドの存在", () => {
  it.each(BOLT2_COMMANDS)("%s に name, description.ja, description.en, baseRisk, category が存在する", (cmd) => {
    const entry = commands[cmd];
    expect(entry.name).toBe(cmd);
    expect(entry.description.ja).toBeDefined();
    expect(entry.description.ja.length).toBeGreaterThan(0);
    expect(entry.description.en).toBeDefined();
    expect(entry.description.en.length).toBeGreaterThan(0);
    expect(entry.baseRisk).toBeDefined();
    expect(entry.category).toBeDefined();
  });
});

// --- Scenario 3: baseRisk / category 値の正確性 (Property 3) ---
describe("baseRisk / category 値の正確性", () => {
  const expected: Record<string, { risk: string; category: string }> = {
    which: { risk: "low", category: "shell" },
    xargs: { risk: "medium", category: "shell" },
    tee: { risk: "medium", category: "filesystem" },
    export: { risk: "low", category: "shell" },
    source: { risk: "medium", category: "shell" },
    ps: { risk: "low", category: "process" },
    kill: { risk: "high", category: "process" },
    npx: { risk: "medium", category: "package" },
  };

  it.each(Object.entries(expected))("%s の baseRisk=%s", (cmd, { risk, category }) => {
    expect(commands[cmd].baseRisk).toBe(risk);
    expect(commands[cmd].category).toBe(category);
  });
});

// --- Scenario 4: kill -9 の riskModifier が critical (Property 4) ---
describe("kill -9 の riskModifier", () => {
  it("kill -9 の riskModifier が critical である", () => {
    const kill = commands["kill"];
    expect(kill.flags).toBeDefined();
    expect(kill.flags!["-9"]).toBeDefined();
    expect(kill.flags!["-9"].riskModifier).toBe("critical");
  });
});

// --- Scenario 5: pip のサブコマンド (Property 5) ---
describe("pip のサブコマンド", () => {
  it("pip に install, uninstall, freeze, list サブコマンドが存在する", () => {
    const pip = commands["pip"];
    expect(pip.subcommands).toBeDefined();
    expect(pip.subcommands!["install"]).toBeDefined();
    expect(pip.subcommands!["install"].riskOverride).toBe("medium");
    expect(pip.subcommands!["uninstall"]).toBeDefined();
    expect(pip.subcommands!["uninstall"].riskOverride).toBe("high");
    expect(pip.subcommands!["freeze"]).toBeDefined();
    expect(pip.subcommands!["freeze"].riskOverride).toBe("low");
    expect(pip.subcommands!["list"]).toBeDefined();
    expect(pip.subcommands!["list"].riskOverride).toBe("low");
  });
});

// --- Scenario 6: 既存コマンドの追加フラグ (Property 6) ---
describe("既存コマンドの追加フラグ", () => {
  it("cp に -i フラグが存在する", () => {
    expect(commands["cp"].flags!["-i"]).toBeDefined();
    expect(commands["cp"].flags!["-i"].description.ja).toContain("確認");
  });

  it("mv に -i フラグが存在する", () => {
    expect(commands["mv"].flags!["-i"]).toBeDefined();
    expect(commands["mv"].flags!["-i"].description.ja).toContain("確認");
  });

  it("curl に -L, -s, -d フラグが存在する", () => {
    expect(commands["curl"].flags!["-L"]).toBeDefined();
    expect(commands["curl"].flags!["-s"]).toBeDefined();
    expect(commands["curl"].flags!["-d"]).toBeDefined();
  });

  it("grep に -l, -v, -c フラグが存在する", () => {
    expect(commands["grep"].flags!["-l"]).toBeDefined();
    expect(commands["grep"].flags!["-v"]).toBeDefined();
    expect(commands["grep"].flags!["-c"]).toBeDefined();
  });
});

// --- Scenario 7: find -exec の riskModifier (Property 7) ---
describe("find -exec の riskModifier", () => {
  it("find -exec の riskModifier が high である", () => {
    const find = commands["find"];
    expect(find.flags!["-exec"]).toBeDefined();
    expect(find.flags!["-exec"].riskModifier).toBe("high");
  });
});
