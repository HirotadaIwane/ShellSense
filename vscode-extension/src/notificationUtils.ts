// ============================================================
// notificationUtils.ts — re-export from unified modules
// Phase 6: ロジックを src/formatter.ts と src/riskAssessor.ts に統合
// ============================================================

import { RiskLevel, SupportedLanguage, SegmentData } from '../../src/types';
import { formatExplanation } from '../../src/formatter';
import { getFormatterConfig } from '../../src/configLoader';

export { SegmentData } from '../../src/types';
export { RISK_ORDER, meetsMinRisk } from '../../src/riskAssessor';
export { resolveCompoundSubcommand } from '../../src/formatter';

// --- 後方互換ラッパー ---

function buildRiskLabel(): Record<RiskLevel, Record<SupportedLanguage, string>> {
  const config = getFormatterConfig();
  const result = {} as Record<RiskLevel, Record<SupportedLanguage, string>>;
  for (const level of Object.values(RiskLevel)) {
    result[level] = {} as Record<SupportedLanguage, string>;
    for (const [lang, labels] of Object.entries(config.labels)) {
      const shortKey = `risk_${level}_short` as keyof typeof labels;
      result[level][lang as SupportedLanguage] =
        (labels[shortKey] as string) ?? "";
    }
  }
  return result;
}

export const RISK_LABEL = buildRiskLabel();

export function formatNotification(
  segments: SegmentData[],
  overallRisk: RiskLevel,
  language: SupportedLanguage
): string {
  const operators = segments.map(() => null);
  return formatExplanation(segments, operators, overallRisk, {
    format: 'compact',
    language,
  });
}
