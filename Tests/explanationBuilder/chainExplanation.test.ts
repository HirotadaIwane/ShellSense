import { describe, it, expect } from "vitest";
import { makeParsed, makeEntry } from "../helpers/factories";
import { buildChainExplanation } from "../../src/explanationBuilder";
import { getFormatterConfig } from "../../src/configLoader";
import { RiskLevel } from "../../src/types";

function labels(lang: "ja" | "en" = "ja") {
  return getFormatterConfig().labels[lang];
}

// --- モック辞書エントリ ---

const rmEntry = makeEntry({
  name: "rm",
  description: { ja: "ファイルやフォルダを削除します", en: "Remove files" },
  baseRisk: RiskLevel.High,
  category: "filesystem",
  flags: {
    "-r": {
      description: { ja: "フォルダの中身も含めて再帰的に削除", en: "Recursive" },
      riskModifier: RiskLevel.High,
    },
    "-f": {
      description: { ja: "確認なしで強制削除", en: "Force" },
      riskModifier: RiskLevel.High,
    },
  },
});

const npmEntry = makeEntry({
  name: "npm",
  description: { ja: "Node.jsパッケージマネージャーを操作します", en: "npm" },
  baseRisk: RiskLevel.Low,
  category: "package",
  subcommands: {
    install: {
      description: { ja: "パッケージをインストールします", en: "Install" },
      riskOverride: RiskLevel.Medium,
    },
  },
});

const lsEntry = makeEntry({
  name: "ls",
  description: { ja: "ファイルやフォルダの一覧を表示します", en: "List" },
  baseRisk: RiskLevel.Low,
  category: "filesystem",
  flags: {
    "-l": { description: { ja: "詳細情報を表示", en: "Long" } },
    "-a": { description: { ja: "隠しファイルも表示", en: "All" } },
  },
});

const echoEntry = makeEntry({
  name: "echo",
  description: { ja: "テキストを表示します", en: "Echo" },
  baseRisk: RiskLevel.Low,
  category: "other",
});

// --- Scenario 1: セクションヘッダー (Property 1) ---
describe("セクションヘッダーの存在", () => {
  it("テンプレートに{header}がある場合、チェーン出力にheaderラベルを含む", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "rm", flags: ["-r", "-f"], args: ["foo"] }), entry: rmEntry, risk: RiskLevel.High },
        { parsed: makeParsed({ commandName: "npm", subcommand: "install" }), entry: npmEntry, risk: RiskLevel.Medium },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    const allTemplates = [
      templates_long.chainHeader,
      templates_long.chainSegment,
      templates_long.chainFooter,
    ].join("\n");
    if (allTemplates.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });
});

// --- Scenario 2: 全コマンドの番号付き説明 (Property 2) ---
describe("全コマンドの番号付き説明", () => {
  it("1. rm と 2. npm install を含む", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "rm", flags: ["-r", "-f"] }), entry: rmEntry, risk: RiskLevel.High },
        { parsed: makeParsed({ commandName: "npm", subcommand: "install" }), entry: npmEntry, risk: RiskLevel.Medium },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    expect(result).toContain(`1. rm${l.delimiter}ファイルやフォルダを削除します`);
    expect(result).toContain(`2. npm install${l.delimiter}パッケージをインストールします`);
  });
});

// --- Scenario 3: 各コマンドのフラグ・引数表示 (Property 3) ---
describe("各コマンドのフラグ・引数表示", () => {
  it("rmのフラグと引数が表示される", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "rm", flags: ["-r", "-f"], args: ["node_modules"] }), entry: rmEntry, risk: RiskLevel.High },
        { parsed: makeParsed({ commandName: "npm", subcommand: "install" }), entry: npmEntry, risk: RiskLevel.Medium },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    expect(result).toContain(`${l.indent}-r: フォルダの中身も含めて再帰的に削除`);
    expect(result).toContain(`${l.indent}-f: 確認なしで強制削除`);
    expect(result).toContain(`${l.indent}${l.target} node_modules`);
  });
});

// --- Scenario 4〜7: 演算子の日本語説明 (Property 4) ---
describe("演算子の日本語説明", () => {
  it("&& → operator_&& ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
      ],
      [null, "&&"],
      RiskLevel.Low
    );
    expect(result).toContain(l["operator_&&"]);
  });

  it("|| → operator_|| ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
      ],
      [null, "||"],
      RiskLevel.Low
    );
    expect(result).toContain(l["operator_||"]);
  });

  it("| → operator_| ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "ls" }), entry: lsEntry, risk: RiskLevel.Low },
        { parsed: makeParsed({ commandName: "grep" }), entry: null, risk: RiskLevel.Medium },
      ],
      [null, "|"],
      RiskLevel.Medium
    );
    expect(result).toContain(l["operator_|"]);
  });

  it("; → operator_; ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
      ],
      [null, ";"],
      RiskLevel.Low
    );
    expect(result).toContain(l["operator_;"]);
  });
});

// --- Scenario 8: 総合リスクレベル (Property 5) ---
describe("総合リスクレベル（最大値）", () => {
  it("rm(high) && npm(medium) → risk_high ラベル", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "rm" }), entry: rmEntry, risk: RiskLevel.High },
        { parsed: makeParsed({ commandName: "npm", subcommand: "install" }), entry: npmEntry, risk: RiskLevel.Medium },
      ],
      [null, "&&"],
      RiskLevel.High
    );
    expect(result).toContain(l.risk_high);
  });
});

// --- Scenario 9: 未知コマンドのチェーン処理 (Property 7) ---
describe("未知コマンドのチェーン処理", () => {
  it("未知コマンドと既知コマンドの混合チェーン", () => {
    const l = labels();
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "unknowncmd" }), entry: null, risk: RiskLevel.Medium },
        { parsed: makeParsed({ commandName: "ls", flags: ["-l"] }), entry: lsEntry, risk: RiskLevel.Low },
      ],
      [null, "&&"],
      RiskLevel.Medium
    );
    expect(result).toContain(`unknowncmd${l.delimiter}${l.unknownCommand}`);
    expect(result).toContain(`ls${l.delimiter}ファイルやフォルダの一覧を表示します`);
  });
});

// --- Scenario 10: 3コマンドチェーン (Property 2) ---
describe("3コマンドチェーン", () => {
  it("3つのコマンドが番号付きで表示される", () => {
    const result = buildChainExplanation(
      [
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
        { parsed: makeParsed({ commandName: "echo" }), entry: echoEntry, risk: RiskLevel.Low },
        { parsed: makeParsed({ commandName: "ls" }), entry: lsEntry, risk: RiskLevel.Low },
      ],
      [null, "&&", "&&"],
      RiskLevel.Low
    );
    expect(result).toContain("1. echo");
    expect(result).toContain("2. echo");
    expect(result).toContain("3. ls");
  });
});
