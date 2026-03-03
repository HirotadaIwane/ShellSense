# ShellSense

Automatically analyzes shell commands executed in Claude Code / VSCode terminal and shows their meaning and risk level in real time.

## Why ShellSense?

When developing with AI, the AI asks for permission to run commands. Beginners often approve them blindly without understanding what they do.

ShellSense tells you what a command does and how risky it is — **right before it runs**.

- **Beginners** — Learn what each command does as you develop
- **Intermediate** — Discover flags and commands you didn't know about

Use AI's power while staying in control of what you're building.

## Preview

```
┌─────────────────────────────────────────────────────┐
│  ℹ️ ShellSense                                       │
│                                                     │
│  ⚠️ Risk: HIGH                                       │
│  rm — Remove files or directories                   │
│    -r: Remove directories recursively               │
│    -f: Force removal without confirmation           │
│    Target: node_modules                             │
└─────────────────────────────────────────────────────┘
```

## Features

- **Auto command explanation** — Notifies you what `rm -rf node_modules` does before it runs
- **Risk level detection** — 4 levels: Low / Medium / High / Critical
- **320+ commands** — Covers Git, Docker, AWS CLI, kubectl, npm and more
- **Chain command analysis** — Parses commands joined by `&&`, `||`, `|`, `;`
- **Subcommand recognition** — Understands `git commit`, `docker build`, `npm install` etc.
- **Dual source detection** — Captures commands from both Claude Code hook and VSCode Shell Integration
- **2 style presets** — Legend (default) or Emoji
- **Japanese / English** — All dictionary entries and UI labels are bilingual
- **Zero runtime dependencies** — Minimal startup time

## Installation

Search for "ShellSense" in the VSCode Extension Marketplace and install.

On first activation, the extension will offer to register itself as a Claude Code hook (`~/.claude/settings.json`). Once registered, ShellSense will notify you every time Claude Code runs a Bash command.

## Configuration

Open settings (`Ctrl+,`) and search for `shellsense`, or edit `settings.json` directly.

| Setting | Default | Description |
|---------|---------|-------------|
| `shellsense.enabled` | `true` | Enable / disable ShellSense |
| `shellsense.language` | `"ja"` | Notification language (`ja` / `en`) |
| `shellsense.minRiskLevel` | `"low"` | Minimum risk level to show notifications |
| `shellsense.hookEnabled` | `true` | Notifications from Claude Code hook |
| `shellsense.terminalEnabled` | `true` | Notifications from VSCode terminal |
| `shellsense.notificationFormat` | `"detailed"` | Format (`detailed` / `compact`) |
| `shellsense.style` | `"legend"` | Style preset (`legend` / `emoji`) |
| `shellsense.chainNumbering` | `"dot"` | Chain numbering style |

## Risk Levels

| Level | Criteria | Examples |
|-------|----------|---------|
| **Low** | Read-only | `ls`, `cat`, `pwd`, `grep` |
| **Medium** | File writes / modifications | `cp`, `mv`, `mkdir`, `npm install` |
| **High** | Deletion / overwrite | `rm`, `rm -rf`, `git reset` |
| **Critical** | System-level / irreversible | `sudo`, `git push --force`, `curl \| sh` |

## Style Presets

| Style | Description |
|-------|-------------|
| **legend** | Block shade gauge, HUD-style compact display (default) |
| **emoji** | Rich emoji decorations |

## License

MIT
