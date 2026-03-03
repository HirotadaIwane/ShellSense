// ============================================================
// parser.ts — ShellSense コマンドパーサー
// ============================================================

import { ParsedCommand, ParsedChain } from "./types";

const DEFAULT_SUBCOMMAND_COMMANDS = ["git", "npm", "pip"];
const CHAIN_OPERATORS = ["||", "&&", "|", ";"];
const MAX_SHORT_FLAG_LENGTH = 2;

// --- 公開 API ---

export function parse(
  commandString: string,
  subcommandCommands?: string[]
): ParsedCommand {
  const raw = commandString;

  // 空文字列の安全処理
  if (raw.trim() === "") {
    return {
      raw,
      commandName: "",
      subcommand: null,
      flags: [],
      args: [],
      hasChain: false,
      chainOperator: null,
      hasSudo: false,
    };
  }

  // チェーン演算子の検出
  const chain = detectChain(raw);
  const target = chain.before;

  // トークン分割（引用符対応）
  const tokens = tokenize(target);

  let idx = 0;

  // 環境変数プレフィックスのスキップ
  while (idx < tokens.length && isEnvVar(tokens[idx])) {
    idx++;
  }

  // sudo プレフィックスの検出
  let hasSudo = false;
  if (idx < tokens.length && tokens[idx] === "sudo") {
    hasSudo = true;
    idx++;
  }

  // コマンド名の抽出
  const commandName =
    idx < tokens.length ? extractBasename(tokens[idx]) : "";
  idx++;

  // サブコマンド・フラグ・引数の分類
  let subcommand: string | null = null;
  const flags: string[] = [];
  const args: string[] = [];

  // サブコマンドの検出（フラグでない最初のトークン）
  if (
    (subcommandCommands ?? DEFAULT_SUBCOMMAND_COMMANDS).includes(commandName) &&
    idx < tokens.length &&
    !tokens[idx].startsWith("-")
  ) {
    subcommand = tokens[idx];
    idx++;
  }

  // 残りのトークンをフラグと引数に分類
  let skipNext = false;
  for (let i = idx; i < tokens.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    const token = tokens[i];

    if (token.startsWith("--")) {
      // ロングフラグ
      flags.push(token);
    } else if (token.startsWith("-")) {
      // ショートフラグ（結合フラグ展開）
      const expanded = expandFlags(token);
      flags.push(...expanded);

      // -m のような値を取るフラグ: 次のトークンを引数に
      if (
        expanded.length === 1 &&
        i + 1 < tokens.length &&
        !tokens[i + 1].startsWith("-")
      ) {
        args.push(tokens[i + 1]);
        skipNext = true;
      }
    } else {
      args.push(token);
    }
  }

  return {
    raw,
    commandName,
    subcommand,
    flags,
    args,
    hasChain: chain.hasChain,
    chainOperator: chain.operator,
    hasSudo,
  };
}

// --- 内部ヘルパー ---

/**
 * クォート外の文字位置でのみコールバックを呼ぶスキャナ。
 * コールバックの戻り値: true で早期終了、数値でその文字数分スキップ。
 */
export function scanOutsideQuotes(
  input: string,
  onChar: (ch: string, index: number, input: string) => boolean | number | void
): void {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (inSingle || inDouble) continue;

    const result = onChar(ch, i, input);
    if (result === true) return;
    if (typeof result === "number") {
      i += result - 1;
    }
  }
}

function detectChain(
  input: string
): { before: string; hasChain: boolean; operator: string | null } {
  let result = { before: input, hasChain: false, operator: null as string | null };
  scanOutsideQuotes(input, (_ch, i, inp) => {
    for (const op of CHAIN_OPERATORS) {
      if (inp.substring(i, i + op.length) === op) {
        result = { before: inp.substring(0, i).trim(), hasChain: true, operator: op };
        return true;
      }
    }
  });
  return result;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let state: "NORMAL" | "IN_SINGLE_QUOTE" | "IN_DOUBLE_QUOTE" = "NORMAL";

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    switch (state) {
      case "NORMAL":
        if (ch === " " || ch === "\t") {
          if (current.length > 0) {
            tokens.push(current);
            current = "";
          }
        } else if (ch === "'") {
          state = "IN_SINGLE_QUOTE";
        } else if (ch === '"') {
          state = "IN_DOUBLE_QUOTE";
        } else {
          current += ch;
        }
        break;

      case "IN_SINGLE_QUOTE":
        if (ch === "'") {
          state = "NORMAL";
        } else {
          current += ch;
        }
        break;

      case "IN_DOUBLE_QUOTE":
        if (ch === '"') {
          state = "NORMAL";
        } else {
          current += ch;
        }
        break;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

function extractBasename(token: string): string {
  const lastSlash = Math.max(token.lastIndexOf("/"), token.lastIndexOf("\\"));
  return lastSlash >= 0 ? token.substring(lastSlash + 1) : token;
}

function expandFlags(token: string): string[] {
  // "-rf" → ["-r", "-f"]、"-v" → ["-v"]
  if (token.length <= MAX_SHORT_FLAG_LENGTH) {
    return [token];
  }
  const chars = token.substring(1);
  return chars.split("").map((c) => `-${c}`);
}

function isEnvVar(token: string): boolean {
  return token.includes("=") && !token.startsWith("-");
}

// --- チェーン全分割 ---

function splitChain(
  input: string
): { command: string; operator: string | null }[] {
  const results: { command: string; operator: string | null }[] = [];
  let lastSplit = 0;
  let currentOperator: string | null = null;

  scanOutsideQuotes(input, (_ch, i, inp) => {
    for (const op of CHAIN_OPERATORS) {
      if (inp.substring(i, i + op.length) === op) {
        results.push({ command: inp.substring(lastSplit, i).trim(), operator: currentOperator });
        currentOperator = op;
        lastSplit = i + op.length;
        return op.length;
      }
    }
  });

  // 最後のセグメント
  results.push({ command: input.substring(lastSplit).trim(), operator: currentOperator });

  return results;
}

export function parseChain(
  commandString: string,
  subcommandCommands?: string[]
): ParsedChain {
  const raw = commandString;
  const splits = splitChain(raw);

  const segments = splits.map((s) => ({
    parsed: parse(s.command, subcommandCommands),
    operator: s.operator,
  }));

  return {
    raw,
    segments,
    isChain: segments.length > 1,
  };
}
