import { describe, it, expect } from "vitest";
import { makeParsed, makeEntry } from "../helpers/factories";
import { buildExplanation } from "../../src/explanationBuilder";
import { getFormatterConfig } from "../../src/configLoader";
import { RiskLevel } from "../../src/types";

function labels(lang: "ja" | "en" = "ja") {
  return getFormatterConfig().labels[lang];
}

// --- モック辞書エントリ ---

const lsEntry = makeEntry({
  name: "ls",
  description: { ja: "ファイルやフォルダの一覧を表示します", en: "List directory contents" },
  baseRisk: RiskLevel.Low,
  category: "filesystem",
  flags: {
    "-l": { description: { ja: "詳細情報を表示", en: "Long listing format" } },
    "-a": { description: { ja: "隠しファイルも表示", en: "Show hidden files" } },
  },
});

const rmEntry = makeEntry({
  name: "rm",
  description: { ja: "ファイルやフォルダを削除します", en: "Remove files or directories" },
  baseRisk: RiskLevel.High,
  category: "filesystem",
  flags: {
    "-r": {
      description: { ja: "フォルダの中身も含めて再帰的に削除", en: "Remove recursively" },
      riskModifier: RiskLevel.High,
    },
    "-f": {
      description: { ja: "確認なしで強制削除", en: "Force removal" },
      riskModifier: RiskLevel.High,
    },
  },
});

const gitEntry = makeEntry({
  name: "git",
  description: { ja: "Gitバージョン管理システムを操作します", en: "Git VCS" },
  baseRisk: RiskLevel.Low,
  category: "git",
  subcommands: {
    reset: {
      description: { ja: "コミットの取り消しやステージングの解除を行います", en: "Reset HEAD" },
      riskOverride: RiskLevel.High,
    },
  },
  flags: {
    "--hard": {
      description: { ja: "作業ディレクトリの変更も含めてリセット（変更が失われる）", en: "Hard reset" },
      riskModifier: RiskLevel.Critical,
    },
  },
});

// --- Scenario 1: セクションヘッダー (Property 1, AC-1.1) ---
describe("セクションヘッダーの存在", () => {
  it("テンプレートに{header}がある場合、headerラベルを含むこと", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l", "-a"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    if (templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
  });
});

// --- Scenario 2: コマンド日本語説明 (Property 2, AC-1.2) ---
describe("コマンド日本語説明の表示", () => {
  it("ls の日本語説明を含むこと", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l", "-a"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).toContain(`ls${l.delimiter}ファイルやフォルダの一覧を表示します`);
  });
});

// --- Scenario 3: サブコマンド付き表示 (Property 3, AC-1.3) ---
describe("サブコマンド付き表示", () => {
  it("git reset の説明を含むこと", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
      args: ["HEAD~1"],
    });
    const result = buildExplanation(parsed, gitEntry, RiskLevel.Critical);
    expect(result).toContain(`git reset${l.delimiter}コミットの取り消しやステージングの解除を行います`);
  });
});

// --- Scenario 4: フラグ日本語説明 (Property 4, AC-1.4) ---
describe("フラグ日本語説明の表示", () => {
  it("辞書にあるフラグの説明を含むこと", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
    });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    expect(result).toContain(`${l.indent}-r: フォルダの中身も含めて再帰的に削除`);
    expect(result).toContain(`${l.indent}-f: 確認なしで強制削除`);
  });

  it("辞書に存在しないフラグは表示されないこと", () => {
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f", "--unknown"],
      args: ["node_modules"],
    });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    expect(result).not.toContain("--unknown");
  });
});

// --- Scenario 5: 引数の「対象:」表示 (Property 5, AC-1.5) ---
describe("引数の「対象:」表示", () => {
  it("args がある場合 target ラベルを表示すること", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
    });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    expect(result).toContain(`${l.indent}${l.target} node_modules`);
  });

  it("args が空の場合 target ラベルを表示しないこと", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l", "-a"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).not.toContain(l.target);
  });
});

// --- Scenario 6: リスクレベル Emoji + ラベル (Property 6, AC-1.6) ---
describe("リスクレベル Emoji + ラベル表示", () => {
  it("Low → risk_low ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls" });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).toContain(l.risk_low);
  });

  it("Medium → risk_medium ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "npm", subcommand: "install" });
    const npmEntry = makeEntry({
      name: "npm",
      description: { ja: "npm", en: "npm" },
      baseRisk: RiskLevel.Low,
      category: "package",
      subcommands: {
        install: {
          description: { ja: "インストール", en: "Install" },
          riskOverride: RiskLevel.Medium,
        },
      },
    });
    const result = buildExplanation(parsed, npmEntry, RiskLevel.Medium);
    expect(result).toContain(l.risk_medium);
  });

  it("High → risk_high ラベル", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "rm", args: ["file.txt"] });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    expect(result).toContain(l.risk_high);
  });

  it("Critical → risk_critical ラベル", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
    });
    const result = buildExplanation(parsed, gitEntry, RiskLevel.Critical);
    expect(result).toContain(l.risk_critical);
  });
});

// --- Scenario 7: チェーンコマンド注意文 (Property 7, AC-1.7) ---
describe("チェーンコマンド注意文", () => {
  it("hasChain: true でも単一セグメントレンダリングでは chainNotice は表示されない", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
      hasChain: true,
      chainOperator: "&&",
    });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    // B1修正: chainNotice は isChainSegment=true（チェーンレンダリング時）のみ表示
    expect(result).not.toContain(l.chainNotice);
  });
});

// --- Scenario 8: 未知コマンドテンプレート (Property 8, AC-1.8) ---
describe("未知コマンドテンプレート", () => {
  it("entry = null の場合、未知コマンドテンプレートを返すこと", () => {
    const l = labels();
    const { templates_long } = getFormatterConfig();
    const parsed = makeParsed({ commandName: "unknowncmd" });
    const result = buildExplanation(parsed, null, RiskLevel.Medium);
    if (templates_long.singleCommand.includes("{header}")) {
      expect(result).toContain(l.header);
    }
    expect(result).toContain(`unknowncmd${l.delimiter}${l.unknownCommand}`);
    expect(result).toContain(l.unknownRisk);
  });
});

// --- Scenario 9: Specs.md 出力例4パターン (Property 9, AC-1.9) ---
describe("Specs.md 出力例4パターンの整合", () => {
  it("例1: ls -la", () => {
    const l = labels();
    const parsed = makeParsed({ commandName: "ls", flags: ["-l", "-a"] });
    const result = buildExplanation(parsed, lsEntry, RiskLevel.Low);
    expect(result).toContain(`ls${l.delimiter}ファイルやフォルダの一覧を表示します`);
    expect(result).toContain(`${l.indent}-l: 詳細情報を表示`);
    expect(result).toContain(`${l.indent}-a: 隠しファイルも表示`);
    expect(result).toContain(l.risk_low);
  });

  it("例2: rm -rf node_modules", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
    });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    expect(result).toContain(`rm${l.delimiter}ファイルやフォルダを削除します`);
    expect(result).toContain(`${l.indent}-r: フォルダの中身も含めて再帰的に削除`);
    expect(result).toContain(`${l.indent}-f: 確認なしで強制削除`);
    expect(result).toContain(`${l.indent}${l.target} node_modules`);
    expect(result).toContain(l.risk_high);
  });

  it("例3: git reset --hard HEAD~1", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "git",
      subcommand: "reset",
      flags: ["--hard"],
      args: ["HEAD~1"],
    });
    const result = buildExplanation(parsed, gitEntry, RiskLevel.Critical);
    expect(result).toContain(`git reset${l.delimiter}コミットの取り消しやステージングの解除を行います`);
    expect(result).toContain(`${l.indent}--hard: 作業ディレクトリの変更も含めてリセット（変更が失われる）`);
    expect(result).toContain(`${l.indent}${l.target} HEAD~1`);
    expect(result).toContain(l.risk_critical);
  });

  it("例4: 単一セグメントに hasChain があっても chainNotice は非表示", () => {
    const l = labels();
    const parsed = makeParsed({
      commandName: "rm",
      flags: ["-r", "-f"],
      args: ["node_modules"],
      hasChain: true,
      chainOperator: "&&",
    });
    const result = buildExplanation(parsed, rmEntry, RiskLevel.High);
    expect(result).toContain(`rm${l.delimiter}ファイルやフォルダを削除します`);
    expect(result).toContain(l.risk_high);
    // B1修正: chainNotice は単一セグメントレンダリングでは表示されない
    expect(result).not.toContain(l.chainNotice);
  });
});
