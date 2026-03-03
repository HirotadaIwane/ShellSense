import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// --- 型定義 ---

interface HookHandler {
  type: string;
  command: string;
}

interface HookEntry {
  matcher: string;
  hooks: HookHandler[];
}

interface ClaudeSettings {
  hooks?: {
    PreToolUse?: HookEntry[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface FindResult {
  found: boolean;
  pathMatch: boolean;
  index: number;
}

// --- ヘルパー関数 ---

function buildHookEntry(hookJsPath: string): HookEntry {
  return {
    matcher: 'Bash',
    hooks: [
      {
        type: 'command',
        command: `node "${hookJsPath}"`,
      },
    ],
  };
}

function readSettings(settingsPath: string): ClaudeSettings | null {
  try {
    if (!fs.existsSync(settingsPath)) {
      return {};
    }
    const raw = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(raw) as ClaudeSettings;
  } catch {
    return null; // 不正 JSON
  }
}

function writeSettings(
  settingsPath: string,
  settings: ClaudeSettings
): void {
  const dir = path.dirname(settingsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
}

function findShellSenseHook(
  settings: ClaudeSettings,
  expectedPath: string
): FindResult {
  const preToolUse = settings?.hooks?.PreToolUse;
  if (!Array.isArray(preToolUse)) {
    return { found: false, pathMatch: false, index: -1 };
  }

  for (let i = 0; i < preToolUse.length; i++) {
    const cmd = preToolUse[i]?.hooks?.[0]?.command ?? '';
    if (cmd.includes('hook.js') && cmd.toLowerCase().includes('shellsense')) {
      const pathMatch = cmd.includes(expectedPath);
      return { found: true, pathMatch, index: i };
    }
  }
  return { found: false, pathMatch: false, index: -1 };
}

// --- メインエントリポイント ---

export async function registerHookIfNeeded(
  extensionPath: string
): Promise<void> {
  const hookJsPath = path.join(extensionPath, 'dist', 'hook.js');

  // hook.js が存在しない場合は何もしない
  if (!fs.existsSync(hookJsPath)) {
    return;
  }

  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const settings = readSettings(settingsPath);

  // 不正 JSON の場合
  if (settings === null) {
    vscode.window.showErrorMessage(
      'ShellSense: ~/.claude/settings.json の読み取りに失敗しました（不正なJSON）'
    );
    return;
  }

  const result = findShellSenseHook(settings, extensionPath);

  if (result.found && result.pathMatch) {
    // 登録済み・パス一致 → 何もしない
    return;
  }

  if (result.found && !result.pathMatch) {
    // 登録済み・パス不一致 → 自動更新
    settings.hooks!.PreToolUse![result.index] = buildHookEntry(hookJsPath);
    writeSettings(settingsPath, settings);
    vscode.window.showInformationMessage(
      'ShellSense: Claude Code フックパスを更新しました'
    );
    return;
  }

  // 未登録 → ユーザーに確認
  const answer = await vscode.window.showInformationMessage(
    'ShellSense: Claude Code フックを登録しますか？',
    'はい',
    'いいえ'
  );

  if (answer !== 'はい') {
    return;
  }

  // フック設定を追加
  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!Array.isArray(settings.hooks.PreToolUse)) {
    settings.hooks.PreToolUse = [];
  }
  settings.hooks.PreToolUse.push(buildHookEntry(hookJsPath));

  writeSettings(settingsPath, settings);
  vscode.window.showInformationMessage(
    'ShellSense: Claude Code フックを登録しました'
  );
}
