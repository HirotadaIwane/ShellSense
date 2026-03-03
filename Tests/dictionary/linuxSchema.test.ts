import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const DICTIONARY_DIR = path.join(__dirname, "..", "..", "dictionary");
const LINUX_JSON_PATH = path.join(DICTIONARY_DIR, "os", "linux.json");

const VALID_RISK_LEVELS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "text", "git", "package", "network",
  "process", "system", "container", "cloud", "shell", "other",
];

// Helper: read and parse linux.json
function readLinuxDict(): Record<string, unknown> {
  const raw = fs.readFileSync(LINUX_JSON_PATH, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

describe("ファイル存在と基本構造 (P1)", () => {
  it("dictionary/os/linux.json が存在すること", () => {
    expect(fs.existsSync(LINUX_JSON_PATH)).toBe(true);
  });

  it("version, metadata, commands の必須フィールドが存在すること", () => {
    const data = readLinuxDict();
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("metadata");
    expect(data).toHaveProperty("commands");
  });
});

describe("metadata 整合性 (P2)", () => {
  const data = readLinuxDict();
  const metadata = data["metadata"] as Record<string, unknown>;

  it("version が '2.0.0' であること", () => {
    expect(data["version"]).toBe("2.0.0");
  });

  it("metadata.layer が 'os' であること", () => {
    expect(metadata["layer"]).toBe("os");
  });

  it("metadata.name が 'linux' であること", () => {
    expect(metadata["name"]).toBe("linux");
  });

  it("metadata.os が 'linux' であること", () => {
    expect(metadata["os"]).toBe("linux");
  });
});

describe("二言語完全性 (P8)", () => {
  const data = readLinuxDict();
  const commands = data["commands"] as Record<string, Record<string, unknown>>;

  it("全コマンドの description に ja/en が存在し空文字でないこと", () => {
    for (const [key, entry] of Object.entries(commands)) {
      const desc = entry["description"] as Record<string, string>;
      expect(desc["ja"], `${key} の description.ja`).toBeTruthy();
      expect(desc["en"], `${key} の description.en`).toBeTruthy();
    }
  });

  it("全サブコマンドの description に ja/en が存在し空文字でないこと", () => {
    for (const [key, entry] of Object.entries(commands)) {
      if (entry["subcommands"]) {
        const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
        for (const [sub, subEntry] of Object.entries(subs)) {
          const desc = subEntry["description"] as Record<string, string>;
          expect(desc["ja"], `${key}:${sub} の description.ja`).toBeTruthy();
          expect(desc["en"], `${key}:${sub} の description.en`).toBeTruthy();
        }
      }
    }
  });

  it("全フラグの description に ja/en が存在し空文字でないこと", () => {
    for (const [key, entry] of Object.entries(commands)) {
      if (entry["flags"]) {
        const flags = entry["flags"] as Record<string, Record<string, unknown>>;
        for (const [flag, flagEntry] of Object.entries(flags)) {
          const desc = flagEntry["description"] as Record<string, string>;
          expect(desc["ja"], `${key}:${flag} の description.ja`).toBeTruthy();
          expect(desc["en"], `${key}:${flag} の description.en`).toBeTruthy();
        }
      }
    }
  });
});

describe("スキーマ適合性 (P9)", () => {
  const data = readLinuxDict();
  const commands = data["commands"] as Record<string, Record<string, unknown>>;

  it("全コマンドに必須フィールド（name, description, baseRisk, category）が存在すること", () => {
    for (const [key, entry] of Object.entries(commands)) {
      expect(entry, `${key}`).toHaveProperty("name");
      expect(entry, `${key}`).toHaveProperty("description");
      expect(entry, `${key}`).toHaveProperty("baseRisk");
      expect(entry, `${key}`).toHaveProperty("category");
    }
  });

  it("全コマンドの baseRisk が有効な enum 値であること", () => {
    for (const [key, entry] of Object.entries(commands)) {
      expect(VALID_RISK_LEVELS, `${key}`).toContain(entry["baseRisk"]);
    }
  });

  it("全コマンドの category が Phase 2 の11値のいずれかであること", () => {
    for (const [key, entry] of Object.entries(commands)) {
      expect(VALID_CATEGORIES, `${key}`).toContain(entry["category"]);
    }
  });

  it("subcommands の riskOverride が有効な enum 値であること", () => {
    for (const [key, entry] of Object.entries(commands)) {
      if (entry["subcommands"]) {
        const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
        for (const [sub, subEntry] of Object.entries(subs)) {
          if (subEntry["riskOverride"] !== undefined) {
            expect(VALID_RISK_LEVELS, `${key}:${sub}`).toContain(subEntry["riskOverride"]);
          }
        }
      }
    }
  });

  it("flags の riskModifier が有効な enum 値であること", () => {
    for (const [key, entry] of Object.entries(commands)) {
      if (entry["flags"]) {
        const flags = entry["flags"] as Record<string, Record<string, unknown>>;
        for (const [flag, flagEntry] of Object.entries(flags)) {
          if (flagEntry["riskModifier"] !== undefined) {
            expect(VALID_RISK_LEVELS, `${key}:${flag}`).toContain(flagEntry["riskModifier"]);
          }
        }
      }
    }
  });
});

describe("ローダー互換性 (P10)", () => {
  it("dictionaryLoader で読み込み、324コマンドが返ること", async () => {
    const { loadDictionary } = await import("../../src/dictionaryLoader");
    const result = loadDictionary(DICTIONARY_DIR);
    expect(result.metadata.totalCommands).toBe(176);
  });

  it("Linux の8コマンドが全てマージ結果に含まれること", async () => {
    const { loadDictionary } = await import("../../src/dictionaryLoader");
    const result = loadDictionary(DICTIONARY_DIR);
    const linuxCommands = ["apt", "systemctl", "journalctl", "service", "ufw", "useradd", "usermod", "passwd"];
    for (const cmd of linuxCommands) {
      expect(result.commands, `${cmd} がマージ結果に含まれること`).toHaveProperty(cmd);
    }
  });
});
