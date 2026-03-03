import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import { loadDictionary } from "../../src/dictionaryLoader";

// フィクスチャパス
const FIXTURES_DIR = path.join(__dirname, "fixtures");
const VALID_DIR = path.join(FIXTURES_DIR, "valid");
const DUPLICATE_DIR = path.join(FIXTURES_DIR, "duplicate");
const MALFORMED_DIR = path.join(FIXTURES_DIR, "malformed");
const MISSING_COMMANDS_DIR = path.join(FIXTURES_DIR, "missing-commands");
const WITH_SCHEMA_DIR = path.join(FIXTURES_DIR, "with-schema");
const ARRAY_COMMANDS_DIR = path.join(FIXTURES_DIR, "array-commands");

// stderr スパイ
let stderrSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
});

afterEach(() => {
  stderrSpy.mockRestore();
});

// --- P3: 基本マージ ---
describe("基本マージ（P3, US-3）", () => {
  it("複数ファイルのコマンドが1つの Record にマージされること", () => {
    const result = loadDictionary(VALID_DIR);
    expect(Object.keys(result.commands)).toHaveLength(3);
    expect(result.commands["testcmd1"]).toBeDefined();
    expect(result.commands["testcmd2"]).toBeDefined();
    expect(result.commands["testtool1"]).toBeDefined();
  });

  it("各コマンドの属性が正しく保持されること", () => {
    const result = loadDictionary(VALID_DIR);
    expect(result.commands["testcmd1"].baseRisk).toBe("low");
    expect(result.commands["testcmd1"].category).toBe("filesystem");
    expect(result.commands["testcmd2"].baseRisk).toBe("medium");
    expect(result.commands["testcmd2"].category).toBe("text");
    expect(result.commands["testtool1"].baseRisk).toBe("high");
    expect(result.commands["testtool1"].category).toBe("container");
  });
});

// --- P4: schema.json 除外 ---
describe("schema.json 除外（P4, US-3）", () => {
  it("schema.json がコマンドとしてロードされないこと", () => {
    const result = loadDictionary(WITH_SCHEMA_DIR);
    expect(result.commands["schemacmd"]).toBeDefined();
    expect(Object.keys(result.commands)).toHaveLength(1);
  });

  it("filesLoaded が schema.json を除外した数であること", () => {
    const result = loadDictionary(WITH_SCHEMA_DIR);
    expect(result.metadata.filesLoaded).toBe(1);
  });
});

// --- P5: カスタムパス ---
describe("カスタムパス（P5, US-3）", () => {
  it("指定パスからロードすること", () => {
    const result = loadDictionary(VALID_DIR);
    expect(result.metadata.filesLoaded).toBeGreaterThan(0);
    expect(result.commands["testcmd1"]).toBeDefined();
  });
});

// --- P6: 読み込み順序 ---
describe("読み込み順序（P6, US-4）", () => {
  it("core → os → tools の順で読み込まれること", () => {
    const result = loadDictionary(VALID_DIR);
    // core/test-commands.json が先、tools/test-tools.json が後に読み込まれる
    // 両方のコマンドがマージ結果に含まれること
    expect(result.commands["testcmd1"]).toBeDefined();
    expect(result.commands["testtool1"]).toBeDefined();
  });
});

// --- P7: キー重複警告 ---
describe("キー重複処理（P7, US-4）", () => {
  it("重複時に先読み定義（core）が採用されること", () => {
    const result = loadDictionary(DUPLICATE_DIR);
    expect(result.commands["dupcmd"]).toBeDefined();
    expect(result.commands["dupcmd"].baseRisk).toBe("low"); // core/a.json の定義
  });

  it("重複時に stderr に警告が出力されること", () => {
    loadDictionary(DUPLICATE_DIR);
    const stderrOutput = stderrSpy.mock.calls
      .map((call) => String(call[0]))
      .join("");
    expect(stderrOutput).toContain("dupcmd");
  });

  it("重複があっても totalCommands は一意なキー数であること", () => {
    const result = loadDictionary(DUPLICATE_DIR);
    expect(result.metadata.totalCommands).toBe(1);
  });
});

// --- P8: ディレクトリ不在耐性 ---
describe("ディレクトリ不在耐性（P8, US-5）", () => {
  it("存在しないディレクトリで空 LoaderResult を返すこと", () => {
    const result = loadDictionary("/non/existent/path/that/does/not/exist");
    expect(result.commands).toEqual({});
    expect(result.metadata.totalCommands).toBe(0);
    expect(result.metadata.filesLoaded).toBe(0);
  });

  it("例外がスローされないこと", () => {
    expect(() =>
      loadDictionary("/non/existent/path/that/does/not/exist")
    ).not.toThrow();
  });
});

// --- P9: 不正JSON耐性 ---
describe("不正JSON耐性（P9, US-5）", () => {
  it("不正JSONファイルでも例外がスローされないこと", () => {
    expect(() => loadDictionary(MALFORMED_DIR)).not.toThrow();
  });

  it("不正JSONファイルに対して stderr に警告が出力されること", () => {
    loadDictionary(MALFORMED_DIR);
    const stderrOutput = stderrSpy.mock.calls
      .map((call) => String(call[0]))
      .join("");
    expect(stderrOutput).toContain("Warning");
  });
});

// --- P10: commands キー欠損耐性 ---
describe("commands キー欠損耐性（P10, US-5）", () => {
  it("commands キーがないファイルをスキップすること", () => {
    const result = loadDictionary(MISSING_COMMANDS_DIR);
    expect(result.commands).toEqual({});
    expect(result.metadata.totalCommands).toBe(0);
  });

  it("commands 欠損に対して stderr に警告が出力されること", () => {
    loadDictionary(MISSING_COMMANDS_DIR);
    const stderrOutput = stderrSpy.mock.calls
      .map((call) => String(call[0]))
      .join("");
    expect(stderrOutput).toContain("commands");
  });

  it("例外がスローされないこと", () => {
    expect(() => loadDictionary(MISSING_COMMANDS_DIR)).not.toThrow();
  });
});

// --- P10 補足: commands が配列の場合 ---
describe("commands が配列の場合（P10 補足）", () => {
  it("commands が配列のファイルをスキップすること", () => {
    const result = loadDictionary(ARRAY_COMMANDS_DIR);
    expect(result.commands).toEqual({});
    expect(result.metadata.totalCommands).toBe(0);
  });

  it("commands が配列の場合に stderr に警告が出力されること", () => {
    loadDictionary(ARRAY_COMMANDS_DIR);
    const stderrOutput = stderrSpy.mock.calls
      .map((call) => String(call[0]))
      .join("");
    expect(stderrOutput).toContain("commands");
  });
});

// --- P12: 例外安全性 ---
describe("例外安全性（P12, US-5）", () => {
  it("loadDictionary() は決して例外をスローしないこと", () => {
    // 各種異常パターンで例外が出ないことを確認
    expect(() => loadDictionary("/non/existent")).not.toThrow();
    expect(() => loadDictionary(MALFORMED_DIR)).not.toThrow();
    expect(() => loadDictionary(MISSING_COMMANDS_DIR)).not.toThrow();
    expect(() => loadDictionary(DUPLICATE_DIR)).not.toThrow();
  });

  it("常に有効な LoaderResult 構造を返すこと", () => {
    const result = loadDictionary("/non/existent");
    expect(result).toHaveProperty("commands");
    expect(result).toHaveProperty("metadata");
    expect(result.metadata).toHaveProperty("totalCommands");
    expect(result.metadata).toHaveProperty("filesLoaded");
    expect(result.metadata).toHaveProperty("loadTimeMs");
  });
});

// --- P11: メタデータ正確性 ---
describe("メタデータ正確性（P11, US-6）", () => {
  it("totalCommands がマージ後のコマンド数と一致すること", () => {
    const result = loadDictionary(VALID_DIR);
    expect(result.metadata.totalCommands).toBe(3);
    expect(result.metadata.totalCommands).toBe(
      Object.keys(result.commands).length
    );
  });

  it("filesLoaded が実際に読み込んだファイル数と一致すること", () => {
    const result = loadDictionary(VALID_DIR);
    expect(result.metadata.filesLoaded).toBe(2);
  });

  it("loadTimeMs が 0 以上であること", () => {
    const result = loadDictionary(VALID_DIR);
    expect(result.metadata.loadTimeMs).toBeGreaterThanOrEqual(0);
  });
});
