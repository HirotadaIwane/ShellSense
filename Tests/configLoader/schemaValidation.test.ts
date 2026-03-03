import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SCHEMA_PATH = path.resolve(__dirname, "../../config/formatter.schema.json");
const STYLES_DIR = path.resolve(__dirname, "../../config/styles");
const PRESETS = ["emoji", "ascii", "legend", "pro"] as const;

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const schema = readJson(SCHEMA_PATH) as {
  definitions: Record<string, Record<string, unknown>>;
};

// ============================================================
// Scenario 1: StyleFile 必須フィールド (Property 1, R1.1)
// ============================================================

describe("StyleFile 必須フィールド (Property 1, R1.1)", () => {
  it("required に version, templates_long, templates_short, labels が含まれる", () => {
    const styleFile = schema.definitions.StyleFile;
    const required = styleFile.required as string[];
    expect(required).toContain("version");
    expect(required).toContain("templates_long");
    expect(required).toContain("templates_short");
    expect(required).toContain("labels");
  });
});

// ============================================================
// Scenario 2: templates_long 必須キー (Property 1, R1.2)
// ============================================================

describe("templates_long 必須キー (Property 1, R1.2)", () => {
  it("required に 5つのテンプレートキーが含まれる", () => {
    const props = schema.definitions.StyleFile.properties as Record<string, Record<string, unknown>>;
    const tl = props.templates_long;
    const required = tl.required as string[];
    expect(required).toContain("singleCommand");
    expect(required).toContain("chainHeader");
    expect(required).toContain("chainSegment");
    expect(required).toContain("chainOperator");
    expect(required).toContain("chainFooter");
  });
});

// ============================================================
// Scenario 3: templates_short 必須キー (Property 1, R1.3)
// ============================================================

describe("templates_short 必須キー (Property 1, R1.3)", () => {
  it("required に singleCommand, chainCommand が含まれる", () => {
    const props = schema.definitions.StyleFile.properties as Record<string, Record<string, unknown>>;
    const ts = props.templates_short;
    const required = ts.required as string[];
    expect(required).toContain("singleCommand");
    expect(required).toContain("chainCommand");
  });
});

// ============================================================
// Scenario 4: TemplateLabels 必須キー (Property 2, R1.4)
// ============================================================

describe("TemplateLabels 必須キー (Property 2, R1.4)", () => {
  const REQUIRED_KEYS = [
    "header",
    "risk_low", "risk_low_short",
    "risk_medium", "risk_medium_short",
    "risk_high", "risk_high_short",
    "risk_critical", "risk_critical_short",
    "unknownRisk", "unknownRisk_short", "unknownCommand",
    "target", "delimiter", "indent",
    "chainNotice", "chainNumbering", "sudoNotice",
  ];

  it("18個の必須キーが全て含まれる", () => {
    const tl = schema.definitions.TemplateLabels;
    const required = tl.required as string[];
    for (const key of REQUIRED_KEYS) {
      expect(required, `missing required key: ${key}`).toContain(key);
    }
    expect(required).toHaveLength(18);
  });

  it("additionalProperties が { type: string } である", () => {
    const tl = schema.definitions.TemplateLabels;
    expect(tl.additionalProperties).toEqual({ type: "string" });
  });
});

// ============================================================
// Scenario 5: labels の $ref (Property 1, R1.5)
// ============================================================

describe("labels の $ref (Property 1, R1.5)", () => {
  it("labels.additionalProperties が TemplateLabels への $ref である", () => {
    const props = schema.definitions.StyleFile.properties as Record<string, Record<string, unknown>>;
    const labels = props.labels;
    expect(labels.additionalProperties).toEqual({
      $ref: "#/definitions/TemplateLabels",
    });
  });
});

// ============================================================
// Scenario 6: 旧定義の残存 (Property 3, R1.6)
// ============================================================

describe("旧定義の残存 (Property 3, R1.6)", () => {
  it("LanguageLabels, RiskLabels, LayoutGroupId が残存する", () => {
    expect(schema.definitions).toHaveProperty("LanguageLabels");
    expect(schema.definitions).toHaveProperty("RiskLabels");
    expect(schema.definitions).toHaveProperty("LayoutGroupId");
  });
});

// ============================================================
// Scenario 7: プリセットJSON構造 (Property 4, R2.1-R2.4)
// ============================================================

describe("プリセットJSON構造 (Property 4, R2.1-R2.4)", () => {
  for (const preset of PRESETS) {
    describe(`${preset}.json`, () => {
      const json = readJson(path.join(STYLES_DIR, `${preset}.json`));

      it("version が 2.0.0 である", () => {
        expect(json.version).toBe("2.0.0");
      });

      it("templates_long, templates_short, labels が存在する", () => {
        expect(json).toHaveProperty("templates_long");
        expect(json).toHaveProperty("templates_short");
        expect(json).toHaveProperty("labels");
      });

      it("旧セクション (emoji, layout) が存在しない", () => {
        expect(json).not.toHaveProperty("emoji");
        expect(json).not.toHaveProperty("layout");
      });
    });
  }
});

// ============================================================
// Scenario 8: ラベル値の移行正確性 — emoji.json (Property 5, R2.5)
// ============================================================

describe("ラベル値の移行正確性 — emoji.json (Property 5, R2.5)", () => {
  const json = readJson(path.join(STYLES_DIR, "emoji.json"));
  const labels = (json.labels as Record<string, Record<string, string>>).ja;

  it("risk_low が非空の文字列であること", () => {
    expect(labels.risk_low.length).toBeGreaterThan(0);
  });

  it("risk_low_short が非空の文字列であること", () => {
    expect(labels.risk_low_short.length).toBeGreaterThan(0);
  });

  it("unknownRisk が非空の文字列であること", () => {
    expect(labels.unknownRisk.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Scenario 9: ラベル値の移行正確性 — legend.json (Property 5, R2.5)
// ============================================================

describe("ラベル値の移行正確性 — legend.json (Property 5, R2.5)", () => {
  const json = readJson(path.join(STYLES_DIR, "legend.json"));
  const labels = (json.labels as Record<string, Record<string, string>>).ja;

  it("risk_low がブロックシェードゲージ形式であること", () => {
    expect(labels.risk_low).toBe("░░░█ LOW ");
  });
});

// ============================================================
// Scenario 10: テンプレート値の移行正確性 (Property 6, R2.6)
// ============================================================

describe("テンプレート値の移行正確性 (Property 6, R2.6)", () => {
  for (const preset of PRESETS) {
    it(`${preset}.json の singleCommand テンプレートに必須プレースホルダーが含まれること`, () => {
      const json = readJson(path.join(STYLES_DIR, `${preset}.json`));
      const tl = json.templates_long as Record<string, string>;
      expect(tl.singleCommand).toContain("{command}");
      expect(tl.singleCommand).toContain("{risk}");
    });
  }
});

// ============================================================
// Scenario 11: TemplateLabels 必須キーの存在 (Property 7, R2.7)
// ============================================================

describe("TemplateLabels 必須キーの存在 — 全プリセット (Property 7, R2.7)", () => {
  const REQUIRED_LABEL_KEYS = [
    "header",
    "risk_low", "risk_low_short",
    "risk_medium", "risk_medium_short",
    "risk_high", "risk_high_short",
    "risk_critical", "risk_critical_short",
    "unknownRisk", "unknownRisk_short", "unknownCommand",
    "target", "delimiter", "indent",
    "chainNotice", "chainNumbering", "sudoNotice",
  ];

  for (const preset of PRESETS) {
    it(`${preset}.json の labels.ja に 18個の必須キーが存在する`, () => {
      const json = readJson(path.join(STYLES_DIR, `${preset}.json`));
      const labels = (json.labels as Record<string, Record<string, unknown>>).ja;
      for (const key of REQUIRED_LABEL_KEYS) {
        expect(labels, `${preset}: missing key ${key}`).toHaveProperty(key);
        expect(typeof labels[key], `${preset}: ${key} is not string`).toBe("string");
      }
    });
  }
});

// ============================================================
// Scenario 12: operator_* キーの存在 (Property 7, R2.7)
// ============================================================

describe("operator_* キーの存在 — 全プリセット (Property 7, R2.7)", () => {
  const OPERATOR_KEYS = ["operator_&&", "operator_||", "operator_|", "operator_;"];

  for (const preset of PRESETS) {
    it(`${preset}.json の labels.ja に 4つの operator_* キーが存在する`, () => {
      const json = readJson(path.join(STYLES_DIR, `${preset}.json`));
      const labels = (json.labels as Record<string, Record<string, unknown>>).ja;
      for (const key of OPERATOR_KEYS) {
        expect(labels, `${preset}: missing key ${key}`).toHaveProperty(key);
        expect(typeof labels[key], `${preset}: ${key} is not string`).toBe("string");
      }
    });
  }
});
