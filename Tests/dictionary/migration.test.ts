import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { loadDictionary } from "../../src/dictionaryLoader";

const DICTIONARY_DIR = path.join(__dirname, "..", "..", "dictionary");

// Phase 1 の37コマンド名（完全リスト）
const PHASE1_COMMANDS = [
  "ls", "cat", "mkdir", "rm", "cp", "mv", "touch", "ln", "tar", "diff", "tee",
  "grep", "find", "head", "tail", "wc", "sort", "uniq", "sed", "awk",
  "cd", "pwd", "echo", "which", "xargs", "export", "source",
  "curl",
  "ps", "kill", "node", "python",
  "chmod",
  "git", "npm", "pip", "npx",
];

// カテゴリ再分類マッピング
const TEXT_COMMANDS = ["grep", "find", "head", "tail", "wc", "sort", "uniq", "sed", "awk"];
const SHELL_COMMANDS = ["cd", "pwd", "echo", "which", "xargs", "export", "source"];

// Phase 1 の category（再分類されないコマンド）
const PHASE1_UNCHANGED_CATEGORIES: Record<string, string> = {
  ls: "filesystem", cat: "filesystem", mkdir: "filesystem", rm: "filesystem",
  cp: "filesystem", mv: "filesystem", touch: "filesystem", ln: "filesystem",
  tar: "filesystem", diff: "filesystem", tee: "filesystem",
  curl: "network", chmod: "system",
  ps: "process", kill: "process", node: "process", python: "process",
  git: "git", npm: "package", pip: "package", npx: "package",
};

// Phase 1 の commands.json を読み込み（データ保全検証用、フィクスチャから取得）
function loadPhase1Commands(): Record<string, Record<string, unknown>> {
  const phase1Path = path.join(__dirname, "fixtures", "phase1-commands.json");
  const raw = fs.readFileSync(phase1Path, "utf8");
  const json = JSON.parse(raw) as { commands: Record<string, Record<string, unknown>> };
  return json.commands;
}

describe("コマンド総数の保存 (P3)", () => {
  it("dictionaryLoader で読み込んだ totalCommands が Phase 1 の37以上であること", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    expect(result.metadata.totalCommands).toBeGreaterThanOrEqual(37);
  });

  it("commands オブジェクトのキー数が Phase 1 の37以上であること", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    expect(Object.keys(result.commands).length).toBeGreaterThanOrEqual(37);
  });
});

describe("コマンドの完全性 (P4)", () => {
  it("Phase 1 の37コマンドが全て存在すること", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      expect(result.commands, `コマンド "${cmd}" が存在しない`).toHaveProperty(cmd);
    }
  });

  it("Phase 1 の37コマンドが全て含まれていること（追加コマンドは許容）", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      expect(result.commands, `コマンド "${cmd}" が存在しない`).toHaveProperty(cmd);
    }
  });
});

describe("コマンドの一意性 (P5)", () => {
  it("全辞書ファイルを通じて重複コマンドキーがないこと", () => {
    const allKeys: string[] = [];
    for (const layer of ["core", "tools"]) {
      const layerDir = path.join(DICTIONARY_DIR, layer);
      if (!fs.existsSync(layerDir)) continue;
      for (const file of fs.readdirSync(layerDir).filter((f) => f.endsWith(".json"))) {
        const filePath = path.join(layerDir, file);
        const raw = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(raw) as { commands: Record<string, unknown> };
        const keys = Object.keys(json.commands);
        for (const key of keys) {
          expect(allKeys, `重複キー: "${key}" in ${layer}/${file}`).not.toContain(key);
          allKeys.push(key);
        }
      }
    }
    expect(allKeys).toHaveLength(99);
  });
});

describe("カテゴリ再分類の正確性 (P6)", () => {
  it("text.json の9コマンドの category が 'text' であること", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of TEXT_COMMANDS) {
      expect(result.commands[cmd].category, `${cmd} の category`).toBe("text");
    }
  });

  it("shell.json の7コマンドの category が 'shell' であること", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of SHELL_COMMANDS) {
      expect(result.commands[cmd].category, `${cmd} の category`).toBe("shell");
    }
  });

  it("再分類されないコマンドの category が Phase 1 と同一であること", () => {
    const result = loadDictionary(DICTIONARY_DIR);
    for (const [cmd, expectedCategory] of Object.entries(PHASE1_UNCHANGED_CATEGORIES)) {
      expect(result.commands[cmd].category, `${cmd} の category`).toBe(expectedCategory);
    }
  });
});

describe("データ保全 (P8)", () => {
  it("各コマンドの name が Phase 1 と同一であること", () => {
    const phase1 = loadPhase1Commands();
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      expect(result.commands[cmd].name, `${cmd} の name`).toBe(phase1[cmd]["name"]);
    }
  });

  it("各コマンドの description が Phase 1 と同一であること", () => {
    const phase1 = loadPhase1Commands();
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      expect(result.commands[cmd].description, `${cmd} の description`).toEqual(phase1[cmd]["description"]);
    }
  });

  it("各コマンドの baseRisk が Phase 1 と同一であること", () => {
    const phase1 = loadPhase1Commands();
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      expect(result.commands[cmd].baseRisk, `${cmd} の baseRisk`).toBe(phase1[cmd]["baseRisk"]);
    }
  });

  // 注: git は Phase 12 Unit 2 でコマンドレベル flags を空化し、
  // サブコマンドを 12→50 に拡張したため、deep equality から除外する
  it("flags を持つコマンドの flags が Phase 1 と同一であること", () => {
    const phase1 = loadPhase1Commands();
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      if (cmd === "git") continue; // Phase 12 で意図的に変更
      if (cmd === "docker" || cmd === "kubectl" || cmd === "terraform") continue; // Phase 13 で flags 空化
      if (phase1[cmd]["flags"]) {
        expect(result.commands[cmd].flags, `${cmd} の flags`).toEqual(phase1[cmd]["flags"]);
      }
    }
  });

  it("subcommands を持つコマンドの subcommands が Phase 1 と同一であること", () => {
    const phase1 = loadPhase1Commands();
    const result = loadDictionary(DICTIONARY_DIR);
    for (const cmd of PHASE1_COMMANDS) {
      if (cmd === "git") continue; // Phase 12 で意図的に変更
      if (cmd === "npm" || cmd === "pip") continue; // Phase 13 Unit 2 でサブコマンドフラグを追加
      if (cmd === "docker" || cmd === "kubectl" || cmd === "terraform") continue; // Phase 13 Unit 1 でサブコマンドフラグを追加
      if (phase1[cmd]["subcommands"]) {
        expect(result.commands[cmd].subcommands, `${cmd} の subcommands`).toEqual(phase1[cmd]["subcommands"]);
      }
    }
  });
});
