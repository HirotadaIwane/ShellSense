import { formatExplanation } from "../../src/formatter";
import { parse, parseChain } from "../../src/parser";
import { assessRisk } from "../../src/riskAssessor";
import { loadDictionary } from "../../src/dictionaryLoader";
import { getFormatterConfig } from "../../src/configLoader";
import type { SegmentData, CommandEntry } from "../../src/types";
import { RiskLevel } from "../../src/types";
import * as path from "path";

// --- dictionary ---

const dictDir = path.join(__dirname, "..", "..", "dictionary");
export const dictionary: Record<string, CommandEntry> = loadDictionary(dictDir).commands;

// --- segment builders ---

export function buildSegment(command: string): {
  segmentData: SegmentData[];
  operators: (string | null)[];
} {
  const parsed = parse(command);
  const entry = dictionary[parsed.commandName] ?? null;
  const risk = assessRisk(parsed, entry);
  return {
    segmentData: [{ parsed, entry, risk }],
    operators: [null],
  };
}

export function buildChainSegments(command: string): {
  segmentData: SegmentData[];
  operators: (string | null)[];
  overallRisk: RiskLevel;
} {
  const chain = parseChain(command);
  const segmentData: SegmentData[] = [];
  const operators: (string | null)[] = [];
  let overallRisk = RiskLevel.Low;

  for (const seg of chain.segments) {
    const entry = dictionary[seg.parsed.commandName] ?? null;
    const risk = assessRisk(seg.parsed, entry);
    segmentData.push({ parsed: seg.parsed, entry, risk });
    operators.push(seg.operator);

    const riskOrder = [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High, RiskLevel.Critical];
    if (riskOrder.indexOf(risk) > riskOrder.indexOf(overallRisk)) {
      overallRisk = risk;
    }
  }

  return { segmentData, operators, overallRisk };
}

// --- result builders ---

export function singleDetailedResult(
  command: string,
  language: "ja" | "en" = "ja",
): string {
  const { segmentData, operators } = buildSegment(command);
  return formatExplanation(segmentData, operators, segmentData[0].risk, {
    format: "detailed",
    language,
  });
}

export function chainDetailedResult(
  command: string,
  language: "ja" | "en" = "ja",
): string {
  const { segmentData, operators, overallRisk } = buildChainSegments(command);
  return formatExplanation(segmentData, operators, overallRisk, {
    format: "detailed",
    language,
  });
}

export function compactResult(
  command: string,
  language: "ja" | "en" = "ja",
): string {
  const { segmentData, operators } = buildSegment(command);
  return formatExplanation(segmentData, operators, segmentData[0].risk, {
    format: "compact",
    language,
  });
}

// --- output parsers ---

function collectRiskLabels(): string[] {
  const config = getFormatterConfig();
  const values = new Set<string>();
  for (const labels of Object.values(config.labels)) {
    values.add(labels.risk_low);
    values.add(labels.risk_medium);
    values.add(labels.risk_high);
    values.add(labels.risk_critical);
    values.add(labels.unknownRisk);
  }
  return [...values];
}

export function findRiskLine(output: string): string | undefined {
  const riskLabels = collectRiskLabels();
  const lines = output.split("\n");
  return lines.find(
    (l) => riskLabels.some((v) => l.includes(v)),
  );
}

export function findOverallRiskLine(output: string): string | undefined {
  const riskLabels = collectRiskLabels();
  const lines = output.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    if (riskLabels.some((v) => lines[i].includes(v))) {
      return lines[i];
    }
  }
  return undefined;
}

export function findFlagLines(output: string): string[] {
  return output.split("\n").filter((l) => l.match(/^\s+-\w.*:/));
}
