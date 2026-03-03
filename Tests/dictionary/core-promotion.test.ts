import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DictFile } from "../helpers/dictionaryTypes";

const DICT_DIR = join(__dirname, "../../dictionary/core");

function loadJson(filename: string): DictFile {
  const content = readFileSync(join(DICT_DIR, filename), "utf-8");
  return JSON.parse(content);
}

const VALID_RISKS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "text", "git", "package", "network",
  "process", "system", "container", "cloud", "shell", "other",
];

describe("Phase 19 — Unit 1: Core Dictionary Promotion", () => {
  // P1: lsof in process.json with 5 flags
  describe("P1: lsof (process.json)", () => {
    const dict = loadJson("process.json");
    const cmd = dict.commands["lsof"];

    it("should exist in process.json", () => {
      expect(cmd).toBeDefined();
    });

    it("should have name = 'lsof'", () => {
      expect(cmd.name).toBe("lsof");
    });

    it("should have baseRisk = 'low'", () => {
      expect(cmd.baseRisk).toBe("low");
    });

    it("should have category = 'process'", () => {
      expect(cmd.category).toBe("process");
    });

    it("should have non-empty ja description", () => {
      expect(cmd.description.ja).toBeTruthy();
    });

    it("should have non-empty en description", () => {
      expect(cmd.description.en).toBeTruthy();
    });

    it("should have exactly 5 flags (-i, -p, -u, -t, +D)", () => {
      const flagKeys = Object.keys(cmd.flags ?? {});
      expect(flagKeys).toHaveLength(5);
      expect(flagKeys).toEqual(expect.arrayContaining(["-i", "-p", "-u", "-t", "+D"]));
    });

    it("should have ja/en descriptions for all flags", () => {
      for (const [key, flag] of Object.entries(cmd.flags ?? {})) {
        expect(flag.description.ja, `${key} ja`).toBeTruthy();
        expect(flag.description.en, `${key} en`).toBeTruthy();
      }
    });

    it("should have no riskModifier on any flag (all read-only)", () => {
      for (const flag of Object.values(cmd.flags ?? {})) {
        expect(flag.riskModifier).toBeUndefined();
      }
    });
  });

  // P2: pgrep in process.json with 5 flags
  describe("P2: pgrep (process.json)", () => {
    const dict = loadJson("process.json");
    const cmd = dict.commands["pgrep"];

    it("should exist in process.json", () => {
      expect(cmd).toBeDefined();
    });

    it("should have name = 'pgrep'", () => {
      expect(cmd.name).toBe("pgrep");
    });

    it("should have baseRisk = 'low'", () => {
      expect(cmd.baseRisk).toBe("low");
    });

    it("should have category = 'process'", () => {
      expect(cmd.category).toBe("process");
    });

    it("should have non-empty ja description", () => {
      expect(cmd.description.ja).toBeTruthy();
    });

    it("should have non-empty en description", () => {
      expect(cmd.description.en).toBeTruthy();
    });

    it("should have exactly 5 flags (-f, -l, -a, -u, -c)", () => {
      const flagKeys = Object.keys(cmd.flags ?? {});
      expect(flagKeys).toHaveLength(5);
      expect(flagKeys).toEqual(expect.arrayContaining(["-f", "-l", "-a", "-u", "-c"]));
    });

    it("should have ja/en descriptions for all flags", () => {
      for (const [key, flag] of Object.entries(cmd.flags ?? {})) {
        expect(flag.description.ja, `${key} ja`).toBeTruthy();
        expect(flag.description.en, `${key} en`).toBeTruthy();
      }
    });

    it("should have no riskModifier on any flag (all read-only)", () => {
      for (const flag of Object.values(cmd.flags ?? {})) {
        expect(flag.riskModifier).toBeUndefined();
      }
    });
  });

  // P3: nc in network.json with 6 flags, -l has riskModifier: medium
  describe("P3: nc (network.json)", () => {
    const dict = loadJson("network.json");
    const cmd = dict.commands["nc"];

    it("should exist in network.json", () => {
      expect(cmd).toBeDefined();
    });

    it("should have name = 'nc'", () => {
      expect(cmd.name).toBe("nc");
    });

    it("should have baseRisk = 'low'", () => {
      expect(cmd.baseRisk).toBe("low");
    });

    it("should have category = 'network'", () => {
      expect(cmd.category).toBe("network");
    });

    it("should have non-empty ja description", () => {
      expect(cmd.description.ja).toBeTruthy();
    });

    it("should have non-empty en description", () => {
      expect(cmd.description.en).toBeTruthy();
    });

    it("should have exactly 6 flags (-l, -p, -z, -v, -w, -u)", () => {
      const flagKeys = Object.keys(cmd.flags ?? {});
      expect(flagKeys).toHaveLength(6);
      expect(flagKeys).toEqual(expect.arrayContaining(["-l", "-p", "-z", "-v", "-w", "-u"]));
    });

    it("should have riskModifier 'medium' on -l flag", () => {
      expect(cmd.flags?.["-l"]?.riskModifier).toBe("medium");
    });

    it("should have no riskModifier on other flags", () => {
      const otherFlags = ["-p", "-z", "-v", "-w", "-u"];
      for (const key of otherFlags) {
        expect(cmd.flags?.[key]?.riskModifier, `${key}`).toBeUndefined();
      }
    });

    it("should have ja/en descriptions for all flags", () => {
      for (const [key, flag] of Object.entries(cmd.flags ?? {})) {
        expect(flag.description.ja, `${key} ja`).toBeTruthy();
        expect(flag.description.en, `${key} en`).toBeTruthy();
      }
    });
  });

  // P4: crontab in system.json with 4 flags, -e medium, -r high
  describe("P4: crontab (system.json)", () => {
    const dict = loadJson("system.json");
    const cmd = dict.commands["crontab"];

    it("should exist in system.json", () => {
      expect(cmd).toBeDefined();
    });

    it("should have name = 'crontab'", () => {
      expect(cmd.name).toBe("crontab");
    });

    it("should have baseRisk = 'medium'", () => {
      expect(cmd.baseRisk).toBe("medium");
    });

    it("should have category = 'system'", () => {
      expect(cmd.category).toBe("system");
    });

    it("should have non-empty ja description", () => {
      expect(cmd.description.ja).toBeTruthy();
    });

    it("should have non-empty en description", () => {
      expect(cmd.description.en).toBeTruthy();
    });

    it("should have exactly 4 flags (-e, -l, -r, -u)", () => {
      const flagKeys = Object.keys(cmd.flags ?? {});
      expect(flagKeys).toHaveLength(4);
      expect(flagKeys).toEqual(expect.arrayContaining(["-e", "-l", "-r", "-u"]));
    });

    it("should have riskModifier 'medium' on -e flag", () => {
      expect(cmd.flags?.["-e"]?.riskModifier).toBe("medium");
    });

    it("should have riskModifier 'high' on -r flag", () => {
      expect(cmd.flags?.["-r"]?.riskModifier).toBe("high");
    });

    it("should have no riskModifier on -l and -u flags", () => {
      expect(cmd.flags?.["-l"]?.riskModifier).toBeUndefined();
      expect(cmd.flags?.["-u"]?.riskModifier).toBeUndefined();
    });

    it("should have ja/en descriptions for all flags", () => {
      for (const [key, flag] of Object.entries(cmd.flags ?? {})) {
        expect(flag.description.ja, `${key} ja`).toBeTruthy();
        expect(flag.description.en, `${key} en`).toBeTruthy();
      }
    });
  });

  // P5: Schema compliance — all 4 commands have required fields
  describe("P5: Schema compliance", () => {
    const processDict = loadJson("process.json");
    const networkDict = loadJson("network.json");
    const systemDict = loadJson("system.json");

    const promoted = [
      { name: "lsof", cmd: processDict.commands["lsof"] },
      { name: "pgrep", cmd: processDict.commands["pgrep"] },
      { name: "nc", cmd: networkDict.commands["nc"] },
      { name: "crontab", cmd: systemDict.commands["crontab"] },
    ];

    it.each(promoted)("$name should have all required fields (name, description, baseRisk, category)", ({ cmd }) => {
      expect(cmd.name).toBeTruthy();
      expect(cmd.description).toBeDefined();
      expect(cmd.description.ja).toBeTruthy();
      expect(cmd.description.en).toBeTruthy();
      expect(VALID_RISKS).toContain(cmd.baseRisk);
      expect(VALID_CATEGORIES).toContain(cmd.category);
    });

    it.each(promoted)("$name flags should have valid riskModifier values if present", ({ cmd }) => {
      for (const flag of Object.values(cmd.flags ?? {})) {
        if (flag.riskModifier !== undefined) {
          expect(VALID_RISKS).toContain(flag.riskModifier);
        }
      }
    });
  });

  // P6: Existing commands unchanged (spot check)
  describe("P6: No regression on existing commands", () => {
    it("process.json should still contain ps, kill, node (pre-existing)", () => {
      const dict = loadJson("process.json");
      expect(dict.commands["ps"]).toBeDefined();
      expect(dict.commands["kill"]).toBeDefined();
      expect(dict.commands["node"]).toBeDefined();
    });

    it("network.json should still contain curl, ping, dig (pre-existing)", () => {
      const dict = loadJson("network.json");
      expect(dict.commands["curl"]).toBeDefined();
      expect(dict.commands["ping"]).toBeDefined();
      expect(dict.commands["dig"]).toBeDefined();
    });

    it("system.json should still contain chmod, su, uname (pre-existing)", () => {
      const dict = loadJson("system.json");
      expect(dict.commands["chmod"]).toBeDefined();
      expect(dict.commands["su"]).toBeDefined();
      expect(dict.commands["uname"]).toBeDefined();
    });

    it("process.json should have 15 commands (13 existing + 2 new)", () => {
      const dict = loadJson("process.json");
      expect(Object.keys(dict.commands)).toHaveLength(15);
    });

    it("network.json should have 10 commands (9 existing + 1 new)", () => {
      const dict = loadJson("network.json");
      expect(Object.keys(dict.commands)).toHaveLength(10);
    });

    it("system.json should have 14 commands (13 existing + 1 new)", () => {
      const dict = loadJson("system.json");
      expect(Object.keys(dict.commands)).toHaveLength(14);
    });
  });
});