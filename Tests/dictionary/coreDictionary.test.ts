import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const CORE_DIR = join(__dirname, "../../dictionary/core");

function loadJson(filename: string) {
  const raw = readFileSync(join(CORE_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

// --- P7-1: JSON構文検証 ---

describe("JSON構文検証", () => {
  const files = [
    "filesystem.json",
    "system.json",
    "network.json",
    "process.json",
    "shell.json",
    "text.json",
  ];

  for (const file of files) {
    test(`${file} がvalid JSONである`, () => {
      expect(() => loadJson(file)).not.toThrow();
    });
  }
});

// --- P7-2: コマンド数検証 ---

describe("コマンド数検証", () => {
  const expected: Record<string, number> = {
    "filesystem.json": 25,
    "system.json": 14,
    "network.json": 10,
    "process.json": 15,
    "shell.json": 14,
    "text.json": 12,
  };

  for (const [file, count] of Object.entries(expected)) {
    test(`${file} に ${count} コマンドが存在する`, () => {
      const data = loadJson(file);
      expect(Object.keys(data.commands).length).toBe(count);
    });
  }

  test("core辞書の合計が86コマンドである", () => {
    let total = 0;
    for (const file of Object.keys(expected)) {
      const data = loadJson(file);
      total += Object.keys(data.commands).length;
    }
    expect(total).toBe(90);
  });
});

// --- P7-2: sudo除外検証 ---

describe("sudo除外", () => {
  test("system.json に sudo が存在しない", () => {
    const data = loadJson("system.json");
    expect(data.commands).not.toHaveProperty("sudo");
  });
});

// --- P7-2: ipサブコマンド構造検証 ---

describe("ipサブコマンド構造", () => {
  test("ip に subcommands が存在する", () => {
    const data = loadJson("network.json");
    const ip = data.commands.ip;
    expect(ip.subcommands).toBeDefined();
  });

  test("ip に addr, link, route, neigh の4サブコマンドが存在する", () => {
    const data = loadJson("network.json");
    const subs = Object.keys(data.commands.ip.subcommands);
    expect(subs).toContain("addr");
    expect(subs).toContain("link");
    expect(subs).toContain("route");
    expect(subs).toContain("neigh");
    expect(subs.length).toBe(4);
  });

  test("ip route の riskOverride が high である", () => {
    const data = loadJson("network.json");
    expect(data.commands.ip.subcommands.route.riskOverride).toBe("high");
  });
});

// --- P7-3: バイリンガル検証 ---

describe("バイリンガル検証（全コマンド）", () => {
  const files = [
    "filesystem.json",
    "system.json",
    "network.json",
    "process.json",
    "shell.json",
    "text.json",
  ];

  for (const file of files) {
    describe(file, () => {
      const data = loadJson(file);

      for (const [cmdName, cmd] of Object.entries(data.commands) as [string, any][]) {
        test(`${cmdName} の description に ja/en がある`, () => {
          expect(cmd.description.ja).toBeTruthy();
          expect(cmd.description.en).toBeTruthy();
        });

        // flags のバイリンガル検証
        if (cmd.flags) {
          for (const [flagName, flag] of Object.entries(cmd.flags) as [string, any][]) {
            test(`${cmdName} ${flagName} の description に ja/en がある`, () => {
              expect(flag.description.ja).toBeTruthy();
              expect(flag.description.en).toBeTruthy();
            });
          }
        }

        // subcommands のバイリンガル検証
        if (cmd.subcommands) {
          for (const [subName, sub] of Object.entries(cmd.subcommands) as [string, any][]) {
            test(`${cmdName} ${subName} の description に ja/en がある`, () => {
              expect(sub.description.ja).toBeTruthy();
              expect(sub.description.en).toBeTruthy();
            });

            if (sub.flags) {
              for (const [flagName, flag] of Object.entries(sub.flags) as [string, any][]) {
                test(`${cmdName} ${subName} ${flagName} の description に ja/en がある`, () => {
                  expect(flag.description.ja).toBeTruthy();
                  expect(flag.description.en).toBeTruthy();
                });
              }
            }
          }
        }
      }
    });
  }
});

// --- 新規追加コマンドの存在検証 ---

describe("Phase18 新規コマンドの存在検証", () => {
  const newCommands: Record<string, string[]> = {
    "filesystem.json": [
      "gzip", "gunzip", "bzip2", "bunzip2", "mount", "umount", "fsck",
      "wget", "zip", "unzip", "df", "du", "rsync", "file",
    ],
    "system.json": [
      "uptime", "whoami", "id", "date", "cal", "chown", "chgrp",
      "su", "top", "free", "uname", "hostname",
    ],
    "network.json": [
      "ping", "ifconfig", "ip", "netstat", "ss", "traceroute", "dig", "nslookup",
    ],
    "process.json": [
      "killall", "pkill", "bg", "fg", "jobs", "nohup", "timeout", "sleep", "htop",
    ],
    "shell.json": [
      "alias", "unalias", "type", "time", "watch", "history", "clear",
    ],
    "text.json": ["cut", "tr", "column"],
  };

  for (const [file, cmds] of Object.entries(newCommands)) {
    const data = loadJson(file);
    for (const cmd of cmds) {
      test(`${file}: ${cmd} が存在する`, () => {
        expect(data.commands).toHaveProperty(cmd);
      });
    }
  }
});

// --- 既存コマンド保持検証 ---

describe("既存コマンド保持検証", () => {
  const existingCommands: Record<string, string[]> = {
    "filesystem.json": ["ls", "cat", "mkdir", "rm", "cp", "mv", "touch", "ln", "tar", "diff", "tee"],
    "system.json": ["chmod"],
    "network.json": ["curl"],
    "process.json": ["ps", "kill", "node", "python"],
    "shell.json": ["cd", "pwd", "echo", "which", "xargs", "export", "source"],
    "text.json": ["grep", "find", "head", "tail", "wc", "sort", "uniq", "sed", "awk"],
  };

  for (const [file, cmds] of Object.entries(existingCommands)) {
    const data = loadJson(file);
    for (const cmd of cmds) {
      test(`${file}: 既存コマンド ${cmd} が保持されている`, () => {
        expect(data.commands).toHaveProperty(cmd);
      });
    }
  }
});
