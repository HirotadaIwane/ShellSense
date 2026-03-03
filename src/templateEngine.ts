// ============================================================
// templateEngine.ts — テンプレート展開エンジン
// ============================================================

import {
  type TemplateLabels,
  type ParsedCommand,
  type CommandEntry,
  RiskLevel,
  type SupportedLanguage,
} from "./types";
const PLACEHOLDER_RE = /\{([^}]+)\}/g;
const SEPARATOR_PATTERN = /^\s*\{separator\}\s*$/;

// --- chainNumbering ---

const DIGIT_MAP: Record<string, string[]> = {
  circled: ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"],
  dingbat: ["⓪", "➊", "➋", "➌", "➍", "➎", "➏", "➐", "➑", "➒"],
};

export function formatChainNumber(n: number, style: string): string {
  switch (style) {
    case "none":
      return "";
    case "dot":
      return `${n}. `;
    case "keycap":
      return [...String(n)].map((d) => `${d}\uFE0F\u20E3`).join("") + " ";
    default: {
      const map = DIGIT_MAP[style];
      if (!map) return `${n}. `;
      return [...String(n)].map((d) => map[Number(d)]).join("") + " ";
    }
  }
}

export function renderTemplate(
  template: string,
  values: Record<string, string | string[]>
): string {
  const lines = template.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    // separator 行は空行として保持
    if (SEPARATOR_PATTERN.test(line)) {
      result.push("");
      continue;
    }

    // 行内のプレースホルダーを検出し、string[] があるかチェック
    const placeholders = [...line.matchAll(PLACEHOLDER_RE)];

    // string[] 値による複数行展開
    // 行全体が単一プレースホルダーのみで、その値が string[] の場合に展開
    if (placeholders.length === 1) {
      const key = placeholders[0][1];
      const val = values[key];
      if (Array.isArray(val)) {
        if (val.length > 0) {
          for (const item of val) {
            result.push(item);
          }
        }
        // 空配列は行ごと除去（何も追加しない）
        continue;
      }
    }

    // 通常のプレースホルダー置換
    const replaced = line.replace(PLACEHOLDER_RE, (match, key: string) => {
      const val = values[key];
      if (val === undefined) return match;
      if (Array.isArray(val)) return val.join("\n");
      return val;
    });

    // 空行除去: 置換後に空文字 or 空白のみ → 除去
    if (replaced.trim() === "") {
      continue;
    }

    result.push(replaced);
  }

  return result.join("\n");
}

// ============================================================
// buildPlaceholderValues — プレースホルダー値 Map 構築
// ============================================================

function resolveRiskLabel(
  labels: TemplateLabels,
  risk: RiskLevel,
  isUnknown: boolean,
  isShort: boolean
): string {
  if (isUnknown) {
    if (isShort && labels.unknownRisk_short) return labels.unknownRisk_short;
    return labels.unknownRisk;
  }
  const baseKey = `risk_${risk}` as keyof TemplateLabels;
  const shortKey = `risk_${risk}_short` as keyof TemplateLabels;
  if (isShort && labels[shortKey]) return labels[shortKey] as string;
  return labels[baseKey] as string;
}

export function buildPlaceholderValues(
  labels: TemplateLabels,
  parsed: ParsedCommand,
  entry: CommandEntry | null,
  risk: RiskLevel,
  language: SupportedLanguage,
  options?: {
    isShort?: boolean;
    chainNumber?: number;
    operator?: string;
    isChain?: boolean;
  }
): Record<string, string | string[]> {
  const isShort = options?.isShort ?? false;
  const isUnknown = entry === null;

  // --- command ---
  const sudoPrefix = parsed.hasSudo ? "sudo " : "";
  const chainPrefix = options?.chainNumber
    ? formatChainNumber(options.chainNumber, labels.chainNumbering)
    : "";

  let command: string;
  if (isUnknown) {
    command = `${chainPrefix}${sudoPrefix}${parsed.commandName}${labels.delimiter}${labels.unknownCommand}`;
  } else if (parsed.subcommand && entry.subcommands?.[parsed.subcommand]) {
    const sub = entry.subcommands[parsed.subcommand];
    command = `${chainPrefix}${sudoPrefix}${parsed.commandName} ${parsed.subcommand}${labels.delimiter}${sub.description[language]}`;
  } else {
    command = `${chainPrefix}${sudoPrefix}${parsed.commandName}${labels.delimiter}${entry.description[language]}`;
  }

  // --- flags ---
  const subEntry = parsed.subcommand
    ? entry?.subcommands?.[parsed.subcommand]
    : undefined;
  const flags: string[] = [];
  if (!isUnknown) {
    for (const flag of parsed.flags) {
      const flagEntry = subEntry?.flags?.[flag] ?? entry?.flags?.[flag];
      if (flagEntry) {
        flags.push(
          `${labels.indent}${flag}: ${flagEntry.description[language]}`
        );
      }
    }
  }

  // --- target ---
  const target =
    parsed.args.length > 0
      ? `${labels.indent}${labels.target} ${parsed.args.join(", ")}`
      : "";

  // --- sudo ---
  const sudo = parsed.hasSudo
    ? `${labels.indent}${labels.sudoNotice}`
    : "";

  // --- risk / overallRisk ---
  const riskLabel = resolveRiskLabel(labels, risk, isUnknown, isShort);

  // --- operator ---
  const operatorKey = `operator_${options?.operator}` as keyof TemplateLabels;
  const operator = options?.operator
    ? ((labels[operatorKey] as string) ?? "")
    : "";

  // --- chainNotice ---
  const chainNotice = options?.isChain ? labels.chainNotice : "";

  return {
    header: labels.header,
    command,
    flags,
    target,
    sudo,
    risk: riskLabel,
    overallRisk: riskLabel,
    operator,
    chainNotice,
    separator: "",
  };
}
