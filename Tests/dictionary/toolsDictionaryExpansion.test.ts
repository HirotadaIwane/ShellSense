import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const TOOLS_DIR = path.join(__dirname, "..", "..", "dictionary", "tools");

function readToolDict(fileName: string): Record<string, unknown> {
  const filePath = path.join(TOOLS_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

function getSubcommands(
  data: Record<string, unknown>,
  commandName: string
): Record<string, Record<string, unknown>> {
  const commands = data["commands"] as Record<string, Record<string, unknown>>;
  return commands[commandName]["subcommands"] as Record<string, Record<string, unknown>>;
}

// --- Scenario 1: JSON構文の正当性 (P1) ---
describe("JSON構文の正当性", () => {
  it.each(["npm.json", "docker.json", "pip.json"])(
    "%s が valid JSON であること",
    (fileName) => {
      const filePath = path.join(TOOLS_DIR, fileName);
      const raw = fs.readFileSync(filePath, "utf8");
      expect(() => JSON.parse(raw)).not.toThrow();
    }
  );
});

// --- Scenario 2: サブコマンド数の検証 (P2) ---
describe("サブコマンド数の検証", () => {
  it("npm のサブコマンドが15個存在すること", () => {
    const data = readToolDict("npm.json");
    const subs = getSubcommands(data, "npm");
    expect(Object.keys(subs)).toHaveLength(15);
  });

  it("docker のサブコマンドが30個存在すること", () => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    expect(Object.keys(subs)).toHaveLength(30);
  });

  it("pip のサブコマンドが7個存在すること", () => {
    const data = readToolDict("pip.json");
    const subs = getSubcommands(data, "pip");
    expect(Object.keys(subs)).toHaveLength(7);
  });
});

// --- Scenario 3: 新規サブコマンドの存在確認 (P2) ---
describe("新規サブコマンドの存在確認", () => {
  const npmNewSubs = [
    "init", "uninstall", "update", "ci", "audit",
    "outdated", "publish", "link", "unlink", "cache clean", "start",
  ];

  it.each(npmNewSubs)("npm に %s サブコマンドが存在すること", (sub) => {
    const data = readToolDict("npm.json");
    const subs = getSubcommands(data, "npm");
    expect(subs[sub]).toBeDefined();
  });

  const dockerNewSubs = [
    "start", "restart", "kill", "rmi", "system prune", "tag",
    "inspect", "cp", "save", "load",
    "compose logs", "compose exec", "compose restart", "compose pull",
  ];

  it.each(dockerNewSubs)("docker に %s サブコマンドが存在すること", (sub) => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    expect(subs[sub]).toBeDefined();
  });

  const pipNewSubs = ["show", "check", "download"];

  it.each(pipNewSubs)("pip に %s サブコマンドが存在すること", (sub) => {
    const data = readToolDict("pip.json");
    const subs = getSubcommands(data, "pip");
    expect(subs[sub]).toBeDefined();
  });
});

// --- Scenario 4: バイリンガルカバレッジ (P3) ---
describe("バイリンガルカバレッジ", () => {
  const tools = [
    { file: "npm.json", command: "npm" },
    { file: "docker.json", command: "docker" },
    { file: "pip.json", command: "pip" },
  ];

  it.each(tools)(
    "$command の全サブコマンド description に ja/en が存在し空でないこと",
    ({ file, command }) => {
      const data = readToolDict(file);
      const subs = getSubcommands(data, command);
      for (const [subName, subEntry] of Object.entries(subs)) {
        const desc = subEntry["description"] as Record<string, string>;
        expect(desc["ja"], `${command}:${subName} description.ja`).toBeTruthy();
        expect(desc["en"], `${command}:${subName} description.en`).toBeTruthy();
      }
    }
  );

  it.each(tools)(
    "$command の全フラグ description に ja/en が存在し空でないこと",
    ({ file, command }) => {
      const data = readToolDict(file);
      const subs = getSubcommands(data, command);
      for (const [subName, subEntry] of Object.entries(subs)) {
        const flags = subEntry["flags"] as Record<string, Record<string, unknown>> | undefined;
        if (!flags) continue;
        for (const [flagName, flagEntry] of Object.entries(flags)) {
          const desc = flagEntry["description"] as Record<string, string>;
          expect(desc["ja"], `${command}:${subName}:${flagName} description.ja`).toBeTruthy();
          expect(desc["en"], `${command}:${subName}:${flagName} description.en`).toBeTruthy();
        }
      }
    }
  );
});

// --- Scenario 5: riskOverride の検証 (P4) ---
describe("riskOverride の検証", () => {
  it("docker system prune の riskOverride が critical であること", () => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    expect(subs["system prune"]["riskOverride"]).toBe("critical");
  });

  it.each(["kill", "rmi"])("docker %s の riskOverride が high であること", (sub) => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    expect(subs[sub]["riskOverride"]).toBe("high");
  });

  it("npm publish の riskOverride が high であること", () => {
    const data = readToolDict("npm.json");
    const subs = getSubcommands(data, "npm");
    expect(subs["publish"]["riskOverride"]).toBe("high");
  });

  it.each(["show", "check", "download"])(
    "pip %s の riskOverride が low であること",
    (sub) => {
      const data = readToolDict("pip.json");
      const subs = getSubcommands(data, "pip");
      expect(subs[sub]["riskOverride"]).toBe("low");
    }
  );
});

// --- Scenario 6: riskModifier の検証 (P5) ---
describe("riskModifier の検証", () => {
  it("docker system prune の -a に riskModifier=high があること", () => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    const flags = subs["system prune"]["flags"] as Record<string, Record<string, unknown>>;
    expect(flags["-a"]["riskModifier"]).toBe("high");
  });

  it("docker system prune の --volumes に riskModifier=high があること", () => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    const flags = subs["system prune"]["flags"] as Record<string, Record<string, unknown>>;
    expect(flags["--volumes"]["riskModifier"]).toBe("high");
  });

  it("docker rmi の -f に riskModifier=high があること", () => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    const flags = subs["rmi"]["flags"] as Record<string, Record<string, unknown>>;
    expect(flags["-f"]["riskModifier"]).toBe("high");
  });

  it("docker compose exec の --privileged に riskModifier=high があること", () => {
    const data = readToolDict("docker.json");
    const subs = getSubcommands(data, "docker");
    const flags = subs["compose exec"]["flags"] as Record<string, Record<string, unknown>>;
    expect(flags["--privileged"]["riskModifier"]).toBe("high");
  });

  it.each(["fix", "--force"])(
    "npm audit の %s に riskModifier=medium があること",
    (flag) => {
      const data = readToolDict("npm.json");
      const subs = getSubcommands(data, "npm");
      const flags = subs["audit"]["flags"] as Record<string, Record<string, unknown>>;
      expect(flags[flag]["riskModifier"]).toBe("medium");
    }
  );

  it("npm uninstall の --global に riskModifier=medium があること", () => {
    const data = readToolDict("npm.json");
    const subs = getSubcommands(data, "npm");
    const flags = subs["uninstall"]["flags"] as Record<string, Record<string, unknown>>;
    expect(flags["--global"]["riskModifier"]).toBe("medium");
  });
});
