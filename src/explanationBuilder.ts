// ============================================================
// explanationBuilder.ts — ShellSense 説明テキスト生成（後方互換ラッパー）
// Phase 6 で formatter.ts に統合。既存 API を維持するためのラッパー。
// ============================================================

import {
  RiskLevel,
  ParsedCommand,
  CommandEntry,
  SupportedLanguage,
} from "./types";
import { formatExplanation } from "./formatter";

// --- 公開 API（シグネチャ変更なし） ---

export function buildExplanation(
  parsed: ParsedCommand,
  entry: CommandEntry | null,
  risk: RiskLevel,
  language: SupportedLanguage = "ja"
): string {
  return formatExplanation(
    [{ parsed, entry, risk }],
    [null],
    risk,
    { format: "detailed", language }
  );
}

export function buildChainExplanation(
  segments: {
    parsed: ParsedCommand;
    entry: CommandEntry | null;
    risk: RiskLevel;
  }[],
  operators: (string | null)[],
  overallRisk: RiskLevel,
  language: SupportedLanguage = "ja"
): string {
  return formatExplanation(segments, operators, overallRisk, {
    format: "detailed",
    language,
  });
}
