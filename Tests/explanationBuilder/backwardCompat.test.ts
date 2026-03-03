import { describe, it, expect } from "vitest";
import { makeParsed, makeEntry } from "../helpers/factories";
import {
  buildExplanation,
  buildChainExplanation,
} from "../../src/explanationBuilder";
import { getFormatterConfig } from "../../src/configLoader";
import { RiskLevel } from "../../src/types";

function labels(lang: "ja" | "en" = "ja") {
  return getFormatterConfig().labels[lang];
}

// --- モック辞書エントリ ---

const lsEntry = makeEntry({
  name: "ls",
  description: {
    ja: "ファイルやフォルダの一覧を表示します",
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
  },
});

const rmEntry = makeEntry({
  name: "rm",
  description: {
    ja: "ファイルやフォルダを削除します",
    en: "Remove files or directories",
  },
  baseRisk: RiskLevel.High,
  category: "filesystem",
  flags: {
    "-r": {
      description: {
        ja: "フォルダの中身も含めて再帰的に削除",
        en: "Remove recursively",
      },
      riskModifier: RiskLevel.High,
    },
    "-f": {
      description: {
        ja: "確認なしで強制削除",
        en: "Force removal",
      },
      riskModifier: RiskLevel.High,
    },
  },
});

// ============================================================
// Scenario 14: 後方互換 — buildExplanation (P14)
// language 引数なしで日本語出力を確認
// ============================================================
describe("Scenario 14: 後方互換 — buildExplanation", () => {
  it("テンプレートに{header}がある場合、日本語headerが出力されること", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    if (templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });

  it("language 引数なしで entry.description.ja が使用されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).toContain(
      `ls${l.delimiter}ファイルやフォルダの一覧を表示します`
    );
  });

  it("language 引数なしで日本語リスクラベルが出力されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).toContain(l.risk_low);
  });

  it("language 引数なしでフラグの日本語説明が使用されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).toContain(`${l.indent}-l: 詳細情報を表示`);
  });

  it("language 引数なしで未知コマンドが日本語で出力されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "unknowncmd" });
    const result = buildExplanation(parsed, null, RiskLevel.Medium);
    expect(result).toContain(l.unknownCommand);
  });
});

// ============================================================
// Scenario 15: 後方互換 — buildChainExplanation (P15)
// language 引数なしで日本語出力を確認
// ============================================================
describe("Scenario 15: 後方互換 — buildChainExplanation", () => {
  it("テンプレートに{header}がある場合、日本語headerが出力されること", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const result = buildChainExplanation(
      [
        {
          parsed: makeParsed({ commandName: "ls" }),
          entry: lsEntry,
          risk: RiskLevel.Low,
        },
        {
          parsed: makeParsed({
            commandName: "rm",
            flags: ["-r"],
            args: ["foo"],
          }),
          entry: rmEntry,
          risk: RiskLevel.High,
        },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    const chainTemplates = [
      templates_long.chainHeader,
      templates_long.chainSegment,
      templates_long.chainFooter,
    ].join("\n");
    if (chainTemplates.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });

  it("language 引数なしで日本語演算子ラベルであること", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        {
          parsed: makeParsed({ commandName: "ls" }),
          entry: lsEntry,
          risk: RiskLevel.Low,
        },
        {
          parsed: makeParsed({
            commandName: "rm",
            flags: ["-r"],
            args: ["foo"],
          }),
          entry: rmEntry,
          risk: RiskLevel.High,
        },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    expect(result).toContain(l["operator_&&"]);
  });

  it("language 引数なしで日本語総合リスクラベルが出力されること", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        {
          parsed: makeParsed({ commandName: "ls" }),
          entry: lsEntry,
          risk: RiskLevel.Low,
        },
        {
          parsed: makeParsed({
            commandName: "rm",
            flags: ["-r"],
            args: ["foo"],
          }),
          entry: rmEntry,
          risk: RiskLevel.High,
        },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    expect(result).toContain(l.risk_high);
    expect(result).not.toContain("総合リスクレベル:");
  });
});
