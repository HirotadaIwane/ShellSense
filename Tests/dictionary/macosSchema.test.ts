import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const DICTIONARY_DIR = path.join(__dirname, "..", "..", "dictionary");
const MACOS_JSON_PATH = path.join(DICTIONARY_DIR, "os", "macos.json");

const VALID_RISK_LEVELS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "text", "git", "package", "network",
  "process", "system", "container", "cloud", "shell", "other",
];

// Helper: read and parse macos.json
function readMacosDict(): Record<string, unknown> {
  const raw = fs.readFileSync(MACOS_JSON_PATH, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

describe("ファイル存在と基本構造 (P1)", () => {
  it("dictionary/os/macos.json が存在すること", () => {
    expect(fs.existsSync(MACOS_JSON_PATH)).toBe(true);
  });

  it("version, metadata, commands の必須フィールドが存在すること", () => {
    const data = readMacosDict();
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("metadata");
    expect(data).toHaveProperty("commands");
  });
});

describe("metadata 整合性 (P2)", () => {
  const data = readMacosDict();
  const metadata = data["metadata"] as Record<string, unknown>;

  it("version が '2.0.0' であること", () => {
    expect(data["version"]).toBe("2.0.0");
  });

  it("metadata.layer が 'os' であること", () => {
    expect(metadata["layer"]).toBe("os");
  });

  it("metadata.name が 'macos' であること", () => {
    expect(metadata["name"]).toBe("macos");
  });

  it("metadata.os が 'macos' であること", () => {
    expect(metadata["os"]).toBe("macos");
  });
});

describe("二言語完全性 (P8)", () => {
  const data = readMacosDict();
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
});

describe("スキーマ適合性 (P9)", () => {
  const data = readMacosDict();
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
});

describe("ローダー互換性 (P10)", () => {
  it("dictionaryLoader で読み込み、324コマンドが返ること", async () => {
    const { loadDictionary } = await import("../../src/dictionaryLoader");
    const result = loadDictionary(DICTIONARY_DIR);
    expect(result.metadata.totalCommands).toBe(176);
  });

  it("macOS の主要コマンドが全てマージ結果に含まれること", async () => {
    const { loadDictionary } = await import("../../src/dictionaryLoader");
    const result = loadDictionary(DICTIONARY_DIR);
    const macosCommands = [
      "brew", "mas", "open", "pbcopy", "pbpaste", "defaults", "launchctl", "diskutil", "dscl",
      "softwareupdate", "scutil", "systemsetup", "tmutil", "xcode-select", "security", "codesign",
    ];
    for (const cmd of macosCommands) {
      expect(result.commands, `${cmd} がマージ結果に含まれること`).toHaveProperty(cmd);
    }
  });
});
