// ============================================================
// factories.ts — Shared test factory functions
// ============================================================

import {
  ParsedCommand,
  CommandEntry,
  RiskLevel,
  TemplateLabels,
  FormatterConfig,
} from "../../src/types";

// --- makeParsed ---

export function makeParsed(
  overrides?: Partial<ParsedCommand>,
): ParsedCommand {
  return {
    raw: "",
    commandName: "",
    subcommand: null,
    flags: [],
    args: [],
    hasChain: false,
    chainOperator: null,
    hasSudo: false,
    ...overrides,
  };
}

// --- makeEntry ---

export function makeEntry(
  overrides?: Partial<CommandEntry>,
): CommandEntry {
  return {
    name: "test",
    description: { ja: "テスト", en: "test" },
    baseRisk: RiskLevel.Low,
    category: "other",
    ...overrides,
  };
}

// --- Pre-defined entries (matching actual dictionary data) ---

export const entries = {
  ls: makeEntry({
    name: "ls",
    description: {
      ja: "ファイルやフォルダの一覧を表示",
      en: "List directory contents",
    },
    baseRisk: RiskLevel.Low,
    category: "filesystem",
    flags: {
      "-l": {
        description: { ja: "詳細情報を表示", en: "Long listing format" },
      },
      "-a": {
        description: { ja: "隠しファイルも表示", en: "Show hidden files" },
      },
      "-R": {
        description: {
          ja: "サブフォルダも再帰的に表示",
          en: "List subdirectories recursively",
        },
      },
    },
  }),

  rm: makeEntry({
    name: "rm",
    description: {
      ja: "ファイルやフォルダを削除",
      en: "Remove files or directories",
    },
    baseRisk: RiskLevel.High,
    category: "filesystem",
    flags: {
      "-r": {
        description: {
          ja: "フォルダの中身も含めて再帰的に削除",
          en: "Remove directories and their contents recursively",
        },
        riskModifier: RiskLevel.High,
      },
      "-f": {
        description: {
          ja: "確認なしで強制削除",
          en: "Force removal without confirmation",
        },
        riskModifier: RiskLevel.High,
      },
      "-i": {
        description: {
          ja: "削除前に確認を求める",
          en: "Prompt before every removal",
        },
      },
    },
  }),

  git: makeEntry({
    name: "git",
    description: {
      ja: "Gitバージョン管理システムを操作",
      en: "Git version control system",
    },
    baseRisk: RiskLevel.Low,
    category: "git",
    subcommands: {
      status: {
        description: { ja: "リポジトリの状態を表示", en: "Show working tree status" },
        riskOverride: RiskLevel.Low,
      },
      push: {
        description: { ja: "リモートにプッシュ", en: "Push to remote" },
        riskOverride: RiskLevel.Medium,
      },
    },
  }),

  cd: makeEntry({
    name: "cd",
    description: {
      ja: "作業ディレクトリを移動",
      en: "Change the current directory",
    },
    baseRisk: RiskLevel.Low,
    category: "shell",
  }),

  pwd: makeEntry({
    name: "pwd",
    description: {
      ja: "現在の作業ディレクトリを表示",
      en: "Print the current working directory",
    },
    baseRisk: RiskLevel.Low,
    category: "shell",
  }),

  cat: makeEntry({
    name: "cat",
    description: {
      ja: "ファイルの内容を表示",
      en: "Concatenate and print files",
    },
    baseRisk: RiskLevel.Low,
    category: "filesystem",
    flags: {
      "-n": {
        description: {
          ja: "行番号を表示",
          en: "Number all output lines",
        },
      },
    },
  }),
} as const;

// --- makeLabels ---

export function makeLabels(
  overrides?: Partial<TemplateLabels>,
): TemplateLabels {
  return {
    header: "</>",
    risk_low: "🟢 低（読み取り専用）",
    risk_low_short: "🟢 低",
    risk_medium: "🔶 中（ファイルの変更を含む）",
    risk_medium_short: "🔶 中",
    risk_high: "⚠️ 高（削除・上書きを含む）",
    risk_high_short: "⚠️ 高",
    risk_critical: "🚨 最高（システムレベルの変更・不可逆操作）",
    risk_critical_short: "🚨 最高",
    unknownRisk: "🔶 中（不明なコマンドのため注意してください）",
    unknownRisk_short: "🔶 中",
    unknownCommand: "このコマンドはShellSenseの辞書に未登録です",
    target: "対象:",
    delimiter: " — ",
    indent: "  ",
    chainNotice: "ℹ️ 注意: このコマンドは複数のコマンドが連結されています",
    chainNumbering: "dot",
    sudoNotice:
      "sudo: 管理者権限で実行されます（リスクが昇格します）",
    "operator_&&": "━✅━▸",
    "operator_||": "━❌━▸",
    "operator_|": "━📤━▸",
    "operator_;": "━━━▸",
    ...overrides,
  };
}

// --- makeConfig ---

export function makeConfig(
  overrides?: Partial<FormatterConfig>,
): FormatterConfig {
  return {
    version: "2.0.0",
    templates_long: {
      singleCommand:
        "{header}\n{command}\n{flags}\n{target}\n{sudo}\n{separator}\n{risk}",
      chainHeader: "{header}",
      chainSegment: "{command}\n{flags}\n{target}\n{sudo}",
      chainOperator: "  {operator}",
      chainFooter: "{separator}\n{overallRisk}",
    },
    templates_short: {
      singleCommand: "[ShellSense {risk}] {commands}",
      chainCommand: "[ShellSense {risk}] {commands}",
    },
    labels: {
      ja: makeLabels(),
      en: makeLabels({
        header: "</>",
        risk_low: "🟢 Low (read-only)",
        risk_low_short: "🟢 Low",
        risk_medium: "🔶 Medium (may modify files)",
        risk_medium_short: "🔶 Medium",
        risk_high: "⚠️ High (may delete or overwrite)",
        risk_high_short: "⚠️ High",
        risk_critical: "🚨 Critical (system-level or irreversible)",
        risk_critical_short: "🚨 Critical",
        unknownRisk: "🔶 Medium (unknown command, use with caution)",
        unknownRisk_short: "🔶 Medium",
        unknownCommand:
          "This command is not registered in the ShellSense dictionary",
        target: "Target:",
        chainNotice:
          "ℹ️ Note: This command consists of multiple chained commands",
        sudoNotice:
          "sudo: Running with elevated privileges (risk escalated)",
      }),
    },
    ...overrides,
  };
}

// --- makeInput ---

export function makeInput(command: string, toolName = "Bash"): string {
  return JSON.stringify({
    tool_name: toolName,
    tool_input: { command },
    hook_event_name: "PreToolUse",
    session_id: "test-session",
    transcript_path: "",
    cwd: ".",
  });
}
