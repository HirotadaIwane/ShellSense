import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DictFile, loadCoreCommandNames } from "../helpers/dictionaryTypes";

const DICT_DIR = join(__dirname, "../../dictionary");
const MACOS_PATH = join(DICT_DIR, "os/macos.json");

function loadMacos(): DictFile {
  return JSON.parse(readFileSync(MACOS_PATH, "utf-8"));
}

const VALID_RISKS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "text", "git", "package", "network",
  "process", "system", "container", "cloud", "shell", "other",
];

describe("Phase 19 — Unit 3: macOS Dictionary Rebuild", () => {
  // P1: Command count = 35 (Specs.md header says 37 but lists 35 unique commands)
  describe("P1: Command count", () => {
    it("should have exactly 35 commands", () => {
      const dict = loadMacos();
      expect(Object.keys(dict.commands)).toHaveLength(35);
    });
  });

  // P2: Metadata
  describe("P2: Metadata", () => {
    const dict = loadMacos();

    it("should have version 2.0.0", () => {
      expect(dict.version).toBe("2.0.0");
    });

    it("should have layer = 'os'", () => {
      expect(dict.metadata.layer).toBe("os");
    });

    it("should have name = 'macos'", () => {
      expect(dict.metadata.name).toBe("macos");
    });

    it("should have os = 'macos'", () => {
      expect(dict.metadata.os).toBe("macos");
    });
  });

  // P3: Core overlap = 0
  describe("P3: No Core overlap", () => {
    it("should have zero commands that exist in core dictionaries", () => {
      const macos = loadMacos();
      const coreNames = loadCoreCommandNames();
      const macosNames = Object.keys(macos.commands);
      const overlap = macosNames.filter((n) => coreNames.includes(n));
      expect(overlap, `Overlapping commands: ${overlap.join(", ")}`).toHaveLength(0);
    });
  });

  // P4: brew subcommands (14)
  describe("P4: brew subcommands", () => {
    it("should have 14 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["brew"]?.subcommands ?? {});
      expect(subs).toHaveLength(14);
      expect(subs).toEqual(expect.arrayContaining([
        "install", "uninstall", "update", "upgrade", "search", "list", "info",
        "tap", "untap", "services", "cleanup", "doctor", "pin", "unpin",
      ]));
    });
  });

  // P5: launchctl subcommands (8)
  describe("P5: launchctl subcommands", () => {
    it("should have 8 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["launchctl"]?.subcommands ?? {});
      expect(subs).toHaveLength(8);
      expect(subs).toEqual(expect.arrayContaining([
        "load", "unload", "start", "stop", "list", "bootstrap", "bootout", "print",
      ]));
    });
  });

  // P6: diskutil subcommands (12) + eraseDisk/partitionDisk critical
  describe("P6: diskutil subcommands", () => {
    const dict = loadMacos();
    const subs = dict.commands["diskutil"]?.subcommands ?? {};

    it("should have 12 subcommands", () => {
      const subKeys = Object.keys(subs);
      expect(subKeys).toHaveLength(12);
      expect(subKeys).toEqual(expect.arrayContaining([
        "list", "info", "erase", "mount", "unmount", "mountDisk",
        "unmountDisk", "eraseDisk", "partitionDisk", "verifyDisk", "repairDisk", "apfs",
      ]));
    });

    it("eraseDisk should have riskOverride = 'critical'", () => {
      expect(subs["eraseDisk"]?.riskOverride).toBe("critical");
    });

    it("partitionDisk should have riskOverride = 'critical'", () => {
      expect(subs["partitionDisk"]?.riskOverride).toBe("critical");
    });
  });

  // P7: defaults subcommands (6)
  describe("P7: defaults subcommands", () => {
    it("should have 6 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["defaults"]?.subcommands ?? {});
      expect(subs).toHaveLength(6);
      expect(subs).toEqual(expect.arrayContaining([
        "read", "write", "delete", "find", "export", "import",
      ]));
    });
  });

  // P8: security subcommands (7)
  describe("P8: security subcommands", () => {
    it("should have 7 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["security"]?.subcommands ?? {});
      expect(subs).toHaveLength(7);
      expect(subs).toEqual(expect.arrayContaining([
        "find-identity", "find-certificate", "add-trusted-cert",
        "delete-certificate", "find-generic-password", "add-generic-password",
        "unlock-keychain",
      ]));
    });
  });

  // P9: tmutil subcommands (8)
  describe("P9: tmutil subcommands", () => {
    it("should have 8 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["tmutil"]?.subcommands ?? {});
      expect(subs).toHaveLength(8);
      expect(subs).toEqual(expect.arrayContaining([
        "startbackup", "stopbackup", "listbackups", "latestbackup",
        "delete", "restore", "disable", "enable",
      ]));
    });
  });

  // P10: Dev tools subcommands
  describe("P10: Dev tools subcommands", () => {
    const dict = loadMacos();

    it("xcode-select should have 3 subcommands", () => {
      const subs = Object.keys(dict.commands["xcode-select"]?.subcommands ?? {});
      expect(subs).toHaveLength(3);
      expect(subs).toEqual(expect.arrayContaining(["--install", "--switch", "--reset"]));
    });

    it("xcodebuild should have 4 subcommands", () => {
      const subs = Object.keys(dict.commands["xcodebuild"]?.subcommands ?? {});
      expect(subs).toHaveLength(4);
      expect(subs).toEqual(expect.arrayContaining(["build", "clean", "test", "archive"]));
    });

    it("swift should have 4 subcommands", () => {
      const subs = Object.keys(dict.commands["swift"]?.subcommands ?? {});
      expect(subs).toHaveLength(4);
      expect(subs).toEqual(expect.arrayContaining(["build", "test", "run", "package"]));
    });
  });

  // P11: hdiutil subcommands (6)
  describe("P11: hdiutil subcommands", () => {
    it("should have 6 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["hdiutil"]?.subcommands ?? {});
      expect(subs).toHaveLength(6);
      expect(subs).toEqual(expect.arrayContaining([
        "create", "attach", "detach", "info", "verify", "erase",
      ]));
    });
  });

  // P12: mas subcommands (6)
  describe("P12: mas subcommands", () => {
    it("should have 6 subcommands", () => {
      const dict = loadMacos();
      const subs = Object.keys(dict.commands["mas"]?.subcommands ?? {});
      expect(subs).toHaveLength(6);
      expect(subs).toEqual(expect.arrayContaining([
        "install", "uninstall", "search", "list", "upgrade", "outdated",
      ]));
    });
  });

  // P13: Description completeness
  describe("P13: Description completeness", () => {
    const dict = loadMacos();

    it("all commands should have non-empty ja and en descriptions", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        expect(cmd.description.ja, `${name} ja`).toBeTruthy();
        expect(cmd.description.en, `${name} en`).toBeTruthy();
      }
    });

    it("all subcommands should have non-empty ja and en descriptions", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        for (const [sub, entry] of Object.entries(cmd.subcommands ?? {})) {
          expect(entry.description.ja, `${name} ${sub} ja`).toBeTruthy();
          expect(entry.description.en, `${name} ${sub} en`).toBeTruthy();
        }
      }
    });

    it("all flags should have non-empty ja and en descriptions", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        for (const [flag, entry] of Object.entries(cmd.flags ?? {})) {
          expect(entry.description.ja, `${name} ${flag} ja`).toBeTruthy();
          expect(entry.description.en, `${name} ${flag} en`).toBeTruthy();
        }
      }
    });
  });

  // P14: Schema compliance
  describe("P14: Schema compliance", () => {
    const dict = loadMacos();

    it("all commands should have required fields", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        expect(cmd.name, `${name} name`).toBeTruthy();
        expect(cmd.description, `${name} description`).toBeDefined();
        expect(VALID_RISKS, `${name} baseRisk`).toContain(cmd.baseRisk);
        expect(VALID_CATEGORIES, `${name} category`).toContain(cmd.category);
      }
    });

    it("all riskOverride values should be valid", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        for (const [sub, entry] of Object.entries(cmd.subcommands ?? {})) {
          if (entry.riskOverride !== undefined) {
            expect(VALID_RISKS, `${name} ${sub} riskOverride`).toContain(entry.riskOverride);
          }
        }
      }
    });

    it("all riskModifier values should be valid", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        for (const [flag, entry] of Object.entries(cmd.flags ?? {})) {
          if (entry.riskModifier !== undefined) {
            expect(VALID_RISKS, `${name} ${flag} riskModifier`).toContain(entry.riskModifier);
          }
        }
      }
    });
  });
});
