import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- スタイルファイル読み込み ---

const stylesDir = path.join(__dirname, "..", "..", "config", "styles");

function readStyle(name: string): Record<string, unknown> {
  const filePath = path.join(stylesDir, `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const emoji = readStyle("emoji") as Record<string, unknown>;
const legend = readStyle("legend") as Record<string, unknown>;
const ascii = readStyle("ascii") as Record<string, unknown>;
const pro = readStyle("pro") as Record<string, unknown>;

// ============================================================
// Part A: emoji.json 値一致 (P1)
// ============================================================

describe("emoji.json 値一致 (P1)", () => {
  it("version フィールドが '2.0.0' であること", () => {
    expect(emoji).toHaveProperty("version");
    expect(emoji.version).toBe("2.0.0");
  });

  it("labels.ja の risk ラベルが非空の文字列であること", () => {
    const ja = (emoji as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.risk_low.length).toBeGreaterThan(0);
    expect(ja.risk_medium.length).toBeGreaterThan(0);
    expect(ja.risk_high.length).toBeGreaterThan(0);
    expect(ja.risk_critical.length).toBeGreaterThan(0);
  });

  it("labels.ja の operator が非空の文字列であること", () => {
    const ja = (emoji as { labels: { ja: Record<string, string> } }).labels.ja;
    for (const key of ["operator_&&", "operator_||", "operator_|", "operator_;"]) {
      expect(ja[key].length).toBeGreaterThan(0);
    }
  });

  it("labels.ja.header が非空の文字列であること", () => {
    const ja = (emoji as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.header.length).toBeGreaterThan(0);
  });

  it("labels.ja.delimiter が非空の文字列であること", () => {
    const ja = (emoji as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.delimiter.length).toBeGreaterThan(0);
  });

  it("labels.ja.chainNumbering が 'dot' であること", () => {
    const ja = (emoji as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.chainNumbering).toBe("dot");
  });

  it("templates_short.singleCommand が '[ShellSense {risk}] {commands}' であること", () => {
    const t = (emoji as { templates_short: { singleCommand: string } }).templates_short;
    expect(t.singleCommand).toBe("[ShellSense {risk}] {commands}");
  });
});

// ============================================================
// Part B: legend.json ブロックシェードゲージ (P2)
// ============================================================

describe("legend.json ブロックシェードゲージ (P2)", () => {
  it("labels.ja の risk ラベルにブロックシェード文字が含まれること", () => {
    const ja = (legend as { labels: { ja: Record<string, string> } }).labels.ja;
    const shadeRe = /[░▒▓█]/;
    expect(ja.risk_low).toMatch(shadeRe);
    expect(ja.risk_medium).toMatch(shadeRe);
    expect(ja.risk_high).toMatch(shadeRe);
    expect(ja.risk_critical).toMatch(shadeRe);
  });

  it("labels.ja の risk ラベルに絵文字が含まれないこと", () => {
    const ja = (legend as { labels: { ja: Record<string, string> } }).labels.ja;
    const emojiRe = /[\u{1F300}-\u{1FAFF}]/u;
    expect(ja.risk_low).not.toMatch(emojiRe);
    expect(ja.risk_medium).not.toMatch(emojiRe);
    expect(ja.risk_high).not.toMatch(emojiRe);
    expect(ja.risk_critical).not.toMatch(emojiRe);
  });

  it("labels.ja の operator がシンプルなテキストであること", () => {
    const ja = (legend as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja["operator_&&"]).toBe("&&");
    expect(ja["operator_||"]).toBe("||");
    expect(ja["operator_|"]).toBe("|");
    expect(ja["operator_;"]).toBe(";");
  });

  it("labels.ja.header が空文字であること", () => {
    const ja = (legend as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.header).toBe("");
  });

  it("labels.ja.delimiter が ' ▸ ' であること", () => {
    const ja = (legend as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.delimiter).toBe(" ▸ ");
  });
});

// ============================================================
// Part C: ascii.json ASCII 限定 (P3)
// ============================================================

describe("ascii.json ASCII 限定 (P3)", () => {
  it("labels.ja の risk ラベルが ASCII ブラケットプレフィックスであること", () => {
    const ja = (ascii as { labels: { ja: Record<string, string> } }).labels.ja;
    const riskKeys = ["risk_low", "risk_medium", "risk_high", "risk_critical"];
    for (const key of riskKeys) {
      // Each risk label starts with a bracket-enclosed ASCII prefix like [OK], [!], etc.
      expect(ja[key]).toMatch(/^\[.+\]/);
    }
  });

  it("labels.ja の operator が非空の ASCII テキストであること", () => {
    const ja = (ascii as { labels: { ja: Record<string, string> } }).labels.ja;
    for (const key of ["operator_&&", "operator_||", "operator_|", "operator_;"]) {
      expect(ja[key].length).toBeGreaterThan(0);
      for (const char of ja[key]) {
        expect(char.codePointAt(0)!).toBeLessThanOrEqual(0x7f);
      }
    }
  });

  it("labels.ja.header が非空の ASCII 文字列であること", () => {
    const ja = (ascii as { labels: { ja: Record<string, string> } }).labels.ja;
    expect(ja.header.length).toBeGreaterThan(0);
    for (const char of ja.header) {
      expect(char.codePointAt(0)!).toBeLessThanOrEqual(0x7f);
    }
  });

  it("labels.en.header が非空の ASCII 文字列であること", () => {
    const en = (ascii as { labels: { en: Record<string, string> } }).labels.en;
    expect(en.header.length).toBeGreaterThan(0);
    for (const char of en.header) {
      expect(char.codePointAt(0)!).toBeLessThanOrEqual(0x7f);
    }
  });

  it("構造要素（header, operator, delimiter, indent）が ASCII 範囲内であること", () => {
    const ja = (ascii as { labels: { ja: Record<string, string> } }).labels.ja;
    const structuralKeys = [
      "header", "delimiter", "indent",
      "operator_&&", "operator_||", "operator_|", "operator_;",
      "chainNotice", "chainNumbering",
    ];
    for (const key of structuralKeys) {
      for (const char of ja[key]) {
        expect(char.codePointAt(0)!, `non-ASCII in ${key}: ${char}`).toBeLessThanOrEqual(0x7f);
      }
    }
  });
});

// ============================================================
// Part D: pro.json 短縮ラベル (P4)
// ============================================================

describe("pro.json 短縮ラベル (P4)", () => {
  it("labels.ja の risk ラベルに絵文字が含まれないこと", () => {
    const ja = (pro as { labels: { ja: Record<string, string> } }).labels.ja;
    const emojiRe = /[\u{1F300}-\u{1FAFF}]/u;
    expect(ja.risk_low).not.toMatch(emojiRe);
    expect(ja.risk_medium).not.toMatch(emojiRe);
    expect(ja.risk_high).not.toMatch(emojiRe);
    expect(ja.risk_critical).not.toMatch(emojiRe);
  });

  it("labels.ja.risk_* に括弧がないこと", () => {
    const ja = (pro as { labels: { ja: Record<string, string> } }).labels.ja;
    const riskKeys = ["risk_low", "risk_medium", "risk_high", "risk_critical"];
    for (const key of riskKeys) {
      expect(ja[key]).not.toContain("（");
      expect(ja[key]).not.toContain("(");
    }
  });

  it("labels.en.risk_* に括弧がないこと", () => {
    const en = (pro as { labels: { en: Record<string, string> } }).labels.en;
    const riskKeys = ["risk_low", "risk_medium", "risk_high", "risk_critical"];
    for (const key of riskKeys) {
      expect(en[key]).not.toContain("(");
    }
  });

  it("templates_short.singleCommand が '{risk} {commands}' であること", () => {
    const t = (pro as { templates_short: { singleCommand: string } }).templates_short;
    expect(t.singleCommand).toBe("{risk} {commands}");
  });
});

// ============================================================
// Part E: 4 ファイルの構造的一貫性 (P7)
// ============================================================

describe("4 ファイルの構造的一貫性 (P7)", () => {
  const styles = [
    { name: "emoji", data: emoji },
    { name: "legend", data: legend },
    { name: "ascii", data: ascii },
    { name: "pro", data: pro },
  ];

  for (const { name, data } of styles) {
    describe(`${name}.json`, () => {
      it("version, templates_long, templates_short, labels キーを含むこと", () => {
        expect(data).toHaveProperty("version");
        expect(data).toHaveProperty("templates_long");
        expect(data).toHaveProperty("templates_short");
        expect(data).toHaveProperty("labels");
      });

      it("templates_long に必須フィールドを含むこと", () => {
        const tl = (data as { templates_long: Record<string, unknown> }).templates_long;
        expect(tl).toHaveProperty("singleCommand");
        expect(tl).toHaveProperty("chainHeader");
        expect(tl).toHaveProperty("chainSegment");
        expect(tl).toHaveProperty("chainOperator");
        expect(tl).toHaveProperty("chainFooter");
      });

      it("templates_short に必須フィールドを含むこと", () => {
        const ts = (data as { templates_short: Record<string, unknown> }).templates_short;
        expect(ts).toHaveProperty("singleCommand");
        expect(ts).toHaveProperty("chainCommand");
      });

      it("labels に ja, en キーを含むこと", () => {
        const labels = data as { labels: Record<string, unknown> };
        expect(labels.labels).toHaveProperty("ja");
        expect(labels.labels).toHaveProperty("en");
      });

      it("labels.ja が TemplateLabels の全必須フィールドを含むこと", () => {
        const ja = (data as { labels: { ja: Record<string, unknown> } }).labels.ja;
        const requiredFields = [
          "header",
          "risk_low", "risk_low_short",
          "risk_medium", "risk_medium_short",
          "risk_high", "risk_high_short",
          "risk_critical", "risk_critical_short",
          "unknownRisk", "unknownRisk_short", "unknownCommand",
          "target", "delimiter", "indent",
          "chainNotice", "chainNumbering", "sudoNotice",
        ];
        for (const field of requiredFields) {
          expect(ja).toHaveProperty(field);
        }
      });
    });
  }
});
