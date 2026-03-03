// ============================================================
// types.ts — ShellSense 共通型定義
// ============================================================

// --- RiskLevel ---

export enum RiskLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

// --- CommandCategory ---

export type CommandCategory =
  | "filesystem"
  | "text"
  | "git"
  | "package"
  | "network"
  | "process"
  | "system"
  | "container"
  | "cloud"
  | "shell"
  | "other";

// --- FlagEntry ---

export interface FlagEntry {
  description: {
    ja: string;
    en: string;
  };
  riskModifier?: RiskLevel;
}

// --- SubcommandEntry ---

export interface SubcommandEntry {
  description: {
    ja: string;
    en: string;
  };
  riskOverride?: RiskLevel;
  flags?: Record<string, FlagEntry>;
}

// --- CommandEntry ---

export interface CommandEntry {
  name: string;
  description: {
    ja: string;
    en: string;
  };
  baseRisk: RiskLevel;
  category: CommandCategory;
  flags?: Record<string, FlagEntry>;
  subcommands?: Record<string, SubcommandEntry>;
}

// --- ParsedCommand ---

export interface ParsedCommand {
  raw: string;
  commandName: string;
  subcommand: string | null;
  flags: string[];
  args: string[];
  hasChain: boolean;
  chainOperator: string | null;
  hasSudo: boolean;
}

// --- ChainSegment ---

export interface ChainSegment {
  parsed: ParsedCommand;
  operator: string | null;
}

// --- ParsedChain ---

export interface ParsedChain {
  raw: string;
  segments: ChainSegment[];
  isChain: boolean;
}

// --- DictionaryLayer ---

export type DictionaryLayer = "core" | "os" | "tools";

// --- SupportedLanguage ---

export type SupportedLanguage = "ja" | "en";

// --- DictionaryFile ---

export interface DictionaryFile {
  version: string;
  metadata: {
    layer: DictionaryLayer;
    name: string;
    description?: string;
    os?: "linux" | "macos" | "windows";
  };
  commands: Record<string, CommandEntry>;
}

// --- LoaderResult ---

export interface LoaderResult {
  commands: Record<string, CommandEntry>;
  metadata: {
    totalCommands: number;
    filesLoaded: number;
    loadTimeMs: number;
  };
}

// --- SegmentData ---

export interface SegmentData {
  parsed: ParsedCommand;
  entry: CommandEntry | null;
  risk: RiskLevel;
}

// --- ExplanationFormat ---

export type ExplanationFormat = "detailed" | "compact";

// --- FormatOptions ---

export interface FormatOptions {
  format: ExplanationFormat;
  language: SupportedLanguage;
}

// --- HookInput ---

export interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: "PreToolUse";
  tool_name: string;
  tool_input: {
    command: string;
    description?: string;
    timeout?: number;
  };
}

// --- HookOutput ---

export interface HookOutput {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    permissionDecision: "allow" | "deny" | "ask";
    additionalContext?: string;
  };
}

// --- DeepPartial ---

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// --- FormatterConfig types ---

export interface FormatterConfig {
  version: string;
  templates_long: {
    singleCommand: string;
    chainHeader: string;
    chainSegment: string;
    chainOperator: string;
    chainFooter: string;
  };
  templates_short: {
    singleCommand: string;
    chainCommand: string;
  };
  labels: Record<string, TemplateLabels>;
}

// --- TemplateLabels ---

export interface TemplateLabels {
  header: string;

  risk_low: string;
  risk_low_short: string;
  risk_medium: string;
  risk_medium_short: string;
  risk_high: string;
  risk_high_short: string;
  risk_critical: string;
  risk_critical_short: string;

  unknownRisk: string;
  unknownRisk_short: string;
  unknownCommand: string;

  target: string;
  delimiter: string;
  indent: string;
  chainNotice: string;
  chainNumbering: string;
  sudoNotice: string;

  [key: `operator_${string}`]: string;
}

// --- StyleOptions ---

export interface StyleOptions {
  style?: string;
  overrides?: DeepPartial<FormatterConfig>;
}
