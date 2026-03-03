import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { makeParsed } from "../helpers/factories";
import { formatExplanation } from "../../src/formatter";
import { assessRisk } from "../../src/riskAssessor";
import {
  getFormatterConfig,
  setFormatterConfig,
  resetFormatterConfig,
} from "../../src/configLoader";
import {
  RiskLevel,
  type CommandEntry,
  type SegmentData,
  type FormatterConfig,
} from "../../src/types";

// ============================================================
// sudoNotice（P8-P10）— 4 it
// ============================================================

describe("sudoNotice", () => {
  const rmEntry: CommandEntry = {
    name: "rm",
    description: { ja: "削除", en: "Remove" },
    baseRisk: RiskLevel.High,
    category: "filesystem",
  };

  beforeEach(() => resetFormatterConfig());
  afterEach(() => resetFormatterConfig());

  // --- P8: sudoNotice 表示 ---

  describe("P8: sudoNotice 表示", () => {
    it("hasSudo=true かつ sudoNotice ラベルあり → 通知行が出力される", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: true,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.Critical },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.Critical, {
        format: "detailed",
        language: "ja",
      });
      expect(result).toContain(getFormatterConfig().labels.ja.sudoNotice);
    });

    it("en 言語でも sudoNotice が表示される", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: true,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.Critical },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.Critical, {
        format: "detailed",
        language: "en",
      });
      expect(result).toContain(getFormatterConfig().labels.en.sudoNotice);
    });
  });

  // --- P9: sudoNotice 非表示（hasSudo=false） ---

  describe("P9: sudoNotice 非表示（hasSudo=false）", () => {
    it("hasSudo=false → sudoNotice は出力されない", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: false,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.High },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.High, {
        format: "detailed",
        language: "ja",
      });
      expect(result).not.toContain("sudo:");
    });
  });

  // --- P10: sudoNotice 非表示（ラベル未定義） ---

  describe("P10: sudoNotice 非表示（ラベル未定義）", () => {
    it("labels.sudoNotice が undefined → sudoNotice は出力されない", () => {
      const config = getFormatterConfig();
      const noSudoConfig: FormatterConfig = {
        ...config,
        labels: {
          ja: { ...config.labels["ja"], sudoNotice: undefined },
          en: { ...config.labels["en"], sudoNotice: undefined },
        },
      };
      setFormatterConfig(noSudoConfig);

      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: true,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.Critical },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.Critical, {
        format: "detailed",
        language: "ja",
      });
      expect(result).not.toContain("sudo:");
    });
  });
});

// ============================================================
// sudoPrefix（P11-P13）— 5 it
// ============================================================

describe("sudoPrefix", () => {
  const rmEntry: CommandEntry = {
    name: "rm",
    description: { ja: "削除", en: "Remove" },
    baseRisk: RiskLevel.High,
    category: "filesystem",
  };

  const gitEntry: CommandEntry = {
    name: "git",
    description: { ja: "Git", en: "Git" },
    baseRisk: RiskLevel.Low,
    category: "git",
    subcommands: {
      push: {
        description: { ja: "プッシュ", en: "Push" },
        riskOverride: RiskLevel.Medium,
      },
    },
  };

  beforeEach(() => resetFormatterConfig());
  afterEach(() => resetFormatterConfig());

  // --- P11: sudo プレフィックス（detailed） ---

  describe("P11: sudo プレフィックス（detailed）", () => {
    it("hasSudo=true → commandDescription に 'sudo rm' が含まれる", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: true,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.Critical },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.Critical, {
        format: "detailed",
        language: "ja",
      });
      expect(result).toContain("sudo rm");
    });

    it("hasSudo=true + サブコマンド → 'sudo git push' が含まれる", () => {
      const parsed = makeParsed({
        commandName: "git",
        subcommand: "push",
        hasSudo: true,
      });
      const segments: SegmentData[] = [
        { parsed, entry: gitEntry, risk: RiskLevel.High },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.High, {
        format: "detailed",
        language: "ja",
      });
      expect(result).toContain("sudo git push");
    });
  });

  // --- P12: sudo プレフィックス（compact） ---

  describe("P12: sudo プレフィックス（compact）", () => {
    it("compact 形式でも 'sudo rm' が含まれる", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: true,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.Critical },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.Critical, {
        format: "compact",
        language: "ja",
      });
      expect(result).toContain("sudo rm");
    });
  });

  // --- P13: sudo プレフィックスなし ---

  describe("P13: sudo プレフィックスなし", () => {
    it("hasSudo=false → 'sudo ' プレフィックスは付加されない（detailed）", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: false,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.High },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.High, {
        format: "detailed",
        language: "ja",
      });
      expect(result).not.toContain("sudo rm");
      expect(result).toContain("rm");
    });

    it("hasSudo=false → 'sudo ' プレフィックスは付加されない（compact）", () => {
      const parsed = makeParsed({
        commandName: "rm",
        args: ["file.txt"],
        hasSudo: false,
      });
      const segments: SegmentData[] = [
        { parsed, entry: rmEntry, risk: RiskLevel.High },
      ];
      const result = formatExplanation(segments, [null], RiskLevel.High, {
        format: "compact",
        language: "ja",
      });
      expect(result).not.toContain("sudo rm");
      expect(result).toContain("rm");
    });
  });
});

// ============================================================
// sudoEscalation（P14-P18）— 5 it
// ============================================================

describe("sudoEscalation", () => {
  const lowEntry: CommandEntry = {
    name: "ls",
    description: { ja: "一覧表示", en: "List" },
    baseRisk: RiskLevel.Low,
    category: "filesystem",
  };

  const mediumEntry: CommandEntry = {
    name: "cp",
    description: { ja: "コピー", en: "Copy" },
    baseRisk: RiskLevel.Medium,
    category: "filesystem",
  };

  const highEntry: CommandEntry = {
    name: "rm",
    description: { ja: "削除", en: "Remove" },
    baseRisk: RiskLevel.High,
    category: "filesystem",
  };

  const criticalEntry: CommandEntry = {
    name: "dd",
    description: { ja: "ディスクコピー", en: "Disk copy" },
    baseRisk: RiskLevel.Critical,
    category: "system",
  };

  // --- P14: sudo Low → High ---

  describe("P14: sudo リスク昇格（Low → High）", () => {
    it("sudo ls → high", () => {
      const parsed = makeParsed({
        commandName: "ls",
        hasSudo: true,
      });
      expect(assessRisk(parsed, lowEntry)).toBe(RiskLevel.High);
    });
  });

  // --- P15: sudo Medium → High ---

  describe("P15: sudo リスク昇格（Medium → High）", () => {
    it("sudo cp → high", () => {
      const parsed = makeParsed({
        commandName: "cp",
        hasSudo: true,
      });
      expect(assessRisk(parsed, mediumEntry)).toBe(RiskLevel.High);
    });
  });

  // --- P16: sudo High → Critical ---

  describe("P16: sudo リスク昇格（High → Critical）", () => {
    it("sudo rm → critical", () => {
      const parsed = makeParsed({
        commandName: "rm",
        hasSudo: true,
      });
      expect(assessRisk(parsed, highEntry)).toBe(RiskLevel.Critical);
    });
  });

  // --- P17: sudo Critical → Critical ---

  describe("P17: sudo リスク昇格（Critical → Critical）", () => {
    it("sudo dd → critical（変化なし）", () => {
      const parsed = makeParsed({
        commandName: "dd",
        hasSudo: true,
      });
      expect(assessRisk(parsed, criticalEntry)).toBe(RiskLevel.Critical);
    });
  });

  // --- P18: sudo なしの非昇格 ---

  describe("P18: sudo なしの非昇格", () => {
    it("ls（sudo なし）→ low のまま", () => {
      const parsed = makeParsed({
        commandName: "ls",
        hasSudo: false,
      });
      expect(assessRisk(parsed, lowEntry)).toBe(RiskLevel.Low);
    });
  });
});
