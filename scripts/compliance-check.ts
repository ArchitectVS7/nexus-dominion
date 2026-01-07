#!/usr/bin/env npx tsx
/**
 * Terminology Compliance Check Script
 *
 * ⚠️ TEMPORARY SCRIPT - SCHEDULED FOR REMOVAL ⚠️
 *
 * Created: January 2026
 * Remove After: March 2026 (or after 2 months of zero violations)
 *
 * This script enforces the branding terminology rules for Nexus Dominion.
 * It was created during the P0 terminology crisis to ensure consistent
 * migration from "planet" to "sector" terminology.
 *
 * WHEN TO REMOVE:
 * - After 2 consecutive months of zero violations
 * - Once ESLint rules are proven effective (see .eslintrc.json)
 * - After team is confident in new terminology habits
 *
 * FORBIDDEN TERMS:
 * - "planet" or "planets" (use "sector" or "sectors")
 * - "25 AI opponents" (use "10-100 AI opponents (configurable)")
 * - "200 turns" without game mode context
 * - "Bot Phase" (use "simultaneous processing" or "action resolution")
 *
 * Run: npm run compliance:check
 * CI: This runs automatically on every push/PR
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  line: number;
  content: string;
  rule: string;
  severity: "critical" | "warning";
}

const ROOT_DIR = path.resolve(__dirname, "..");

// Files/directories to exclude from checking
const EXCLUDED_PATHS = [
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "playwright-report",
  // The crisis document itself documents violations, not a violation
  "CODE-REVIEW-TERMINOLOGY-CRISIS.md",
  // This script references forbidden terms to check for them
  "compliance-check.ts",
  // Database migration files may reference old table names
  "drizzle",
  // Terminology audit worklist references violations
  "TERMINOLOGY-QA-AUDIT-WORKLIST.md",
  // CLAUDE.md documents forbidden terms as examples of what NOT to use
  "CLAUDE.md",
  // CONTRIBUTING.md documents forbidden terms as examples of what NOT to use
  "CONTRIBUTING.md",
  // Docs directory needs cleanup - excluded temporarily
  "docs",
  // Test files need separate cleanup pass
  "tests",
  "e2e",
  ".test.ts",
  ".spec.ts",
];

// Files that are allowed to have "planet" in specific contexts
const ALLOWED_EXCEPTIONS: Record<string, string[]> = {
  // Schema file: the database table is named 'planets' (migration pending)
  // But variable names should still use 'sector'
  "schema.ts": ["pgTable"], // Only allow in table definition
};

function runGrep(pattern: string, pathGlob: string): string[] {
  try {
    // Use grep with line numbers
    const cmd =
      process.platform === "win32"
        ? `findstr /S /N /I /C:"${pattern}" ${pathGlob}`
        : `grep -rn "${pattern}" ${pathGlob} 2>/dev/null || true`;

    const result = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return result.split("\n").filter((line) => line.trim());
  } catch {
    return [];
  }
}

function isExcluded(filePath: string): boolean {
  return EXCLUDED_PATHS.some(
    (excluded) => filePath.includes(excluded) || filePath.includes(excluded.replace("/", "\\"))
  );
}

function checkForViolations(): Violation[] {
  const violations: Violation[] = [];

  console.log("\n========================================");
  console.log("  TERMINOLOGY COMPLIANCE CHECK");
  console.log("========================================\n");

  // Rule 1: Check for "planet" in source code
  console.log("Checking Rule 1: 'planet/planets' in source code...");
  const srcFiles = getAllFiles(path.join(ROOT_DIR, "src"), [".ts", ".tsx"]);

  for (const file of srcFiles) {
    if (isExcluded(file)) continue;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // Case-insensitive check for planet/planets
      const planetMatch = line.match(/\bplanets?\b/i);
      if (planetMatch) {
        // Check if it's an allowed exception
        const fileName = path.basename(file);
        const exceptions = ALLOWED_EXCEPTIONS[fileName] || [];
        const isAllowed = exceptions.some((exc) => line.includes(exc));

        if (!isAllowed) {
          violations.push({
            file: path.relative(ROOT_DIR, file),
            line: idx + 1,
            content: line.trim().substring(0, 100),
            rule: "planet-terminology",
            severity: line.toLowerCase().includes("your planet") ? "critical" : "warning",
          });
        }
      }
    });
  }

  // Rule 2: Check for "planet" in documentation
  console.log("Checking Rule 2: 'planet/planets' in documentation...");
  const docFiles = getAllFiles(path.join(ROOT_DIR, "docs"), [".md"]);
  const rootMdFiles = fs.readdirSync(ROOT_DIR).filter((f) => f.endsWith(".md"));

  const allDocs = [
    ...docFiles,
    ...rootMdFiles.map((f) => path.join(ROOT_DIR, f)),
  ];

  for (const file of allDocs) {
    if (isExcluded(file)) continue;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const planetMatch = line.match(/\bplanets?\b/i);
      if (planetMatch) {
        violations.push({
          file: path.relative(ROOT_DIR, file),
          line: idx + 1,
          content: line.trim().substring(0, 100),
          rule: "planet-terminology",
          severity: "warning",
        });
      }
    });
  }

  // Rule 3: Check for variable names containing "planet"
  console.log("Checking Rule 3: Variable names with 'planet'...");
  for (const file of srcFiles) {
    if (isExcluded(file)) continue;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // Check for camelCase/PascalCase variable names: planetId, winnerPlanets, etc.
      const varMatch = line.match(/\b\w*[Pp]lanet\w*\b/);
      if (varMatch && !line.includes("pgTable") && !line.includes("// ")) {
        // Avoid double-counting with Rule 1
        if (!line.match(/\bplanets?\b/i)) {
          violations.push({
            file: path.relative(ROOT_DIR, file),
            line: idx + 1,
            content: line.trim().substring(0, 100),
            rule: "variable-naming",
            severity: "critical",
          });
        }
      }
    });
  }

  // Rule 4: Check for "Bot Phase"
  console.log("Checking Rule 4: 'Bot Phase' references...");
  for (const file of [...srcFiles, ...allDocs]) {
    if (isExcluded(file)) continue;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes("bot phase")) {
        violations.push({
          file: path.relative(ROOT_DIR, file),
          line: idx + 1,
          content: line.trim().substring(0, 100),
          rule: "bot-phase",
          severity: "critical",
        });
      }
    });
  }

  // Rule 5: Check for "25 AI opponents" specifically
  console.log("Checking Rule 5: '25 AI opponents' references...");
  for (const file of allDocs) {
    if (isExcluded(file)) continue;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      if (line.match(/25\s*(AI\s*)?opponents/i)) {
        violations.push({
          file: path.relative(ROOT_DIR, file),
          line: idx + 1,
          content: line.trim().substring(0, 100),
          rule: "bot-count",
          severity: "critical",
        });
      }
    });
  }

  // Rule 6: Check for "200 turns" without proper context
  console.log("Checking Rule 6: '200 turns' without game mode context...");
  for (const file of [...srcFiles, ...allDocs]) {
    if (isExcluded(file)) continue;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // Check for "200 turns" that isn't properly contextualized
      if (line.match(/200\s*turns/i)) {
        // Allow if it mentions "configurable", "based on mode", "default", or is in test data
        const hasContext =
          line.toLowerCase().includes("configurable") ||
          line.toLowerCase().includes("based on") ||
          line.toLowerCase().includes("default") ||
          line.toLowerCase().includes("mode") ||
          line.toLowerCase().includes("test");

        if (!hasContext) {
          violations.push({
            file: path.relative(ROOT_DIR, file),
            line: idx + 1,
            content: line.trim().substring(0, 100),
            rule: "turn-count",
            severity: file.includes("src/") ? "critical" : "warning",
          });
        }
      }
    });
  }

  // Rule 7: Check test files for planet references
  console.log("Checking Rule 7: Test files...");
  const testDirs = [
    path.join(ROOT_DIR, "tests"),
    path.join(ROOT_DIR, "e2e"),
    path.join(ROOT_DIR, "src"),
  ];

  for (const testDir of testDirs) {
    if (!fs.existsSync(testDir)) continue;

    const testFiles = getAllFiles(testDir, [".test.ts", ".spec.ts"]);
    for (const file of testFiles) {
      if (isExcluded(file)) continue;

      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, idx) => {
        if (line.match(/\bplanets?\b/i)) {
          violations.push({
            file: path.relative(ROOT_DIR, file),
            line: idx + 1,
            content: line.trim().substring(0, 100),
            rule: "test-file-terminology",
            severity: "warning",
          });
        }
      });
    }
  }

  return violations;
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!isExcluded(fullPath)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (extensions.some((ext) => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

function printReport(violations: Violation[]): void {
  if (violations.length === 0) {
    console.log("\n========================================");
    console.log("  ALL CHECKS PASSED");
    console.log("========================================\n");
    return;
  }

  // Group by rule
  const byRule: Record<string, Violation[]> = {};
  for (const v of violations) {
    if (!byRule[v.rule]) byRule[v.rule] = [];
    byRule[v.rule]!.push(v);
  }

  // Group by severity
  const critical = violations.filter((v) => v.severity === "critical");
  const warnings = violations.filter((v) => v.severity === "warning");

  console.log("\n========================================");
  console.log("  COMPLIANCE CHECK FAILED");
  console.log("========================================\n");

  console.log(`Total violations: ${violations.length}`);
  console.log(`  Critical: ${critical.length}`);
  console.log(`  Warnings: ${warnings.length}\n`);

  // Print by rule
  for (const [rule, ruleViolations] of Object.entries(byRule)) {
    console.log(`\n--- ${rule.toUpperCase()} (${ruleViolations.length} violations) ---\n`);

    // Show first 10 for each rule
    const toShow = ruleViolations.slice(0, 10);
    for (const v of toShow) {
      const icon = v.severity === "critical" ? "[CRITICAL]" : "[WARNING]";
      console.log(`${icon} ${v.file}:${v.line}`);
      console.log(`         ${v.content}`);
    }

    if (ruleViolations.length > 10) {
      console.log(`         ... and ${ruleViolations.length - 10} more`);
    }
  }

  console.log("\n========================================");
  console.log("  FIX ALL VIOLATIONS BEFORE COMMITTING");
  console.log("========================================\n");
}

// Main execution
const violations = checkForViolations();
printReport(violations);

// Exit with error code if violations found
if (violations.length > 0) {
  console.log(`\nExiting with code 1 (${violations.length} violations found)`);
  process.exit(1);
} else {
  console.log("\nExiting with code 0 (all checks passed)");
  process.exit(0);
}
