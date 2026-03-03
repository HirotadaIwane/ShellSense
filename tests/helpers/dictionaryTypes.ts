// ============================================================
// dictionaryTypes.ts — Dictionary test interfaces & utilities
// ============================================================
//
// These interfaces represent the raw JSON structure of dictionary files.
// They differ from src/types.ts types (e.g. baseRisk is string, not RiskLevel enum).
// The "Dict" prefix distinguishes them from the source types.

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// --- DictFlagEntry ---

export interface DictFlagEntry {
  description: { ja: string; en: string };
  riskModifier?: string;
}

// --- DictSubcommandEntry ---

export interface DictSubcommandEntry {
  description: { ja: string; en: string };
  riskOverride?: string;
  flags?: Record<string, DictFlagEntry>;
}

// --- DictCommandEntry ---

export interface DictCommandEntry {
  name: string;
  description: { ja: string; en: string };
  baseRisk: string;
  category: string;
  flags?: Record<string, DictFlagEntry>;
  subcommands?: Record<string, DictSubcommandEntry>;
}

// --- DictFile ---

export interface DictFile {
  version: string;
  metadata: {
    layer: string;
    name: string;
    description: string;
    os?: string;
  };
  commands: Record<string, DictCommandEntry>;
}

// --- loadCoreCommandNames ---

export function loadCoreCommandNames(): string[] {
  const coreDir = join(__dirname, "..", "..", "dictionary", "core");
  const names: string[] = [];
  for (const file of readdirSync(coreDir).filter((f) => f.endsWith(".json"))) {
    const data: DictFile = JSON.parse(
      readFileSync(join(coreDir, file), "utf-8"),
    );
    names.push(...Object.keys(data.commands));
  }
  return names;
}
