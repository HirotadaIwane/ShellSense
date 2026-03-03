import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadDictionary } from '../../src/dictionaryLoader';
import { initFormatterConfig } from '../../src/configLoader';
import { parseChain } from '../../src/parser';
import { assessRisk, maxRisk } from '../../src/riskAssessor';
import { CommandEntry, ExplanationFormat, RiskLevel, SegmentData, SupportedLanguage } from '../../src/types';
import { meetsMinRisk } from '../../src/riskAssessor';
import { resolveCompoundSubcommand, formatExplanation } from '../../src/formatter';
import { registerHookIfNeeded } from './hookRegistrar';

let dictionary: Record<string, CommandEntry> = {};
let subcommandCommands: string[] = [];

const NOTIFY_FILE = path.join(os.tmpdir(), 'shellsense-notify.json');
let lastNotifyTs = 0;

function showNotification(message: string, risk: RiskLevel): void {
  switch (risk) {
    case RiskLevel.Critical:
      vscode.window.showErrorMessage(message);
      break;
    case RiskLevel.High:
      vscode.window.showWarningMessage(message);
      break;
    default:
      vscode.window.showInformationMessage(message);
      break;
  }
}

function processAndNotify(commandLine: string, enabledKey: string): void {
  const config = vscode.workspace.getConfiguration('shellsense');
  if (!config.get<boolean>('enabled', true)) return;
  if (!config.get<boolean>(enabledKey, true)) return;

  const language = config.get<string>('language', 'ja') as SupportedLanguage;
  const minRiskLevel = config.get<string>('minRiskLevel', 'low') as RiskLevel;

  const chain = parseChain(commandLine, subcommandCommands);

  const segmentData: SegmentData[] = chain.segments.map((s) => {
    const entry = dictionary[s.parsed.commandName] ?? null;
    const resolved = resolveCompoundSubcommand(s.parsed, entry);
    s.parsed.subcommand = resolved.subcommand;
    s.parsed.args = resolved.args;
    return {
      parsed: s.parsed,
      entry,
      risk: assessRisk(s.parsed, entry),
    };
  });

  const overallRisk = chain.isChain
    ? maxRisk(...segmentData.map((s) => s.risk))
    : segmentData[0].risk;

  if (!meetsMinRisk(overallRisk, minRiskLevel)) return;

  const format = config.get<string>('notificationFormat', 'detailed') as ExplanationFormat;
  const operators = chain.segments.map((s) => s.operator);
  const message = formatExplanation(segmentData, operators, overallRisk, {
    format, language,
  });
  showNotification(message, overallRisk);
}

function handleNotificationFile(): void {
  try {
    const raw = fs.readFileSync(NOTIFY_FILE, 'utf8');
    const data = JSON.parse(raw);

    if (data.ts <= lastNotifyTs) return;
    lastNotifyTs = data.ts;

    fs.unlinkSync(NOTIFY_FILE);

    if (!data.command || typeof data.command !== 'string') return;
    processAndNotify(data.command, 'hookEnabled');
  } catch {
    // ファイル読み取り失敗は無視
  }
}

function handleShellExecution(
  event: vscode.TerminalShellExecutionStartEvent
): void {
  try {
    const commandLine = event.execution.commandLine.value;
    if (!commandLine || commandLine.trim() === '') return;
    processAndNotify(commandLine, 'terminalEnabled');
  } catch (e) {
    console.error('[ShellSense] Error in handleShellExecution:', e);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  // Config initialization (辞書より先)
  try {
    const configPath = path.join(context.extensionPath, 'dist', 'config');
    const ssConfig = vscode.workspace.getConfiguration('shellsense');
    const style = ssConfig.get<string>('style', 'legend');
    const chainNumbering = ssConfig.get<string>('chainNumbering', 'dot');

    initFormatterConfig(configPath, {
      style,
      overrides: { labels: { ja: { chainNumbering }, en: { chainNumbering } } },
    });
  } catch (e) {
    console.error('[ShellSense] Failed to load formatter config:', e);
  }

  // Dictionary initialization
  try {
    const dictPath = path.join(context.extensionPath, 'dist', 'dictionary');
    const result = loadDictionary(dictPath);
    dictionary = result.commands;
    subcommandCommands = Object.entries(dictionary)
      .filter(
        ([_, e]) => e.subcommands && Object.keys(e.subcommands).length > 0
      )
      .map(([name]) => name);
  } catch (e) {
    console.error('[ShellSense] Failed to load dictionary:', e);
  }

  // Shell Integration event listener
  const disposable = vscode.window.onDidStartTerminalShellExecution(
    handleShellExecution
  );

  // Test command
  const testCommand = vscode.commands.registerCommand(
    'shellsense.test',
    () => {
      const commandCount = Object.keys(dictionary).length;
      vscode.window.showInformationMessage(
        `[ShellSense] Active — ${commandCount} commands loaded`
      );
    }
  );

  // Style/chainNumbering 設定変更リスナー（即時反映）
  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('shellsense')) {
      try {
        const configPath = path.join(context.extensionPath, 'dist', 'config');
        const ssConfig = vscode.workspace.getConfiguration('shellsense');
        const style = ssConfig.get<string>('style', 'legend');
        const chainNumbering = ssConfig.get<string>('chainNumbering', 'dot');

        initFormatterConfig(configPath, {
          style,
          overrides: { labels: { ja: { chainNumbering }, en: { chainNumbering } } },
        });
      } catch (e) {
        console.error('[ShellSense] Failed to reload formatter config:', e);
      }
    }
  });

  // File-based IPC watcher for PreToolUse hook notifications
  const watcher = fs.watch(os.tmpdir(), (_eventType, filename) => {
    if (filename === 'shellsense-notify.json') {
      setTimeout(handleNotificationFile, 50);
    }
  });
  watcher.on('error', () => {});

  context.subscriptions.push(disposable, testCommand, configListener, { dispose: () => watcher.close() });

  // Hook auto-registration (non-blocking)
  registerHookIfNeeded(context.extensionPath).catch((e) => {
    console.error('[ShellSense] Hook registration error:', e);
  });
}

export function deactivate(): void {}
