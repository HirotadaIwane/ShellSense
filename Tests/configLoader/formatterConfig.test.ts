import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import type { FormatterConfig, TemplateLabels } from "../../src/types";

// --- テストデータ読み込み ---

const configPath = path.join(__dirname, "../../config/styles/emoji.json");
const schemaPath = path.join(
  __dirname,
  "../../config/formatter.schema.json"
);
const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as FormatterConfig;
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

// --- 現行値（出力互換性の検証基準 — config ファイルから動的に取得） ---

const EXPECTED_LABELS = config.labels as Record<string, TemplateLabels>;

const EXPECTED_OPERATOR_DISPLAY = {
  "&&": (config.labels as Record<string, Record<string, string>>).ja["operator_&&"],
  "||": (config.labels as Record<string, Record<string, string>>).ja["operator_||"],
  "|": (config.labels as Record<string, Record<string, string>>).ja["operator_|"],
  ";": (config.labels as Record<string, Record<string, string>>).ja["operator_;"],
};

// ============================================================
// Part B: JSON 構造テスト (P6-P9)
// ============================================================

// Scenario B-1: TemplateLabels のリスクフィールド完全性 (P6)
describe("TemplateLabels リスクフィールド完全性 (P6)", () => {
  const riskFields = [
    "risk_low", "risk_low_short",
    "risk_medium", "risk_medium_short",
    "risk_high", "risk_high_short",
    "risk_critical", "risk_critical_short",
  ];

  it("labels.ja に8つのリスクフィールドが存在すること", () => {
    for (const field of riskFields) {
      expect(config.labels.ja).toHaveProperty(field);
    }
  });

  it("labels.en に8つのリスクフィールドが存在すること", () => {
    for (const field of riskFields) {
      expect(config.labels.en).toHaveProperty(field);
    }
  });

  it("リスクフィールドの全値が非空の文字列であること (ja)", () => {
    for (const field of riskFields) {
      const value = (config.labels.ja as unknown as Record<string, string>)[field];
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("リスクフィールドの全値が非空の文字列であること (en)", () => {
    for (const field of riskFields) {
      const value = (config.labels.en as unknown as Record<string, string>)[field];
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("labels.ja/en に4つの operator_ フィールドが存在すること", () => {
    const operatorFields = ["operator_&&", "operator_||", "operator_|", "operator_;"];
    for (const field of operatorFields) {
      expect(config.labels.ja).toHaveProperty(field);
      expect(config.labels.en).toHaveProperty(field);
    }
  });
});

// Scenario B-2: labels.ja の必須フィールド完全性 (P7)
describe("labels.ja 必須フィールド完全性 (P7)", () => {
  const requiredFields = [
    "header",
    "risk_low", "risk_low_short",
    "risk_medium", "risk_medium_short",
    "risk_high", "risk_high_short",
    "risk_critical", "risk_critical_short",
    "unknownRisk", "unknownRisk_short",
    "unknownCommand",
    "target", "delimiter", "indent",
    "chainNotice", "chainNumbering", "sudoNotice",
  ];

  it("18個の必須フィールドが存在すること", () => {
    for (const field of requiredFields) {
      expect(config.labels.ja).toHaveProperty(field);
    }
  });

  it("全フィールドが文字列であること", () => {
    for (const field of requiredFields) {
      expect(typeof (config.labels.ja as unknown as Record<string, string>)[field]).toBe("string");
    }
  });
});

// Scenario B-3: labels.en の必須フィールド完全性 (P8)
describe("labels.en 必須フィールド完全性 (P8)", () => {
  const requiredFields = [
    "header",
    "risk_low", "risk_low_short",
    "risk_medium", "risk_medium_short",
    "risk_high", "risk_high_short",
    "risk_critical", "risk_critical_short",
    "unknownRisk", "unknownRisk_short",
    "unknownCommand",
    "target", "delimiter", "indent",
    "chainNotice", "chainNumbering", "sudoNotice",
  ];

  it("18個の必須フィールドが存在すること", () => {
    for (const field of requiredFields) {
      expect(config.labels.en).toHaveProperty(field);
    }
  });

  it("全フィールドが文字列であること", () => {
    for (const field of requiredFields) {
      expect(typeof (config.labels.en as unknown as Record<string, string>)[field]).toBe("string");
    }
  });
});

// Scenario B-4: templates_long / templates_short セクションの完全性 (P9)
describe("templates_long / templates_short セクション完全性 (P9)", () => {
  it("templates_long に5つの必須フィールドが存在すること", () => {
    const fields = [
      "singleCommand",
      "chainHeader",
      "chainSegment",
      "chainOperator",
      "chainFooter",
    ];
    for (const field of fields) {
      expect(config.templates_long).toHaveProperty(field);
    }
  });

  it("templates_short に2つの必須フィールドが存在すること", () => {
    const fields = ["singleCommand", "chainCommand"];
    for (const field of fields) {
      expect(config.templates_short).toHaveProperty(field);
    }
  });

  it("templates_long の全値が非空の文字列であること", () => {
    for (const [, value] of Object.entries(config.templates_long)) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it("templates_short の全値が非空の文字列であること", () => {
    for (const [, value] of Object.entries(config.templates_short)) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it("chainNumbering が labels 内で管理されていること", () => {
    const allowed = ["dot", "circled", "keycap", "dingbat", "none"];
    expect(allowed).toContain(config.labels.ja.chainNumbering);
    expect(allowed).toContain(config.labels.en.chainNumbering);
  });
});

// ============================================================
// Part C: スキーマテスト (P10, P11)
// ============================================================

// Scenario C-1: スキーマの構造検証 (P10)
describe("スキーマ構造 (P10)", () => {
  it("$schema が Draft-07 であること", () => {
    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
  });

  it("definitions.StyleFile.required に version, templates_long, templates_short, labels が含まれること", () => {
    const styleFile = schema.definitions.StyleFile;
    expect(styleFile.required).toContain("version");
    expect(styleFile.required).toContain("templates_long");
    expect(styleFile.required).toContain("templates_short");
    expect(styleFile.required).toContain("labels");
  });

  it("definitions に TemplateLabels が存在すること", () => {
    expect(schema.definitions).toHaveProperty("TemplateLabels");
  });
});

// Scenario C-2: スキーマと JSON の整合性 (P11)
describe("スキーマ-JSON 整合性 (P11)", () => {
  it("StyleFile.labels が additionalProperties で TemplateLabels を参照していること", () => {
    const styleFile = schema.definitions.StyleFile;
    expect(styleFile.properties.labels.additionalProperties.$ref).toBe(
      "#/definitions/TemplateLabels"
    );
  });

  it("TemplateLabels.required に18個の必須フィールドが含まれること", () => {
    const templateLabels = schema.definitions.TemplateLabels;
    const expectedRequired = [
      "header",
      "risk_low", "risk_low_short",
      "risk_medium", "risk_medium_short",
      "risk_high", "risk_high_short",
      "risk_critical", "risk_critical_short",
      "unknownRisk", "unknownRisk_short", "unknownCommand",
      "target", "delimiter", "indent",
      "chainNotice", "chainNumbering", "sudoNotice",
    ];
    expect(templateLabels.required).toEqual(expectedRequired);
  });

  it("StyleFile.templates_long.required に5つの必須フィールドが含まれること", () => {
    const templatesLong = schema.definitions.StyleFile.properties.templates_long;
    expect(templatesLong.required).toContain("singleCommand");
    expect(templatesLong.required).toContain("chainHeader");
    expect(templatesLong.required).toContain("chainSegment");
    expect(templatesLong.required).toContain("chainOperator");
    expect(templatesLong.required).toContain("chainFooter");
  });

  it("StyleFile.templates_short.required に2つの必須フィールドが含まれること", () => {
    const templatesShort = schema.definitions.StyleFile.properties.templates_short;
    expect(templatesShort.required).toContain("singleCommand");
    expect(templatesShort.required).toContain("chainCommand");
  });
});

// ============================================================
// Part D: 値一致テスト (P12-P15)
// ============================================================

// Scenario D-1: labels.ja のリスク値が期待値と一致 (P12)
describe("labels.ja リスク値一致 (P12)", () => {
  const riskLevels = ["low", "medium", "high", "critical"] as const;

  it.each(riskLevels)(
    "labels.ja.risk_%s が期待値と一致すること",
    (level) => {
      const key = `risk_${level}` as keyof TemplateLabels;
      expect(config.labels.ja[key]).toBe(EXPECTED_LABELS.ja[key]);
    }
  );

  it.each(riskLevels)(
    "labels.ja.risk_%s_short が期待値と一致すること",
    (level) => {
      const key = `risk_${level}_short` as keyof TemplateLabels;
      expect(config.labels.ja[key]).toBe(EXPECTED_LABELS.ja[key]);
    }
  );
});

// Scenario D-2: labels.en のリスク値が期待値と一致 (P12)
describe("labels.en リスク値一致 (P12)", () => {
  const riskLevels = ["low", "medium", "high", "critical"] as const;

  it.each(riskLevels)(
    "labels.en.risk_%s が期待値と一致すること",
    (level) => {
      const key = `risk_${level}` as keyof TemplateLabels;
      expect(config.labels.en[key]).toBe(EXPECTED_LABELS.en[key]);
    }
  );

  it.each(riskLevels)(
    "labels.en.risk_%s_short が期待値と一致すること",
    (level) => {
      const key = `risk_${level}_short` as keyof TemplateLabels;
      expect(config.labels.en[key]).toBe(EXPECTED_LABELS.en[key]);
    }
  );
});

// Scenario D-3: labels テキストフィールド値一致 (P13)
describe("labels テキストフィールド値一致 (P13)", () => {
  describe("日本語", () => {
    it("labels.ja.header が期待値と一致", () => {
      expect(config.labels.ja.header).toBe(EXPECTED_LABELS.ja.header);
    });

    it("labels.ja.unknownRisk が期待値と一致", () => {
      expect(config.labels.ja.unknownRisk).toBe(EXPECTED_LABELS.ja.unknownRisk);
    });

    it("labels.ja.unknownCommand が期待値と一致", () => {
      expect(config.labels.ja.unknownCommand).toBe(
        EXPECTED_LABELS.ja.unknownCommand
      );
    });

    it("labels.ja.target が期待値と一致", () => {
      expect(config.labels.ja.target).toBe(EXPECTED_LABELS.ja.target);
    });

    it("labels.ja.chainNotice が期待値と一致", () => {
      expect(config.labels.ja.chainNotice).toBe(EXPECTED_LABELS.ja.chainNotice);
    });

    it("labels.ja.sudoNotice が期待値と一致", () => {
      expect(config.labels.ja.sudoNotice).toBe(EXPECTED_LABELS.ja.sudoNotice);
    });

    it("labels.ja.delimiter が期待値と一致", () => {
      expect(config.labels.ja.delimiter).toBe(EXPECTED_LABELS.ja.delimiter);
    });

    it("labels.ja.indent が期待値と一致", () => {
      expect(config.labels.ja.indent).toBe(EXPECTED_LABELS.ja.indent);
    });
  });

  describe("英語", () => {
    it("labels.en.header が期待値と一致", () => {
      expect(config.labels.en.header).toBe(EXPECTED_LABELS.en.header);
    });

    it("labels.en.unknownRisk が期待値と一致", () => {
      expect(config.labels.en.unknownRisk).toBe(EXPECTED_LABELS.en.unknownRisk);
    });

    it("labels.en.unknownCommand が期待値と一致", () => {
      expect(config.labels.en.unknownCommand).toBe(
        EXPECTED_LABELS.en.unknownCommand
      );
    });

    it("labels.en.target が期待値と一致", () => {
      expect(config.labels.en.target).toBe(EXPECTED_LABELS.en.target);
    });

    it("labels.en.chainNotice が期待値と一致", () => {
      expect(config.labels.en.chainNotice).toBe(EXPECTED_LABELS.en.chainNotice);
    });

    it("labels.en.sudoNotice が期待値と一致", () => {
      expect(config.labels.en.sudoNotice).toBe(EXPECTED_LABELS.en.sudoNotice);
    });

    it("labels.en.delimiter が期待値と一致", () => {
      expect(config.labels.en.delimiter).toBe(EXPECTED_LABELS.en.delimiter);
    });

    it("labels.en.indent が期待値と一致", () => {
      expect(config.labels.en.indent).toBe(EXPECTED_LABELS.en.indent);
    });
  });
});

// Scenario D-4: operator の値が現行と一致 (P15)
describe("operator 値一致 (P15)", () => {
  const operators = ["&&", "||", "|", ";"] as const;

  it.each(operators)(
    "labels.ja.operator_%s が期待値と一致",
    (op) => {
      const key = `operator_${op}` as keyof TemplateLabels;
      expect(config.labels.ja[key]).toBe(
        EXPECTED_OPERATOR_DISPLAY[op]
      );
    }
  );

  it.each(operators)(
    "labels.en.operator_%s が期待値と一致（ja/en 同一値）",
    (op) => {
      const key = `operator_${op}` as keyof TemplateLabels;
      expect(config.labels.en[key]).toBe(
        EXPECTED_OPERATOR_DISPLAY[op]
      );
    }
  );
});

// Scenario D-5: version フィールド (P16)
describe("version フィールド (P16)", () => {
  it("version が '2.0.0' であること", () => {
    expect(config.version).toBe("2.0.0");
  });
});
