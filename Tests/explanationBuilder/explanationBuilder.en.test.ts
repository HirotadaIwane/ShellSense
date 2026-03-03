import { describe, it, expect } from "vitest";
import { makeParsed, makeEntry } from "../helpers/factories";
import {
  buildExplanation,
  buildChainExplanation,
} from "../../src/explanationBuilder";
import { getFormatterConfig } from "../../src/configLoader";
import { RiskLevel } from "../../src/types";

function labels(lang: "ja" | "en" = "en") {
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
      description: {
        ja: "詳細情報を表示",
        en: "Use a long listing format",
      },
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
        en: "Remove directories and their contents recursively",
      },
      riskModifier: RiskLevel.High,
    },
    "-f": {
      description: {
        ja: "確認なしで強制削除",
        en: "Force removal without confirmation",
      },
      riskModifier: RiskLevel.High,
    },
  },
});

const gitEntry = makeEntry({
  name: "git",
  description: {
    ja: "Gitバージョン管理システムを操作します",
    en: "Git version control system",
  },
  baseRisk: RiskLevel.Low,
  category: "git",
  subcommands: {
    commit: {
      description: {
        ja: "変更をリポジトリに記録する",
        en: "Record changes to the repository",
      },
    },
  },
  flags: {
    "-m": {
      description: {
        ja: "コミットメッセージを指定",
        en: "Use the given message as the commit message",
      },
    },
  },
});

const cpEntry = makeEntry({
  name: "cp",
  description: {
    ja: "ファイルやフォルダをコピーします",
    en: "Copy files and directories",
  },
  baseRisk: RiskLevel.Medium,
  category: "filesystem",
});

const chmodEntry = makeEntry({
  name: "chmod",
  description: {
    ja: "ファイルのアクセス権限を変更します",
    en: "Change file mode bits",
  },
  baseRisk: RiskLevel.Critical,
  category: "system",
});

// ============================================================
// Scenario 5: 英語セクションヘッダー (P5)
// ============================================================
describe("Scenario 5: 英語セクションヘッダー", () => {
  it("buildExplanation で英語セクションヘッダーが出力されること", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    if (templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });

  it("buildChainExplanation で英語セクションヘッダーが出力されること", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const result = buildChainExplanation(
      [
        {
          parsed: makeParsed({ commandName: "ls" }),
          entry: lsEntry,
          risk: RiskLevel.Low,
        },
      ],
      [null],
      RiskLevel.Low,
      "en"
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
});

// ============================================================
// Scenario 6: 英語リスクラベル (P6)
// ============================================================
describe("Scenario 6: 英語リスクラベル", () => {
  it("Low → risk_low ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    expect(result).toContain(l.risk_low);
  });

  it("Medium → risk_medium ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "cp" });
    const result = buildExplanation(parsed, cpEntry, RiskLevel.Medium, "en");
    expect(result).toContain(l.risk_medium);
  });

  it("High → risk_high ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "rm" });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High, "en");
    expect(result).toContain(l.risk_high);
  });

  it("Critical → risk_critical ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "chmod" });
    const result = buildExplanation(
      parsed,
      chmodEntry,
      RiskLevel.Critical,
      "en"
    );
    expect(result).toContain(l.risk_critical);
  });
});

// ============================================================
// Scenario 7: 英語コマンド説明 (P7)
// ============================================================
describe("Scenario 7: 英語コマンド説明", () => {
  it("entry.description.en が使用されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    expect(result).toContain(`ls${l.delimiter}List directory contents`);
  });
});

// ============================================================
// Scenario 8: 英語サブコマンド説明 (P8)
// ============================================================
describe("Scenario 8: 英語サブコマンド説明", () => {
  it("サブコマンドの description.en が使用されること", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "commit",
    });
    const result = buildExplanation(parsed, gitEntry, RiskLevel.Low, "en");
    expect(result).toContain(
      `git commit${l.delimiter}Record changes to the repository`
    );
  });
});

// ============================================================
// Scenario 9: 英語フラグ説明 (P9)
// ============================================================
describe("Scenario 9: 英語フラグ説明", () => {
  it("フラグの description.en が使用されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    expect(result).toContain(`${l.indent}-l: Use a long listing format`);
  });
});

// ============================================================
// Scenario 10: 英語セクションヘッダー・ラベル (P10)
// ============================================================
describe("Scenario 10: 英語セクションヘッダー・ラベル", () => {
  it("テンプレートに{header}がある場合、headerラベルが出力されること", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    if (templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });

  it("target ラベルが出力されること（引数あり）", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "ls",
      args: ["/home"],
    });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    expect(result).toContain(`${l.indent}${l.target} /home`);
  });

  it("リスクラベルが直接出力されること（Risk level: プレフィックスなし）", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low, "en");
    expect(result).toContain(l.risk_low);
    expect(result).not.toContain("Risk level:");
  });
});

// ============================================================
// Scenario 11: 英語未知コマンドテンプレート (P11)
// ============================================================
describe("Scenario 11: 英語未知コマンドテンプレート", () => {
  it("英語の未知コマンド文が出力されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "unknowncmd" });
    const result = buildExplanation(
      parsed,
      null,
      RiskLevel.Medium,
      "en"
    );
    expect(result).toContain(l.unknownCommand);
  });

  it("英語の未知リスクラベルが出力されること", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "unknowncmd" });
    const result = buildExplanation(
      parsed,
      null,
      RiskLevel.Medium,
      "en"
    );
    expect(result).toContain(l.unknownRisk);
  });

  it("テンプレートに{header}がある場合、英語headerが出力されること", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const parsed = makeParsed({ commandName: "unknowncmd" });
    const result = buildExplanation(
      parsed,
      null,
      RiskLevel.Medium,
      "en"
    );
    if (templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });
});

// ============================================================
// Scenario 12: 英語チェーン演算子表示 (P12)
// ============================================================
describe("Scenario 12: 英語チェーン演算子表示", () => {
  const lsParsed = makeParsed({ commandName: "ls" });
  const rmParsed = makeParsed({
    commandName: "rm",
    flags: ["-r"],
    args: ["foo"],
  });

  it("&& → operator_&& ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: lsParsed, entry: lsEntry, risk: RiskLevel.Low },
        { parsed: rmParsed, entry: rmEntry, risk: RiskLevel.High },
      ],
      [null, "&&"],
      RiskLevel.High,
      "en"
    );
    expect(result).toContain(l["operator_&&"]);
  });

  it("|| → operator_|| ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: lsParsed, entry: lsEntry, risk: RiskLevel.Low },
        { parsed: rmParsed, entry: rmEntry, risk: RiskLevel.High },
      ],
      [null, "||"],
      RiskLevel.High,
      "en"
    );
    expect(result).toContain(l["operator_||"]);
  });

  it("| → operator_| ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: lsParsed, entry: lsEntry, risk: RiskLevel.Low },
        { parsed: rmParsed, entry: rmEntry, risk: RiskLevel.High },
      ],
      [null, "|"],
      RiskLevel.High,
      "en"
    );
    expect(result).toContain(l["operator_|"]);
  });

  it("; → operator_; ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: lsParsed, entry: lsEntry, risk: RiskLevel.Low },
        { parsed: rmParsed, entry: rmEntry, risk: RiskLevel.High },
      ],
      [null, ";"],
      RiskLevel.High,
      "en"
    );
    expect(result).toContain(l["operator_;"]);
  });
});

// ============================================================
// Scenario 13: 英語総合リスクラベル (P13)
// ============================================================
describe("Scenario 13: 英語総合リスクラベル", () => {
  it("総合リスクラベルが直接出力されること（Overall risk level: プレフィックスなし）", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        {
          parsed: makeParsed({ commandName: "ls" }),
          entry: lsEntry,
          risk: RiskLevel.Low,
        },
        {
          parsed: makeParsed({ commandName: "rm", args: ["foo"] }),
          entry: rmEntry,
          risk: RiskLevel.High,
        },
      ],
      [null, "&&"],
      RiskLevel.High,
      "en"
    );
    expect(result).toContain(l.risk_high);
    expect(result).not.toContain("Overall risk level:");
  });
});
