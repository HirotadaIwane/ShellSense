import { describe, it, expect, beforeAll } from "vitest";
import { loadDictionary } from "../../src/dictionaryLoader";

// --- 辞書読み込み ---

interface FlagEntry {
  description: { ja: string; en: string };
  riskModifier?: string;
}

interface CommandEntry {
  name: string;
  description: { ja: string; en: string };
  baseRisk: string;
  category: string;
  flags?: Record<string, FlagEntry>;
}

let commands: Record<string, CommandEntry>;

beforeAll(() => {
  const result = loadDictionary();
  commands = result.commands as Record<string, CommandEntry>;
});

// --- Bolt 1 で追加する10コマンド ---

const BOLT1_COMMANDS = [
  "head", "tail", "wc", "sort", "uniq", "sed", "awk",
  "ln", "tar", "diff",
] as const;

// --- Scenario 1: 10コマンドが辞書に存在する (Property 1) ---
describe("10コマンドが辞書に存在する", () => {
  it.each(BOLT1_COMMANDS)("%s が辞書に存在する", (cmd) => {
    expect(commands[cmd]).toBeDefined();
  });
});

// --- Scenario 2: 各コマンドの必須フィールドが存在する (Property 2) ---
describe("必須フィールドの存在", () => {
  it.each(BOLT1_COMMANDS)("%s に name, description.ja, description.en, baseRisk, category が存在する", (cmd) => {
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

// --- Scenario 3: baseRisk値が正確である (Property 3) ---
describe("baseRisk値の正確性", () => {
  const expectedRisks: Record<string, string> = {
    head: "low",
    tail: "low",
    wc: "low",
    sort: "low",
    uniq: "low",
    sed: "medium",
    awk: "low",
    ln: "medium",
    tar: "medium",
    diff: "low",
  };

  it.each(Object.entries(expectedRisks))("%s の baseRisk が %s である", (cmd, risk) => {
    expect(commands[cmd].baseRisk).toBe(risk);
  });
});

// --- Scenario 4: category値が正確である (Property 4) ---
describe("category値の正確性", () => {
  const TEXT_COMMANDS = ["head", "tail", "wc", "sort", "uniq", "sed", "awk"];
  const FILESYSTEM_COMMANDS = ["ln", "tar", "diff"];

  it.each(TEXT_COMMANDS)("%s の category が text である", (cmd) => {
    expect(commands[cmd].category).toBe("text");
  });

  it.each(FILESYSTEM_COMMANDS)("%s の category が filesystem である", (cmd) => {
    expect(commands[cmd].category).toBe("filesystem");
  });
});

// --- Scenario 5: フラグの description が存在する (Property 5) ---
describe("フラグの description が存在する", () => {
  it.each(BOLT1_COMMANDS)("%s のフラグに description.ja と description.en が存在する", (cmd) => {
    const entry = commands[cmd];
    if (entry.flags) {
      for (const [flag, flagEntry] of Object.entries(entry.flags)) {
        expect(flagEntry.description.ja, `${cmd} ${flag} の description.ja`).toBeDefined();
        expect(flagEntry.description.ja.length, `${cmd} ${flag} の description.ja が空`).toBeGreaterThan(0);
        expect(flagEntry.description.en, `${cmd} ${flag} の description.en`).toBeDefined();
        expect(flagEntry.description.en.length, `${cmd} ${flag} の description.en が空`).toBeGreaterThan(0);
      }
    }
  });
});

// --- Scenario 6: sed -i の riskModifier が high (Property 6) ---
describe("sed -i の riskModifier", () => {
  it("sed -i の riskModifier が high である", () => {
    const sed = commands["sed"];
    expect(sed.flags).toBeDefined();
    expect(sed.flags!["-i"]).toBeDefined();
    expect(sed.flags!["-i"].riskModifier).toBe("high");
  });
});

// --- Scenario 7: ln -f の riskModifier が high (Property 7) ---
describe("ln -f の riskModifier", () => {
  it("ln -f の riskModifier が high である", () => {
    const ln = commands["ln"];
    expect(ln.flags).toBeDefined();
    expect(ln.flags!["-f"]).toBeDefined();
    expect(ln.flags!["-f"].riskModifier).toBe("high");
  });
});
