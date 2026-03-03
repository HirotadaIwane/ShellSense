// ============================================================
// deadCodeRemoval.test.ts — Phase 16 Unit 3 Bolt 1
// Property 1-3: デッドコード・旧型・import 不在検証
// ============================================================

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const srcDir = path.resolve(__dirname, "../../src");
const formatterSource = fs.readFileSync(
  path.join(srcDir, "formatter.ts"),
  "utf8"
);
const typesSource = fs.readFileSync(
  path.join(srcDir, "types.ts"),
  "utf8"
);
const notificationSource = fs.readFileSync(
  path.resolve(__dirname, "../../vscode-extension/src/notificationUtils.ts"),
  "utf8"
);

// ============================================================
// Property 1: デッドコード不在（formatter.ts）
// ============================================================

describe("Property 1: デッドコード不在（formatter.ts）", () => {
  it("Scenario 1.1: composeRiskFull が削除されている", () => {
    expect(formatterSource).not.toContain("composeRiskFull");
  });

  it("Scenario 1.2: composeRiskShort が削除されている", () => {
    expect(formatterSource).not.toContain("composeRiskShort");
  });

  it("Scenario 1.3: composeUnknownRisk が削除されている", () => {
    expect(formatterSource).not.toContain("composeUnknownRisk");
  });

  it("Scenario 1.4: renderGroup が削除されている", () => {
    expect(formatterSource).not.toContain("renderGroup");
  });

  it("Scenario 1.5: RenderContext が削除されている", () => {
    expect(formatterSource).not.toContain("RenderContext");
  });

  it("Scenario 1.6: @ts-expect-error Dead code コメントが削除されている", () => {
    expect(formatterSource).not.toContain("@ts-expect-error");
  });
});

// ============================================================
// Property 2: 旧型不在（types.ts）
// ============================================================

describe("Property 2: 旧型不在（types.ts）", () => {
  it("Scenario 2.1: LanguageLabels が削除されている", () => {
    expect(typesSource).not.toContain("LanguageLabels");
  });

  it("Scenario 2.2: LayoutGroupId が削除されている", () => {
    expect(typesSource).not.toContain("LayoutGroupId");
  });

  it("Scenario 2.3: RiskLabels が削除されている", () => {
    expect(typesSource).not.toMatch(/interface RiskLabels/);
  });
});

// ============================================================
// Property 3: import 整合性
// ============================================================

describe("Property 3: import 整合性", () => {
  it("Scenario 3.1: formatter.ts に LanguageLabels の参照がない", () => {
    expect(formatterSource).not.toContain("LanguageLabels");
  });

  it("Scenario 3.2: formatter.ts に LayoutGroupId の参照がない", () => {
    expect(formatterSource).not.toContain("LayoutGroupId");
  });
});

// ============================================================
// Property 4 (partial): notificationUtils に config.emoji 参照がない
// ============================================================

describe("Property 4 (partial): notificationUtils の旧構造参照不在", () => {
  it("Scenario 4.4: config.emoji を参照しない", () => {
    expect(notificationSource).not.toContain("config.emoji");
  });

  it("Scenario 4.4b: langLabels.risk を参照しない", () => {
    expect(notificationSource).not.toContain("langLabels.risk");
  });
});
