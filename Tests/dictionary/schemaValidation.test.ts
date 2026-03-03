import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const DICTIONARY_DIR = path.join(__dirname, "..", "..", "dictionary");

const VALID_RISK_LEVELS = ["low", "medium", "high", "critical"];
const VALID_CATEGORIES = [
  "filesystem", "text", "git", "package", "network",
  "process", "system", "container", "cloud", "shell", "other",
];
const VALID_LAYERS = ["core", "os", "tools"];

const CORE_FILES = ["filesystem.json", "text.json", "shell.json", "network.json", "process.json", "system.json"];
const TOOLS_FILES = ["aws.json", "docker.json", "gcloud.json", "git.json", "kubectl.json", "npm.json", "npx.json", "pip.json", "terraform.json"];

// Helper: read and parse a dictionary JSON file
function readDictFile(relativePath: string): Record<string, unknown> {
  const filePath = path.join(DICTIONARY_DIR, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

// Helper: collect all dictionary files (excluding schema.json)
function getAllDictFiles(): { relativePath: string; layer: string; fileName: string }[] {
  const files: { relativePath: string; layer: string; fileName: string }[] = [];
  for (const layer of ["core", "tools"]) {
    const layerDir = path.join(DICTIONARY_DIR, layer);
    if (!fs.existsSync(layerDir)) continue;
    for (const file of fs.readdirSync(layerDir).filter((f) => f.endsWith(".json")).sort()) {
      files.push({ relativePath: path.join(layer, file), layer, fileName: file });
    }
  }
  return files;
}

describe("schema.json の有効性 (P1)", () => {
  const schema = readDictFile("schema.json");

  it("$schema が JSON Schema Draft-07 であること", () => {
    expect(schema["$schema"]).toBe("http://json-schema.org/draft-07/schema#");
  });

  it("required に version, metadata, commands が含まれること", () => {
    const required = schema["required"] as string[];
    expect(required).toContain("version");
    expect(required).toContain("metadata");
    expect(required).toContain("commands");
  });

  it("definitions に CommandEntry, FlagEntry, SubcommandEntry が定義されていること", () => {
    const definitions = schema["definitions"] as Record<string, unknown>;
    expect(definitions).toHaveProperty("CommandEntry");
    expect(definitions).toHaveProperty("FlagEntry");
    expect(definitions).toHaveProperty("SubcommandEntry");
  });
});

describe("ファイル数と配置 (P2)", () => {
  it("core/ に6つの .json ファイルが存在すること", () => {
    const coreDir = path.join(DICTIONARY_DIR, "core");
    const files = fs.readdirSync(coreDir).filter((f) => f.endsWith(".json")).sort();
    expect(files).toEqual(CORE_FILES.sort());
    expect(files).toHaveLength(6);
  });

  it("tools/ に4つの .json ファイルが存在すること", () => {
    const toolsDir = path.join(DICTIONARY_DIR, "tools");
    const files = fs.readdirSync(toolsDir).filter((f) => f.endsWith(".json")).sort();
    expect(files).toEqual(TOOLS_FILES.sort());
    expect(files).toHaveLength(9);
  });

});

describe("metadata 整合性 (P7)", () => {
  const dictFiles = getAllDictFiles();

  it("全ファイルの version が '2.0.0' であること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      expect(data["version"], `${relativePath} の version`).toBe("2.0.0");
    }
  });

  it("metadata.layer がディレクトリ名と一致すること", () => {
    for (const { relativePath, layer } of dictFiles) {
      const data = readDictFile(relativePath);
      const metadata = data["metadata"] as Record<string, unknown>;
      expect(metadata["layer"], `${relativePath} の metadata.layer`).toBe(layer);
    }
  });

  it("metadata.name がファイル名（拡張子なし）と一致すること", () => {
    for (const { relativePath, fileName } of dictFiles) {
      const data = readDictFile(relativePath);
      const metadata = data["metadata"] as Record<string, unknown>;
      const expectedName = fileName.replace(".json", "");
      expect(metadata["name"], `${relativePath} の metadata.name`).toBe(expectedName);
    }
  });
});

describe("スキーマ適合性 (P9)", () => {
  const dictFiles = getAllDictFiles();

  it("全コマンドに必須フィールド（name, description, baseRisk, category）が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        expect(entry, `${relativePath}:${key}`).toHaveProperty("name");
        expect(entry, `${relativePath}:${key}`).toHaveProperty("description");
        expect(entry, `${relativePath}:${key}`).toHaveProperty("baseRisk");
        expect(entry, `${relativePath}:${key}`).toHaveProperty("category");
      }
    }
  });

  it("全コマンドの baseRisk が有効な enum 値であること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        expect(VALID_RISK_LEVELS, `${relativePath}:${key}`).toContain(entry["baseRisk"]);
      }
    }
  });

  it("全コマンドの category が Phase 2 の11値のいずれかであること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        expect(VALID_CATEGORIES, `${relativePath}:${key}`).toContain(entry["category"]);
      }
    }
  });

  it("flags が存在する場合、各フラグに description が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["flags"]) {
          const flags = entry["flags"] as Record<string, Record<string, unknown>>;
          for (const [flag, flagEntry] of Object.entries(flags)) {
            expect(flagEntry, `${relativePath}:${key}:${flag}`).toHaveProperty("description");
          }
        }
      }
    }
  });

  it("flags の riskModifier が存在する場合、有効な enum 値であること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["flags"]) {
          const flags = entry["flags"] as Record<string, Record<string, unknown>>;
          for (const [flag, flagEntry] of Object.entries(flags)) {
            if (flagEntry["riskModifier"] !== undefined) {
              expect(VALID_RISK_LEVELS, `${relativePath}:${key}:${flag}`).toContain(flagEntry["riskModifier"]);
            }
          }
        }
      }
    }
  });

  it("subcommands が存在する場合、各サブコマンドに description が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["subcommands"]) {
          const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
          for (const [sub, subEntry] of Object.entries(subs)) {
            expect(subEntry, `${relativePath}:${key}:${sub}`).toHaveProperty("description");
          }
        }
      }
    }
  });

  it("subcommands の riskOverride が存在する場合、有効な enum 値であること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["subcommands"]) {
          const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
          for (const [sub, subEntry] of Object.entries(subs)) {
            if (subEntry["riskOverride"] !== undefined) {
              expect(VALID_RISK_LEVELS, `${relativePath}:${key}:${sub}`).toContain(subEntry["riskOverride"]);
            }
          }
        }
      }
    }
  });

  it("全コマンドの name がキーと一致すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        expect(entry["name"], `${relativePath}:${key}`).toBe(key);
      }
    }
  });

  it("サブコマンドフラグが存在する場合、各フラグに description が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["subcommands"]) {
          const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
          for (const [sub, subEntry] of Object.entries(subs)) {
            if (subEntry["flags"]) {
              const flags = subEntry["flags"] as Record<string, Record<string, unknown>>;
              for (const [flag, flagEntry] of Object.entries(flags)) {
                expect(flagEntry, `${relativePath}:${key}:${sub}:${flag}`).toHaveProperty("description");
              }
            }
          }
        }
      }
    }
  });

  it("サブコマンドフラグの riskModifier が存在する場合、有効な enum 値であること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["subcommands"]) {
          const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
          for (const [sub, subEntry] of Object.entries(subs)) {
            if (subEntry["flags"]) {
              const flags = subEntry["flags"] as Record<string, Record<string, unknown>>;
              for (const [flag, flagEntry] of Object.entries(flags)) {
                if (flagEntry["riskModifier"] !== undefined) {
                  expect(VALID_RISK_LEVELS, `${relativePath}:${key}:${sub}:${flag}`).toContain(flagEntry["riskModifier"]);
                }
              }
            }
          }
        }
      }
    }
  });
});

describe("description 言語完全性 (P10)", () => {
  const dictFiles = getAllDictFiles();

  it("全コマンドの description に ja/en が存在し空文字でないこと", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        const desc = entry["description"] as Record<string, string>;
        expect(desc["ja"], `${relativePath}:${key} ja`).toBeTruthy();
        expect(desc["en"], `${relativePath}:${key} en`).toBeTruthy();
      }
    }
  });

  it("全フラグの description に ja/en が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["flags"]) {
          const flags = entry["flags"] as Record<string, Record<string, unknown>>;
          for (const [flag, flagEntry] of Object.entries(flags)) {
            const desc = flagEntry["description"] as Record<string, string>;
            expect(desc["ja"], `${relativePath}:${key}:${flag} ja`).toBeTruthy();
            expect(desc["en"], `${relativePath}:${key}:${flag} en`).toBeTruthy();
          }
        }
      }
    }
  });

  it("全サブコマンドの description に ja/en が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["subcommands"]) {
          const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
          for (const [sub, subEntry] of Object.entries(subs)) {
            const desc = subEntry["description"] as Record<string, string>;
            expect(desc["ja"], `${relativePath}:${key}:${sub} ja`).toBeTruthy();
            expect(desc["en"], `${relativePath}:${key}:${sub} en`).toBeTruthy();
          }
        }
      }
    }
  });

  it("全サブコマンドフラグの description に ja/en が存在すること", () => {
    for (const { relativePath } of dictFiles) {
      const data = readDictFile(relativePath);
      const commands = data["commands"] as Record<string, Record<string, unknown>>;
      for (const [key, entry] of Object.entries(commands)) {
        if (entry["subcommands"]) {
          const subs = entry["subcommands"] as Record<string, Record<string, unknown>>;
          for (const [sub, subEntry] of Object.entries(subs)) {
            if (subEntry["flags"]) {
              const flags = subEntry["flags"] as Record<string, Record<string, unknown>>;
              for (const [flag, flagEntry] of Object.entries(flags)) {
                const desc = flagEntry["description"] as Record<string, string>;
                expect(desc["ja"], `${relativePath}:${key}:${sub}:${flag} ja`).toBeTruthy();
                expect(desc["en"], `${relativePath}:${key}:${sub}:${flag} en`).toBeTruthy();
              }
            }
          }
        }
      }
    }
  });
});

