import type { RuleSource } from "./types";

export const PROJECT_MARKERS = [".git", "pyproject.toml", "package.json", "Cargo.toml", "go.mod", ".venv"] as const;

export const PROJECT_RULE_SUBDIRS = [
  [".smmr", "rules"],
  [".omo", "rules"],
  [".claude", "rules"],
  [".cursor", "rules"],
  [".github", "instructions"],
  [".sisyphus", "rules"],
] as const;

export const PROJECT_RULE_FILES = [".github/copilot-instructions.md"] as const;
export const OPENCODE_USER_RULE_DIRS = [".smmr/rules", ".omo/rules", ".opencode/rules", ".sisyphus/rules"] as const;
export const USER_RULE_DIR = ".claude/rules";
export const RULE_EXTENSIONS = [".md", ".mdc"] as const;
export const GITHUB_INSTRUCTIONS_PATTERN = /\.instructions\.md$/;
export const AGENTS_FILENAME = "AGENTS.md";
export const GLOBAL_DISTANCE = 9999;
export const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", "build", ".turbo", ".next", "coverage"]);

export const SOURCE_PRIORITY: ReadonlyMap<RuleSource, number> = new Map([
  [".smmr/rules", 0],
  [".omo/rules", 1],
  [".claude/rules", 2],
  [".cursor/rules", 3],
  [".github/instructions", 4],
  [".github/copilot-instructions.md", 5],
  [".sisyphus/rules", 6],
  ["~/.smmr/rules", 100],
  ["~/.omo/rules", 101],
  ["~/.opencode/rules", 102],
  ["~/.claude/rules", 103],
  ["~/.sisyphus/rules", 104],
]);
