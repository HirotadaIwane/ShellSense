// ============================================================
// index.ts — ShellSense エントリポイント
// Claude Code PreToolUse フック（コマンド検知 + IPC のみ）
// ============================================================

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// --- stdin/stdout ヘルパー ---

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
    process.stdin.on("error", (err) => {
      reject(err);
    });
  });
}

function writeOutput(output: object): void {
  process.stdout.write(JSON.stringify(output));
}

// --- VSCode 拡張向け IPC ---

function writeNotificationFile(command: string): void {
  try {
    const filePath = path.join(os.tmpdir(), "shellsense-notify.json");
    fs.writeFileSync(filePath, JSON.stringify({ command, ts: Date.now() }));
  } catch {
    // 通知ファイル書き出し失敗は無視（メインフローをブロックしない）
  }
}

// --- 型ガード ---

function isHookInput(
  value: unknown
): value is { tool_name: string; tool_input?: { command?: string } } {
  return typeof value === "object" && value !== null && "tool_name" in value;
}

// --- メイン ---

async function main(): Promise<void> {
  try {
    const input = await readStdin();

    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch {
      process.stderr.write(`[ShellSense] Error: Invalid JSON input\n`);
      writeOutput({});
      return;
    }

    if (!isHookInput(parsed)) {
      writeOutput({});
      return;
    }

    if (parsed.tool_name !== "Bash") {
      writeOutput({});
      return;
    }

    const command = parsed.tool_input?.command;
    if (!command || command.trim() === "") {
      writeOutput({});
      return;
    }

    writeNotificationFile(command);

    // Claude Code には空 JSON を返す（説明は VSCode Notification のみ）
    writeOutput({});
  } catch (error) {
    process.stderr.write(`[ShellSense] Error: ${error}\n`);
    writeOutput({});
  }
}

main();
