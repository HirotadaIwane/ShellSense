// ============================================================
// configLoader.ts — formatter config の読み込み・キャッシュ
// ============================================================

import * as fs from "fs";
import * as path from "path";
import type { FormatterConfig, StyleOptions, DeepPartial } from "./types";

let cachedConfig: FormatterConfig | null = null;

/** Hardcoded fallback config (used when style files cannot be loaded) */
export function getDefaultConfig(): FormatterConfig {
  return {
    version: "2.0.0",
    templates_long: {
      singleCommand: "{header}\n{command}\n{flags}\n{target}\n{sudo}\n{separator}\n{risk}",
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
      ja: {
        header: "---",
        risk_low: "低（読み取り専用）",
        risk_low_short: "低",
        risk_medium: "中（ファイルの変更を含む）",
        risk_medium_short: "中",
        risk_high: "高（削除・上書きを含む）",
        risk_high_short: "高",
        risk_critical: "最高（システムレベルの変更・不可逆操作）",
        risk_critical_short: "最高",
        unknownRisk: "中（不明なコマンドのため注意してください）",
        unknownRisk_short: "中",
        unknownCommand: "このコマンドはShellSenseの辞書に未登録です",
        target: "対象:",
        delimiter: " -- ",
        indent: "  ",
        chainNotice: "注意: このコマンドは複数のコマンドが連結されています",
        chainNumbering: "dot",
        sudoNotice: "sudo: 管理者権限で実行されます（リスクが昇格します）",
        "operator_&&": "-->>",
        "operator_||": "--X>",
        "operator_|": "--|>",
        "operator_;": "--->",
      },
      en: {
        header: "---",
        risk_low: "Low (read-only)",
        risk_low_short: "Low",
        risk_medium: "Medium (may modify files)",
        risk_medium_short: "Medium",
        risk_high: "High (may delete or overwrite)",
        risk_high_short: "High",
        risk_critical: "Critical (system-level or irreversible)",
        risk_critical_short: "Critical",
        unknownRisk: "Medium (unknown command, use with caution)",
        unknownRisk_short: "Medium",
        unknownCommand: "This command is not registered in the ShellSense dictionary",
        target: "Target:",
        delimiter: " -- ",
        indent: "  ",
        chainNotice: "Note: This command consists of multiple chained commands",
        chainNumbering: "dot",
        sudoNotice: "sudo: Running with elevated privileges (risk escalated)",
        "operator_&&": "-->>",
        "operator_||": "--X>",
        "operator_|": "--|>",
        "operator_;": "--->",
      },
    },
  };
}

/** 明示的にパスを渡して初期化（extension.ts の activate() から呼ぶ） */
export function initFormatterConfig(
  configDir: string,
  options?: StyleOptions
): void {
  try {
    const styleName = options?.style ?? "emoji";
    const stylePath = path.join(configDir, "styles", `${styleName}.json`);
    const raw = fs.readFileSync(stylePath, "utf8");
    let config = JSON.parse(raw) as FormatterConfig;

    if (options?.overrides && Object.keys(options.overrides).length > 0) {
      config = deepMerge(config, options.overrides);
    }

    cachedConfig = config;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`[ShellSense] configLoader: failed to load config: ${msg}\n`);
    cachedConfig = getDefaultConfig();
  }
}

/** config 取得。未初期化時は自動検出 */
export function getFormatterConfig(): FormatterConfig {
  if (!cachedConfig) {
    try {
      // esbuild バンドル: __dirname/config/, tsc 出力: __dirname/../config/
      const configDir = fs.existsSync(path.join(__dirname, "config", "styles"))
        ? path.join(__dirname, "config")
        : path.join(__dirname, "..", "config");
      initFormatterConfig(configDir);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`[ShellSense] configLoader: failed to auto-detect config: ${msg}\n`);
      cachedConfig = getDefaultConfig();
    }
  }
  return cachedConfig!;
}

/** テスト用: config オブジェクトを直接設定 */
export function setFormatterConfig(config: FormatterConfig): void {
  cachedConfig = config;
}

/** テスト用: キャッシュクリア */
export function resetFormatterConfig(): void {
  cachedConfig = null;
}

/** deep merge: オブジェクト再帰、配列全置換、プリミティブ上書き */
function deepMerge<T>(base: T, override: DeepPartial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  const overrideObj = override as Record<string, unknown>;
  for (const key of Object.keys(overrideObj)) {
    const overrideVal = overrideObj[key];
    if (overrideVal === undefined) continue;

    const baseVal = result[key];
    if (
      typeof baseVal === "object" && baseVal !== null && !Array.isArray(baseVal) &&
      typeof overrideVal === "object" && overrideVal !== null && !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(baseVal, overrideVal);
    } else {
      result[key] = overrideVal;
    }
  }
  return result as T;
}
