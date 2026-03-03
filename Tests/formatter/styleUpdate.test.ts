import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const stylesDir = path.join(__dirname, "..", "..", "config", "styles");
const styleNames = ["emoji", "legend", "ascii", "pro"];

// --- P22: 全スタイルの sudoNotice 対応 ---

describe("P22: 全スタイルの sudoNotice 対応", () => {
  for (const styleName of styleNames) {
    describe(`${styleName}.json`, () => {
      const filePath = path.join(stylesDir, `${styleName}.json`);
      const style = JSON.parse(fs.readFileSync(filePath, "utf8"));

      it("labels.ja に sudoNotice が定義されている", () => {
        expect(style.labels.ja.sudoNotice).toBeDefined();
        expect(typeof style.labels.ja.sudoNotice).toBe("string");
        expect(style.labels.ja.sudoNotice.length).toBeGreaterThan(0);
      });

      it("labels.en に sudoNotice が定義されている", () => {
        expect(style.labels.en.sudoNotice).toBeDefined();
        expect(typeof style.labels.en.sudoNotice).toBe("string");
        expect(style.labels.en.sudoNotice.length).toBeGreaterThan(0);
      });

      it("templates_long.singleCommand に {sudo} が含まれること", () => {
        const template = style.templates_long.singleCommand as string;
        expect(template).toContain("{sudo}");
        if (template.includes("{separator}")) {
          const sudoIdx = template.indexOf("{sudo}");
          const separatorIdx = template.indexOf("{separator}");
          expect(sudoIdx).toBeLessThan(separatorIdx);
        }
      });

      it("templates_long に {sudo} が含まれていること（chainSegment または chainHeader）", () => {
        const segment = style.templates_long.chainSegment as string;
        const header = style.templates_long.chainHeader as string;
        expect(segment.includes("{sudo}") || header.includes("{sudo}")).toBe(true);
      });
    });
  }
});
