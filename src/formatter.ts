// ============================================================
// formatter.ts — ShellSense 統合説明生成エンジン
// ============================================================

import {
  RiskLevel,
  ParsedCommand,
  CommandEntry,
  SupportedLanguage,
  SegmentData,
  FormatOptions,
} from "./types";
import { getFormatterConfig } from "./configLoader";
import { renderTemplate, buildPlaceholderValues, formatChainNumber } from "./templateEngine";

// --- 公開 API ---

export function resolveCompoundSubcommand(
  parsed: ParsedCommand,
  entry: CommandEntry | null
): { subcommand: string | null; args: string[] } {
  if (!entry || !parsed.subcommand || !entry.subcommands) {
    return { subcommand: parsed.subcommand, args: parsed.args };
  }

  // 1. 単純サブコマンドで検索
  if (entry.subcommands[parsed.subcommand]) {
    return { subcommand: parsed.subcommand, args: parsed.args };
  }

  // 2. 複合サブコマンドで検索（subcommand + " " + args[0]）
  if (parsed.args.length > 0) {
    const compoundKey = `${parsed.subcommand} ${parsed.args[0]}`;
    if (entry.subcommands[compoundKey]) {
      return {
        subcommand: compoundKey,
        args: parsed.args.slice(1),
      };
    }
  }

  // 3. どちらにも見つからない場合はそのまま
  return { subcommand: parsed.subcommand, args: parsed.args };
}

export function formatExplanation(
  segments: SegmentData[],
  operators: (string | null)[],
  overallRisk: RiskLevel,
  options: FormatOptions
): string {
  if (options.format === "compact") {
    return formatCompact(segments, overallRisk, options.language);
  }

  if (segments.length === 1) {
    return formatDetailedSingle(segments[0], overallRisk, options.language);
  }
  return formatDetailedChain(segments, operators, overallRisk, options.language);
}

// --- compact 形式 ---

function formatCompact(
  segments: SegmentData[],
  overallRisk: RiskLevel,
  language: SupportedLanguage
): string {
  const config = getFormatterConfig();
  const labels = config.labels[language] ?? config.labels["en"];

  // {commands} を構築
  const commandParts: string[] = [];
  for (const { parsed, entry } of segments) {
    const sudoPrefix = parsed.hasSudo ? "sudo " : "";
    if (entry === null) {
      commandParts.push(`${sudoPrefix}${parsed.commandName}${labels.delimiter}?`);
    } else if (parsed.subcommand && entry.subcommands?.[parsed.subcommand]) {
      const desc = entry.subcommands[parsed.subcommand].description[language];
      commandParts.push(`${sudoPrefix}${parsed.commandName} ${parsed.subcommand}${labels.delimiter}${desc}`);
    } else {
      const desc = entry.description[language];
      commandParts.push(`${sudoPrefix}${parsed.commandName}${labels.delimiter}${desc}`);
    }
  }
  const commands = commandParts.join(" | ");

  // テンプレート選択
  const template = segments.length === 1
    ? config.templates_short.singleCommand
    : config.templates_short.chainCommand;

  // {risk} を解決（isShort: true）
  const values = buildPlaceholderValues(
    labels, segments[0].parsed, segments[0].entry,
    overallRisk, language, { isShort: true }
  );

  // {commands} をマージしてテンプレート展開
  return renderTemplate(template, { ...values, commands });
}

// --- detailed 形式（単一コマンド） ---

function formatDetailedSingle(
  segment: SegmentData,
  risk: RiskLevel,
  language: SupportedLanguage
): string {
  const config = getFormatterConfig();
  const labels = config.labels[language] ?? config.labels["en"];
  const { parsed, entry } = segment;

  const values = buildPlaceholderValues(labels, parsed, entry, risk, language);
  return renderTemplate(config.templates_long.singleCommand, values);
}

// --- detailed 形式（チェーンコマンド） ---

function formatDetailedChain(
  segments: SegmentData[],
  operators: (string | null)[],
  overallRisk: RiskLevel,
  language: SupportedLanguage
): string {
  const config = getFormatterConfig();
  const labels = config.labels[language] ?? config.labels["en"];
  const parts: string[] = [];

  // Header
  const headerValues = buildPlaceholderValues(
    labels, segments[0].parsed, segments[0].entry,
    overallRisk, language, { isChain: true }
  );
  parts.push(renderTemplate(config.templates_long.chainHeader, headerValues));

  // 各セグメント
  for (let i = 0; i < segments.length; i++) {
    const { parsed, entry } = segments[i];
    const segValues = buildPlaceholderValues(
      labels, parsed, entry, overallRisk, language,
      { chainNumber: i + 1, isChain: true }
    );
    parts.push(renderTemplate(config.templates_long.chainSegment, segValues));

    // 演算子（次セグメントがある場合）
    if (i + 1 < segments.length && operators[i + 1]) {
      const opValues = buildPlaceholderValues(
        labels, parsed, entry, overallRisk, language,
        { operator: operators[i + 1]! }
      );
      parts.push(renderTemplate(config.templates_long.chainOperator, opValues));
    }
  }

  // Footer
  const footerValues = buildPlaceholderValues(
    labels, segments[0].parsed, segments[0].entry,
    overallRisk, language
  );
  parts.push(renderTemplate(config.templates_long.chainFooter, footerValues));

  return parts.join("\n");
}
