// ============================================================
// dictionaryLoader.ts — 辞書ファイルの読み込み・マージ
// ============================================================

import fs from "fs";
import path from "path";
import type { CommandEntry, DictionaryFile, DictionaryLayer, LoaderResult } from "./types";

const LAYER_ORDER: DictionaryLayer[] = ["core", "os", "tools"];

/**
 * 指定ディレクトリ内の .json ファイル一覧を返す。
 * schema.json を除外し、ファイル名のアルファベット順にソートする。
 * ディレクトリが存在しない場合は空配列を返す。
 */
function scanDirectory(dirPath: string): string[] {
  try {
    return fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".json") && f !== "schema.json")
      .sort();
  } catch {
    return [];
  }
}

/**
 * 1つの JSON ファイルを読み込み、DictionaryFile としてパースする。
 * 失敗時は null を返し、stderr に警告を出力する。
 */
function loadSingleFile(filePath: string): DictionaryFile | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    if (!json.commands || typeof json.commands !== "object" || Array.isArray(json.commands)) {
      process.stderr.write(
        `[ShellSense] Warning: No "commands" key in ${filePath}\n`
      );
      return null;
    }
    return json as DictionaryFile;
  } catch (error) {
    process.stderr.write(
      `[ShellSense] Warning: Failed to load ${filePath}: ${error}\n`
    );
    return null;
  }
}

/**
 * commands をアキュムレータにマージする。
 * 重複キーは stderr に警告を出力し、先の定義を維持する。
 */
function mergeCommands(
  accumulator: Record<string, CommandEntry>,
  newCommands: Record<string, CommandEntry>,
  sourceFile: string
): void {
  for (const key of Object.keys(newCommands)) {
    if (key in accumulator) {
      process.stderr.write(
        `[ShellSense] Warning: Duplicate command key "${key}" in ${sourceFile}, keeping earlier definition\n`
      );
    } else {
      accumulator[key] = newCommands[key];
    }
  }
}

/**
 * dictionary/ 配下の全 JSON ファイルを読み込み、コマンドをマージして返す。
 * 例外をスローしない。エラー時は空の commands を含む LoaderResult を返す。
 */
export function loadDictionary(dictionaryDir?: string): LoaderResult {
  try {
    const startTime = Date.now();
    const dir = dictionaryDir ?? path.join(__dirname, "..", "dictionary");
    const commands: Record<string, CommandEntry> = {};
    let filesLoaded = 0;

    for (const layer of LAYER_ORDER) {
      const layerDir = path.join(dir, layer);
      const files = scanDirectory(layerDir);
      for (const file of files) {
        const filePath = path.join(layerDir, file);
        const dictFile = loadSingleFile(filePath);
        if (dictFile) {
          mergeCommands(commands, dictFile.commands, filePath);
          filesLoaded++;
        }
      }
    }

    return {
      commands,
      metadata: {
        totalCommands: Object.keys(commands).length,
        filesLoaded,
        loadTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    process.stderr.write(
      `[ShellSense] Warning: Unexpected error in loadDictionary: ${error}\n`
    );
    return {
      commands: {},
      metadata: {
        totalCommands: 0,
        filesLoaded: 0,
        loadTimeMs: 0,
      },
    };
  }
}
