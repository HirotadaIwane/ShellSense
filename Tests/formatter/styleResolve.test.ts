import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  initFormatterConfig,
  getFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";

// --- パス定義 ---

const realConfigDir = path.join(__dirname, "../../config");

// --- スタイルファイル読み込みヘルパー ---

function readStyleFile(name: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(realConfigDir, "styles", `${name}.json`), "utf8"));
}

// --- 各テスト前にキャッシュクリア ---

beforeEach(() => {
  resetFormatterConfig();
});

// ============================================================
// Part A: スタイル解決テスト (P1, P2)
// ============================================================

// Scenario A-1: 明示的スタイル名で読み込み (P1)
describe("スタイル解決 (P1)", () => {
  it("initFormatterConfig(dir, { style: 'legend' }) で legend スタイルが読み込まれること", () => {
    initFormatterConfig(realConfigDir, { style: "legend" });
    const config = getFormatterConfig();
    const style = readStyleFile("legend") as Record<string, Record<string, Record<string, string>>>;
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
    expect(config.labels.ja.header).toBe(style.labels.ja.header);
    expect(config.labels.ja["operator_&&"]).toBe(style.labels.ja["operator_&&"]);
  });

  it("initFormatterConfig(dir, { style: 'ascii' }) で ascii スタイルが読み込まれること", () => {
    initFormatterConfig(realConfigDir, { style: "ascii" });
    const config = getFormatterConfig();
    const style = readStyleFile("ascii") as Record<string, Record<string, Record<string, string>>>;
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
    expect(config.labels.ja.risk_high).toBe(style.labels.ja.risk_high);
    expect(config.labels.ja.header).toBe(style.labels.ja.header);
  });

  it("initFormatterConfig(dir, { style: 'pro' }) で pro スタイルが読み込まれること", () => {
    initFormatterConfig(realConfigDir, { style: "pro" });
    const config = getFormatterConfig();
    const style = readStyleFile("pro") as Record<string, Record<string, Record<string, string>>>;
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
    expect(config.labels.ja["operator_&&"]).toBe(style.labels.ja["operator_&&"]);
    expect(config.templates_short.singleCommand).toBe((style as Record<string, Record<string, string>>).templates_short.singleCommand);
  });

  it("initFormatterConfig(dir, { style: 'emoji' }) で emoji スタイルが読み込まれること", () => {
    initFormatterConfig(realConfigDir, { style: "emoji" });
    const config = getFormatterConfig();
    const style = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
    expect(config.labels.ja.header).toBe(style.labels.ja.header);
  });
});

// Scenario A-2: デフォルトスタイル (P2)
describe("デフォルトスタイル (P2)", () => {
  it("initFormatterConfig(dir) — options なし — で emoji スタイルが読み込まれること", () => {
    initFormatterConfig(realConfigDir);
    const config = getFormatterConfig();
    const style = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
    expect(config.labels.ja.header).toBe(style.labels.ja.header);
  });

  it("initFormatterConfig(dir, {}) — 空 options — で emoji スタイルが読み込まれること", () => {
    initFormatterConfig(realConfigDir, {});
    const config = getFormatterConfig();
    const style = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
  });
});

// ============================================================
// Part B: deep merge テスト (P3, P4, P5, P6)
// ============================================================

// Scenario B-1: プリミティブ上書き (P3)
describe("deep merge — プリミティブ上書き (P3)", () => {
  it("labels.ja.chainNumbering のみオーバーライドでき、他の labels 値は維持されること", () => {
    const emojiStyle = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: { labels: { ja: { chainNumbering: "circled" } } },
    });
    const config = getFormatterConfig();
    expect(config.labels.ja.chainNumbering).toBe("circled");
    expect(config.labels.ja.delimiter).toBe(emojiStyle.labels.ja.delimiter);
    expect(config.templates_short.singleCommand).toBe((emojiStyle as Record<string, Record<string, string>>).templates_short.singleCommand);
  });

  it("labels.ja.delimiter のオーバーライドが反映されること", () => {
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: { labels: { ja: { delimiter: " -> " } } },
    });
    const config = getFormatterConfig();
    expect(config.labels.ja.delimiter).toBe(" -> ");
    expect(config.labels.ja.chainNumbering).toBe("dot");
  });
});

// Scenario B-2: オブジェクト再帰マージ (P4)
describe("deep merge — オブジェクト再帰 (P4)", () => {
  it("labels.ja.risk_low のみオーバーライドでき、他のリスク値は維持されること", () => {
    const emojiStyle = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: { labels: { ja: { risk_low: "CUSTOM LOW" } } },
    });
    const config = getFormatterConfig();
    expect(config.labels.ja.risk_low).toBe("CUSTOM LOW");
    expect(config.labels.ja.risk_high).toBe(emojiStyle.labels.ja.risk_high);
    expect(config.labels.ja.risk_critical).toBe(emojiStyle.labels.ja.risk_critical);
  });

  it("labels.ja の部分オーバーライドが再帰マージされること", () => {
    const emojiStyle = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: { labels: { ja: { header: "###" } } },
    });
    const config = getFormatterConfig();
    expect(config.labels.ja.header).toBe("###");
    expect(config.labels.ja.chainNotice).toBe(emojiStyle.labels.ja.chainNotice);
    expect(config.labels.en.header).toBe(emojiStyle.labels.en.header);
  });

  it("labels.ja の operator オーバーライドがマージされ、他の labels が維持されること", () => {
    const emojiStyle = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: { labels: { ja: { "operator_&&": "CUSTOM" } } },
    });
    const config = getFormatterConfig();
    expect(config.labels.ja["operator_&&"]).toBe("CUSTOM");
    expect(config.labels.ja["operator_||"]).toBe(emojiStyle.labels.ja["operator_||"]);
    expect(config.labels.ja.risk_low).toBe(emojiStyle.labels.ja.risk_low);
  });
});

// Scenario B-3: templates_long 上書き (P5)
describe("deep merge — templates_long 上書き (P5)", () => {
  it("templates_long.singleCommand が上書きされること", () => {
    const emojiStyle = readStyleFile("emoji") as Record<string, Record<string, string>>;
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: { templates_long: { singleCommand: "{header}\n{risk}" } },
    });
    const config = getFormatterConfig();
    expect(config.templates_long.singleCommand).toBe("{header}\n{risk}");
    // other templates_long fields remain
    expect(config.templates_long.chainHeader).toBe(emojiStyle.templates_long.chainHeader);
  });

  it("templates_long.chainFooter が上書きされること", () => {
    initFormatterConfig(realConfigDir, {
      style: "emoji",
      overrides: {
        templates_long: {
          chainFooter: "{separator}\n{overallRisk}\n{chainNotice}",
        },
      },
    });
    const config = getFormatterConfig();
    expect(config.templates_long.chainFooter).toBe(
      "{separator}\n{overallRisk}\n{chainNotice}"
    );
  });
});

// Scenario B-4: 空 overrides (P6)
describe("deep merge — 空 overrides (P6)", () => {
  it("空 overrides でベーススタイルがそのまま維持されること", () => {
    // ベーススタイルを直接ロード
    const emojiRaw = JSON.parse(
      fs.readFileSync(path.join(realConfigDir, "styles", "emoji.json"), "utf8")
    );

    initFormatterConfig(realConfigDir, { style: "emoji", overrides: {} });
    const config = getFormatterConfig();

    expect(config.labels.ja.risk_low).toBe(emojiRaw.labels.ja.risk_low);
    expect(config.labels.ja.chainNumbering).toBe(emojiRaw.labels.ja.chainNumbering);
    expect(config.labels.ja.header).toBe(emojiRaw.labels.ja.header);
    expect(config.templates_long.singleCommand).toBe(emojiRaw.templates_long.singleCommand);
  });
});

// ============================================================
// Part C: 後方互換テスト (P8)
// ============================================================

// Scenario D-1: 自動検出パス (P8)
describe("自動検出パス (P8)", () => {
  it("未初期化状態で getFormatterConfig() が styles/emoji.json を自動検出すること", () => {
    const config = getFormatterConfig();
    const style = readStyleFile("emoji") as Record<string, Record<string, Record<string, string>>>;
    expect(config.version).toBe("2.0.0");
    expect(config.labels.ja.risk_low).toBe(style.labels.ja.risk_low);
  });
});
