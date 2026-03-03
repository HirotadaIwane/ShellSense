import { describe, it, expect } from "vitest";
import {
  RiskLevel,
  type CommandCategory,
  type FlagEntry,
  type SubcommandEntry,
  type CommandEntry,
  type ParsedCommand,
  type HookInput,
  type HookOutput,
  type DictionaryLayer,
  type SupportedLanguage,
  type DictionaryFile,
  type LoaderResult,
  type RiskLabels,
  type LanguageLabels,
  type LayoutGroupId,
  type FormatterConfig,
} from "../../src/types";

// ============================================================
// Phase 1: Core types (RiskLevel, ParsedCommand, CommandEntry, etc.)
// ============================================================

// Scenario 1: RiskLevel enumの完全性 (Property 5)
describe("RiskLevel enum", () => {
  it("Low は 'low' であること", () => {
    expect(RiskLevel.Low).toBe("low");
  });

  it("Medium は 'medium' であること", () => {
    expect(RiskLevel.Medium).toBe("medium");
  });

  it("High は 'high' であること", () => {
    expect(RiskLevel.High).toBe("high");
  });

  it("Critical は 'critical' であること", () => {
    expect(RiskLevel.Critical).toBe("critical");
  });

  it("ちょうど4つのメンバーを持つこと", () => {
    const values = Object.values(RiskLevel);
    expect(values).toHaveLength(4);
  });
});

// Scenario 3: 型構造のランタイム確認 (Property 6〜9)
describe("型構造の確認", () => {
  it("HookInput 型のオブジェクトが作成できること", () => {
    const input: HookInput = {
      session_id: "test-session",
      transcript_path: "/tmp/transcript.jsonl",
      cwd: "/home/user/project",
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: {
        command: "ls -la",
      },
    };
    expect(input.tool_name).toBe("Bash");
  });

  it("HookOutput 型のオブジェクトが作成できること", () => {
    const output: HookOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        additionalContext: "テスト説明文",
      },
    };
    expect(output.hookSpecificOutput.permissionDecision).toBe("ask");
  });

  it("ParsedCommand 型のオブジェクトが作成できること", () => {
    const parsed: ParsedCommand = {
      raw: "rm -rf node_modules",
      commandName: "rm",
      subcommand: null,
      flags: ["-r", "-f"],
      args: ["node_modules"],
      hasChain: false,
      chainOperator: null,
      hasSudo: false,
    };
    expect(parsed.commandName).toBe("rm");
  });

  it("CommandEntry 型のオブジェクトが作成できること（flags, subcommands付き）", () => {
    const entry: CommandEntry = {
      name: "git",
      description: { ja: "Gitバージョン管理", en: "Git version control" },
      baseRisk: RiskLevel.Low,
      category: "git",
      flags: {
        "--force": {
          description: { ja: "強制実行", en: "Force" },
          riskModifier: RiskLevel.Critical,
        },
      },
      subcommands: {
        status: {
          description: { ja: "状態表示", en: "Show status" },
          riskOverride: RiskLevel.Low,
        },
      },
    };
    expect(entry.name).toBe("git");
  });

  it("CommandCategory の全7値が型チェックを通ること", () => {
    const categories: CommandCategory[] = [
      "filesystem",
      "git",
      "package",
      "network",
      "process",
      "system",
      "other",
    ];
    expect(categories).toHaveLength(7);
  });
});

// ============================================================
// Phase 2: Dictionary types (DictionaryLayer, DictionaryFile, LoaderResult, etc.)
// ============================================================

// P1: CommandCategory 型安全性
describe("CommandCategory — 11値の型チェック", () => {
  it("全11値が型チェックを通ること", () => {
    const categories: CommandCategory[] = [
      "filesystem",
      "text",
      "git",
      "package",
      "network",
      "process",
      "system",
      "container",
      "cloud",
      "shell",
      "other",
    ];
    expect(categories).toHaveLength(11);
  });

  it("新規追加の4値（text, container, cloud, shell）が含まれること", () => {
    const newCategories: CommandCategory[] = [
      "text",
      "container",
      "cloud",
      "shell",
    ];
    expect(newCategories).toHaveLength(4);
  });
});

// P2: 新型定義の正確性
describe("DictionaryLayer 型", () => {
  it("core, os, tools の3値が型チェックを通ること", () => {
    const layers: DictionaryLayer[] = ["core", "os", "tools"];
    expect(layers).toHaveLength(3);
  });
});

describe("SupportedLanguage 型", () => {
  it("ja, en の2値が型チェックを通ること", () => {
    const langs: SupportedLanguage[] = ["ja", "en"];
    expect(langs).toHaveLength(2);
  });
});

describe("DictionaryFile インターフェース", () => {
  it("必須フィールドを持つオブジェクトが作成できること", () => {
    const dictFile: DictionaryFile = {
      version: "2.0.0",
      metadata: {
        layer: "core",
        name: "test",
      },
      commands: {},
    };
    expect(dictFile.version).toBe("2.0.0");
    expect(dictFile.metadata.layer).toBe("core");
    expect(dictFile.metadata.name).toBe("test");
  });

  it("オプショナルフィールド（description, os）を含むオブジェクトが作成できること", () => {
    const dictFile: DictionaryFile = {
      version: "2.0.0",
      metadata: {
        layer: "os",
        name: "linux",
        description: "Linux commands",
        os: "linux",
      },
      commands: {},
    };
    expect(dictFile.metadata.description).toBe("Linux commands");
    expect(dictFile.metadata.os).toBe("linux");
  });

  it("commands に CommandEntry を格納できること", () => {
    const dictFile: DictionaryFile = {
      version: "2.0.0",
      metadata: { layer: "core", name: "test" },
      commands: {
        ls: {
          name: "ls",
          description: { ja: "一覧表示", en: "List files" },
          baseRisk: RiskLevel.Low,
          category: "filesystem",
        },
      },
    };
    expect(Object.keys(dictFile.commands)).toHaveLength(1);
    expect(dictFile.commands["ls"].category).toBe("filesystem");
  });
});

describe("LoaderResult インターフェース", () => {
  it("commands と metadata を持つオブジェクトが作成できること", () => {
    const result: LoaderResult = {
      commands: {},
      metadata: {
        totalCommands: 0,
        filesLoaded: 0,
        loadTimeMs: 5,
      },
    };
    expect(result.metadata.totalCommands).toBe(0);
    expect(result.metadata.filesLoaded).toBe(0);
    expect(result.metadata.loadTimeMs).toBe(5);
  });

  it("commands に複数の CommandEntry を格納できること", () => {
    const result: LoaderResult = {
      commands: {
        cmd1: {
          name: "cmd1",
          description: { ja: "コマンド1", en: "Command 1" },
          baseRisk: RiskLevel.Low,
          category: "text",
        },
        cmd2: {
          name: "cmd2",
          description: { ja: "コマンド2", en: "Command 2" },
          baseRisk: RiskLevel.High,
          category: "container",
        },
      },
      metadata: {
        totalCommands: 2,
        filesLoaded: 1,
        loadTimeMs: 3,
      },
    };
    expect(result.metadata.totalCommands).toBe(2);
    expect(Object.keys(result.commands)).toHaveLength(2);
  });
});

// ============================================================
// Phase 9: Formatter config types (RiskLabels, LanguageLabels, LayoutGroupId, FormatterConfig)
// ============================================================

// Scenario A-1: RiskLabels 型の構造検証 (P1)
describe("RiskLabels インターフェース", () => {
  it("label と short の2フィールドを持つオブジェクトが作成できること", () => {
    const labels: RiskLabels = {
      label: "低（読み取り専用）",
      short: "低",
    };
    expect(labels).toHaveProperty("label");
    expect(labels).toHaveProperty("short");
    expect(Object.keys(labels)).toHaveLength(2);
  });

  it("label は string 型であること", () => {
    const labels: RiskLabels = { label: "test", short: "t" };
    expect(typeof labels.label).toBe("string");
  });

  it("short は string 型であること", () => {
    const labels: RiskLabels = { label: "test", short: "t" };
    expect(typeof labels.short).toBe("string");
  });
});

// Scenario A-2: LanguageLabels 型の構造検証 (P2)
describe("LanguageLabels インターフェース", () => {
  const validLabels: LanguageLabels = {
    sectionHeader: "</>",
    riskLevel: "リスクレベル:",
    overallRiskLevel: "総合リスクレベル:",
    target: "対象:",
    unknownCommand: "未登録コマンド",
    unknownRiskSuffix: "中（不明）",
    chainNote: "注意",
    chainNoteSuffix: "。",
    risk: {
      low: { label: "低", short: "低" },
      medium: { label: "中", short: "中" },
      high: { label: "高", short: "高" },
      critical: { label: "最高", short: "最高" },
    },
  };

  it("9つの必須フィールドが存在すること", () => {
    const requiredFields = [
      "sectionHeader",
      "riskLevel",
      "overallRiskLevel",
      "target",
      "unknownCommand",
      "unknownRiskSuffix",
      "chainNote",
      "chainNoteSuffix",
      "risk",
    ];
    for (const field of requiredFields) {
      expect(validLabels).toHaveProperty(field);
    }
  });

  it("risk フィールドが Record<string, RiskLabels> 型であること", () => {
    expect(typeof validLabels.risk).toBe("object");
    for (const [, value] of Object.entries(validLabels.risk)) {
      expect(value).toHaveProperty("label");
      expect(value).toHaveProperty("short");
    }
  });

  it("全テキストフィールドが string 型であること", () => {
    const textFields: (keyof Omit<LanguageLabels, "risk">)[] = [
      "sectionHeader",
      "riskLevel",
      "overallRiskLevel",
      "target",
      "unknownCommand",
      "unknownRiskSuffix",
      "chainNote",
      "chainNoteSuffix",
    ];
    for (const field of textFields) {
      expect(typeof validLabels[field]).toBe("string");
    }
  });
});

// Scenario A-3: LayoutGroupId 型の値検証 (P3)
describe("LayoutGroupId 型", () => {
  const validIds: LayoutGroupId[] = [
    "sectionHeader",
    "commandDescription",
    "flagDescriptions",
    "targetArguments",
    "separator",
    "riskLevel",
    "overallRiskLevel",
    "chainNotice",
    "operatorDisplay",
  ];

  it("9つの有効な値が存在すること", () => {
    expect(validIds).toHaveLength(9);
  });

  it.each(validIds)("'%s' が有効な LayoutGroupId であること", (id) => {
    const assigned: LayoutGroupId = id;
    expect(assigned).toBe(id);
  });
});

// Scenario A-4: FormatterConfig 型の構造検証 (P4)
describe("FormatterConfig インターフェース", () => {
  const validConfig: FormatterConfig = {
    version: "1.0.0",
    emoji: {
      risk: { low: "🟢", medium: "🔶", high: "⚠️", critical: "🚨" },
      label: { riskLevel: "⚠️", chainNote: "ℹ️", unknownRisk: "🔶" },
      operator: { "&&": "━✅━▸", "||": "━❌━▸", "|": "━📤━▸", ";": "━━━▸" },
    },
    labels: {
      ja: {
        sectionHeader: "</>",
        riskLevel: "リスクレベル:",
        overallRiskLevel: "総合リスクレベル:",
        target: "対象:",
        unknownCommand: "未登録",
        unknownRiskSuffix: "中",
        chainNote: "注意",
        chainNoteSuffix: "。",
        risk: {
          low: { label: "低", short: "低" },
          medium: { label: "中", short: "中" },
          high: { label: "高", short: "高" },
          critical: { label: "最高", short: "最高" },
        },
      },
    },
    layout: {
      commandDelimiter: " — ",
      chainNumbering: "dot",
      detailedSingle: ["sectionHeader", "commandDescription"],
      detailedChainHeader: ["sectionHeader"],
      detailedChainSegment: ["commandDescription"],
      detailedChainFooter: ["separator"],
      compactTemplate: "[ShellSense {riskShort}] {commands}",
    },
  };

  it("version フィールドが string であること", () => {
    expect(typeof validConfig.version).toBe("string");
  });

  it("emoji は risk, label, operator の3セクションを持つこと", () => {
    expect(validConfig.emoji).toHaveProperty("risk");
    expect(validConfig.emoji).toHaveProperty("label");
    expect(validConfig.emoji).toHaveProperty("operator");
    expect(Object.keys(validConfig.emoji)).toHaveLength(3);
  });

  it("labels は Record<string, LanguageLabels> 型であること", () => {
    expect(typeof validConfig.labels).toBe("object");
    for (const [, langLabels] of Object.entries(validConfig.labels)) {
      expect(langLabels).toHaveProperty("sectionHeader");
      expect(langLabels).toHaveProperty("risk");
    }
  });

  it("layout は必須の7フィールドを持つこと", () => {
    const layoutFields = [
      "commandDelimiter",
      "chainNumbering",
      "detailedSingle",
      "detailedChainHeader",
      "detailedChainSegment",
      "detailedChainFooter",
      "compactTemplate",
    ];
    for (const field of layoutFields) {
      expect(validConfig.layout).toHaveProperty(field);
    }
  });

  it("layout の配列フィールドが LayoutGroupId[] であること", () => {
    expect(Array.isArray(validConfig.layout.detailedSingle)).toBe(true);
    expect(Array.isArray(validConfig.layout.detailedChainHeader)).toBe(true);
    expect(Array.isArray(validConfig.layout.detailedChainSegment)).toBe(true);
    expect(Array.isArray(validConfig.layout.detailedChainFooter)).toBe(true);
  });
});

// Scenario A-5: chainNumbering 型の許可値検証 (P5)
describe("chainNumbering 許可値", () => {
  const allowedValues: FormatterConfig["layout"]["chainNumbering"][] = [
    "dot",
    "circled",
    "keycap",
    "dingbat",
    "none",
  ];

  it("5つの許可値が存在すること", () => {
    expect(allowedValues).toHaveLength(5);
  });

  it.each(allowedValues)(
    "'%s' が有効な chainNumbering 値であること",
    (value) => {
      const config: Pick<FormatterConfig["layout"], "chainNumbering"> = {
        chainNumbering: value,
      };
      expect(config.chainNumbering).toBe(value);
    }
  );
});
