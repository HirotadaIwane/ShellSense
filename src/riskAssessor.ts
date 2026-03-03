// ============================================================
// riskAssessor.ts — ShellSense リスク評価エンジン
// ============================================================

import { RiskLevel, ParsedCommand, CommandEntry } from "./types";

export const RISK_ORDER: Record<RiskLevel, number> = {
  [RiskLevel.Low]: 0,
  [RiskLevel.Medium]: 1,
  [RiskLevel.High]: 2,
  [RiskLevel.Critical]: 3,
};

export function maxRisk(...levels: RiskLevel[]): RiskLevel {
  let max = RiskLevel.Low;
  for (const level of levels) {
    if (RISK_ORDER[level] > RISK_ORDER[max]) {
      max = level;
    }
  }
  return max;
}

export function meetsMinRisk(risk: RiskLevel, minRisk: RiskLevel): boolean {
  return RISK_ORDER[risk] >= RISK_ORDER[minRisk];
}

// --- 公開 API ---

export function assessRisk(
  parsed: ParsedCommand,
  entry: CommandEntry | null
): RiskLevel {
  // 未知コマンド → medium
  if (entry === null) {
    return RiskLevel.Medium;
  }

  // 1. ベースリスクの取得
  let baseRisk = entry.baseRisk;
  if (
    parsed.subcommand &&
    entry.subcommands &&
    entry.subcommands[parsed.subcommand]
  ) {
    const sub = entry.subcommands[parsed.subcommand];
    if (sub.riskOverride) {
      baseRisk = sub.riskOverride;
    }
  }

  // 2. フラグリスクの取得（2段階解決: サブコマンドflags → コマンドflags）
  let flagRisk = RiskLevel.Low;
  const subEntry = parsed.subcommand ? entry.subcommands?.[parsed.subcommand] : undefined;
  for (const flag of parsed.flags) {
    const flagEntry = subEntry?.flags?.[flag] ?? entry.flags?.[flag];
    if (flagEntry?.riskModifier) {
      flagRisk = maxRisk(flagRisk, flagEntry.riskModifier);
    }
  }

  // 3. 特殊ルール（sudo 段階的昇格）
  let specialRisk = RiskLevel.Low;
  if (parsed.hasSudo) {
    const preRisk = maxRisk(baseRisk, flagRisk);
    if (RISK_ORDER[preRisk] >= RISK_ORDER[RiskLevel.High]) {
      specialRisk = RiskLevel.Critical;
    } else {
      specialRisk = RiskLevel.High;
    }
  }

  // 4. 最終リスク
  return maxRisk(baseRisk, flagRisk, specialRisk);
}
