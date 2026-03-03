import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DictFile, loadCoreCommandNames } from "../helpers/dictionaryTypes";

const DICT_DIR = join(__dirname, "../../dictionary");
const LINUX_PATH = join(DICT_DIR, "os/linux.json");

function loadLinux(): DictFile {
  return JSON.parse(readFileSync(LINUX_PATH, "utf-8"));
}

const VALID_RISKS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "text", "git", "package", "network",
  "process", "system", "container", "cloud", "shell", "other",
];

describe("Phase 19 — Unit 2: Linux Dictionary Rebuild", () => {
  // P1: Command count = 44
  describe("P1: Command count", () => {
    it("should have exactly 44 commands", () => {
      const dict = loadLinux();
      expect(Object.keys(dict.commands)).toHaveLength(44);
    });
  });

  // P2: Metadata
  describe("P2: Metadata", () => {
    const dict = loadLinux();

    it("should have version 2.0.0", () => {
      expect(dict.version).toBe("2.0.0");
    });

    it("should have layer = 'os'", () => {
      expect(dict.metadata.layer).toBe("os");
    });

    it("should have name = 'linux'", () => {
      expect(dict.metadata.name).toBe("linux");
    });

    it("should have os = 'linux'", () => {
      expect(dict.metadata.os).toBe("linux");
    });
  });

  // P3: Core overlap = 0
  describe("P3: No Core overlap", () => {
    it("should have zero commands that exist in core dictionaries", () => {
      const linux = loadLinux();
      const coreNames = loadCoreCommandNames();
      const linuxNames = Object.keys(linux.commands);
      const overlap = linuxNames.filter((n) => coreNames.includes(n));
      expect(overlap, `Overlapping commands: ${overlap.join(", ")}`).toHaveLength(0);
    });
  });

  // P4: No category "other"
  describe("P4: No category 'other'", () => {
    it("should have zero commands with category 'other'", () => {
      const dict = loadLinux();
      const others = Object.entries(dict.commands)
        .filter(([, cmd]) => cmd.category === "other")
        .map(([name]) => name);
      expect(others, `Commands with 'other': ${others.join(", ")}`).toHaveLength(0);
    });
  });

  // P5: Package management subcommands
  describe("P5: Package management subcommands", () => {
    const dict = loadLinux();

    it("apt should have 10 subcommands", () => {
      const subs = Object.keys(dict.commands["apt"]?.subcommands ?? {});
      expect(subs).toHaveLength(10);
      expect(subs).toEqual(expect.arrayContaining([
        "install", "remove", "purge", "update", "upgrade",
        "dist-upgrade", "autoremove", "search", "list", "show",
      ]));
    });

    it("apt-get should have 8 subcommands", () => {
      const subs = Object.keys(dict.commands["apt-get"]?.subcommands ?? {});
      expect(subs).toHaveLength(8);
      expect(subs).toEqual(expect.arrayContaining([
        "install", "remove", "purge", "update", "upgrade",
        "dist-upgrade", "autoremove", "clean",
      ]));
    });

    it("apt-cache should have 5 subcommands", () => {
      const subs = Object.keys(dict.commands["apt-cache"]?.subcommands ?? {});
      expect(subs).toHaveLength(5);
      expect(subs).toEqual(expect.arrayContaining([
        "search", "show", "depends", "rdepends", "policy",
      ]));
    });

    it("dnf should have 8 subcommands", () => {
      const subs = Object.keys(dict.commands["dnf"]?.subcommands ?? {});
      expect(subs).toHaveLength(8);
      expect(subs).toEqual(expect.arrayContaining([
        "install", "remove", "update", "upgrade", "search", "list", "info", "clean",
      ]));
    });

    it("snap should have 7 subcommands", () => {
      const subs = Object.keys(dict.commands["snap"]?.subcommands ?? {});
      expect(subs).toHaveLength(7);
      expect(subs).toEqual(expect.arrayContaining([
        "install", "remove", "list", "find", "refresh", "info", "revert",
      ]));
    });
  });

  // P6: Service management subcommands
  describe("P6: Service management subcommands", () => {
    const dict = loadLinux();

    it("systemctl should have 12 subcommands", () => {
      const subs = Object.keys(dict.commands["systemctl"]?.subcommands ?? {});
      expect(subs).toHaveLength(12);
      expect(subs).toEqual(expect.arrayContaining([
        "start", "stop", "restart", "reload", "enable", "disable",
        "status", "daemon-reload", "is-active", "is-enabled", "list-units", "mask",
      ]));
    });

    it("service should have 4 subcommands", () => {
      const subs = Object.keys(dict.commands["service"]?.subcommands ?? {});
      expect(subs).toHaveLength(4);
      expect(subs).toEqual(expect.arrayContaining([
        "start", "stop", "restart", "status",
      ]));
    });
  });

  // P7: Firewall subcommands
  describe("P7: Firewall subcommands", () => {
    it("ufw should have 8 subcommands", () => {
      const dict = loadLinux();
      const subs = Object.keys(dict.commands["ufw"]?.subcommands ?? {});
      expect(subs).toHaveLength(8);
      expect(subs).toEqual(expect.arrayContaining([
        "enable", "disable", "allow", "deny", "status", "delete", "reset", "reload",
      ]));
    });
  });

  // P8: Critical risk commands
  describe("P8: Critical risk commands", () => {
    const CRITICAL_COMMANDS = ["dd", "fdisk", "mkfs", "parted", "shred"];

    it.each(CRITICAL_COMMANDS)("%s should have baseRisk = 'critical'", (name) => {
      const dict = loadLinux();
      expect(dict.commands[name]?.baseRisk).toBe("critical");
    });
  });

  // P9: Description completeness
  describe("P9: Description completeness", () => {
    const dict = loadLinux();

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

    it("all subcommand flags should have non-empty ja and en descriptions", () => {
      for (const [name, cmd] of Object.entries(dict.commands)) {
        for (const [sub, subEntry] of Object.entries(cmd.subcommands ?? {})) {
          for (const [flag, flagEntry] of Object.entries(subEntry.flags ?? {})) {
            expect(flagEntry.description.ja, `${name} ${sub} ${flag} ja`).toBeTruthy();
            expect(flagEntry.description.en, `${name} ${sub} ${flag} en`).toBeTruthy();
          }
        }
      }
    });
  });

  // P10: Schema compliance
  describe("P10: Schema compliance", () => {
    const dict = loadLinux();

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
