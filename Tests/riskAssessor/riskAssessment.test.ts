import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { assessRisk } from "../../src/riskAssessor";
import { makeParsed } from "../helpers/factories";
import { RiskLevel, CommandEntry } from "../../src/types";

const CORE_DIR = join(__dirname, "../../dictionary/core");

function loadJson(filename: string) {
  const raw = readFileSync(join(CORE_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

function getCommand(filename: string, cmdName: string): CommandEntry {
  const data = loadJson(filename);
  return data.commands[cmdName] as CommandEntry;
}

// --- P7-4: baseRisk検証 ---

describe("baseRisk検証", () => {
  const cases: [string, string, RiskLevel][] = [
    // critical
    ["filesystem.json", "mount", RiskLevel.Critical],
    ["filesystem.json", "fsck", RiskLevel.Critical],
    ["system.json", "su", RiskLevel.Critical],
    // high
    ["filesystem.json", "umount", RiskLevel.High],
    ["system.json", "chown", RiskLevel.High],
    ["system.json", "chgrp", RiskLevel.High],
    ["process.json", "killall", RiskLevel.High],
    ["process.json", "pkill", RiskLevel.High],
    // medium
    ["filesystem.json", "gzip", RiskLevel.Medium],
    ["filesystem.json", "rsync", RiskLevel.Medium],
    ["filesystem.json", "wget", RiskLevel.Medium],
    ["network.json", "ifconfig", RiskLevel.Medium],
    ["network.json", "ip", RiskLevel.Medium],
    // low
    ["filesystem.json", "df", RiskLevel.Low],
    ["filesystem.json", "du", RiskLevel.Low],
    ["filesystem.json", "file", RiskLevel.Low],
    ["system.json", "uptime", RiskLevel.Low],
    ["system.json", "whoami", RiskLevel.Low],
    ["network.json", "ping", RiskLevel.Low],
    ["network.json", "ss", RiskLevel.Low],
    ["network.json", "dig", RiskLevel.Low],
    ["process.json", "jobs", RiskLevel.Low],
    ["process.json", "htop", RiskLevel.Low],
    ["shell.json", "alias", RiskLevel.Low],
    ["shell.json", "watch", RiskLevel.Low],
    ["text.json", "cut", RiskLevel.Low],
    ["text.json", "tr", RiskLevel.Low],
    ["text.json", "column", RiskLevel.Low],
  ];

  for (const [file, cmdName, expectedRisk] of cases) {
    test(`${cmdName} の baseRisk が ${expectedRisk} である`, () => {
      const entry = getCommand(file, cmdName);
      expect(entry.baseRisk).toBe(expectedRisk);
    });
  }
});

// --- P7-4: riskModifier検証 ---

describe("riskModifier検証", () => {
  test("rsync --delete の riskModifier が high", () => {
    const entry = getCommand("filesystem.json", "rsync");
    expect(entry.flags?.["--delete"]?.riskModifier).toBe("high");
  });

  test("fsck -y の riskModifier が critical", () => {
    const entry = getCommand("filesystem.json", "fsck");
    expect(entry.flags?.["-y"]?.riskModifier).toBe("critical");
  });

  test("killall -9 の riskModifier が critical", () => {
    const entry = getCommand("process.json", "killall");
    expect(entry.flags?.["-9"]?.riskModifier).toBe("critical");
  });

  test("pkill -9 の riskModifier が critical", () => {
    const entry = getCommand("process.json", "pkill");
    expect(entry.flags?.["-9"]?.riskModifier).toBe("critical");
  });

  test("chown -R の riskModifier が high", () => {
    const entry = getCommand("system.json", "chown");
    expect(entry.flags?.["-R"]?.riskModifier).toBe("high");
  });

  test("date -s の riskModifier が critical", () => {
    const entry = getCommand("system.json", "date");
    expect(entry.flags?.["-s"]?.riskModifier).toBe("critical");
  });

  test("history -c の riskModifier が medium", () => {
    const entry = getCommand("shell.json", "history");
    expect(entry.flags?.["-c"]?.riskModifier).toBe("medium");
  });

  test("umount -f の riskModifier が critical", () => {
    const entry = getCommand("filesystem.json", "umount");
    expect(entry.flags?.["-f"]?.riskModifier).toBe("critical");
  });

  test("gzip -f の riskModifier が high", () => {
    const entry = getCommand("filesystem.json", "gzip");
    expect(entry.flags?.["-f"]?.riskModifier).toBe("high");
  });

  test("unzip -o の riskModifier が high", () => {
    const entry = getCommand("filesystem.json", "unzip");
    expect(entry.flags?.["-o"]?.riskModifier).toBe("high");
  });

  test("ss -K の riskModifier が high", () => {
    const entry = getCommand("network.json", "ss");
    expect(entry.flags?.["-K"]?.riskModifier).toBe("high");
  });
});

// --- P7-4: assessRisk統合検証 ---

describe("assessRisk統合検証", () => {
  test("mount → critical", () => {
    const entry = getCommand("filesystem.json", "mount");
    const parsed = makeParsed({ commandName: "mount" });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Critical);
  });

  test("su → critical", () => {
    const entry = getCommand("system.json", "su");
    const parsed = makeParsed({ commandName: "su" });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Critical);
  });

  test("rsync --delete → high", () => {
    const entry = getCommand("filesystem.json", "rsync");
    const parsed = makeParsed({ commandName: "rsync", flags: ["--delete"] });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.High);
  });

  test("killall -9 → critical", () => {
    const entry = getCommand("process.json", "killall");
    const parsed = makeParsed({ commandName: "killall", flags: ["-9"] });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Critical);
  });

  test("df → low", () => {
    const entry = getCommand("filesystem.json", "df");
    const parsed = makeParsed({ commandName: "df" });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Low);
  });

  test("ping → low", () => {
    const entry = getCommand("network.json", "ping");
    const parsed = makeParsed({ commandName: "ping" });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Low);
  });

  test("fsck -y → critical", () => {
    const entry = getCommand("filesystem.json", "fsck");
    const parsed = makeParsed({ commandName: "fsck", flags: ["-y"] });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Critical);
  });

  test("chown -R → high", () => {
    const entry = getCommand("system.json", "chown");
    const parsed = makeParsed({ commandName: "chown", flags: ["-R"] });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.High);
  });

  test("cut → low", () => {
    const entry = getCommand("text.json", "cut");
    const parsed = makeParsed({ commandName: "cut" });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Low);
  });

  test("watch → low", () => {
    const entry = getCommand("shell.json", "watch");
    const parsed = makeParsed({ commandName: "watch" });
    expect(assessRisk(parsed, entry)).toBe(RiskLevel.Low);
  });
});
