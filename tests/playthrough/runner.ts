#!/usr/bin/env tsx
/**
 * Playthrough Test Runner
 *
 * CLI interface for running gameplay simulations.
 *
 * Usage:
 *   npx tsx tests/playthrough/runner.ts quick --runs 10
 *   npx tsx tests/playthrough/runner.ts matchups --runs 5
 *   npx tsx tests/playthrough/runner.ts balance
 *   npx tsx tests/playthrough/runner.ts report --output report.md
 */

import * as fs from "fs";
import * as path from "path";
import { GameHarness, runQuickGame, runMatchup } from "./harness";
import type { GameResult, BotArchetype } from "./types";
import { BALANCE_THRESHOLDS } from "./types";
import {
  MetricsAggregator,
  generateConsoleReport,
  generateMarkdownReport,
} from "./metrics";

// =============================================================================
// CLI PARSING (simple, no external deps)
// =============================================================================

interface CliOptions {
  command: string;
  runs: number;
  seed?: number;
  debug: boolean;
  bots: number;
  maxTurns: number;
  output?: string;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const command = args[0] ?? "quick";

  const options: CliOptions = {
    command,
    runs: 10,
    seed: undefined,
    debug: false,
    bots: 4,
    maxTurns: 30,
    output: undefined,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "-r":
      case "--runs":
        options.runs = parseInt(next ?? "10", 10);
        i++;
        break;
      case "-s":
      case "--seed":
        options.seed = parseInt(next ?? "0", 10);
        i++;
        break;
      case "-b":
      case "--bots":
        options.bots = parseInt(next ?? "4", 10);
        i++;
        break;
      case "-t":
      case "--turns":
        options.maxTurns = parseInt(next ?? "30", 10);
        i++;
        break;
      case "-d":
      case "--debug":
        options.debug = true;
        break;
      case "-o":
      case "--output":
        options.output = next;
        i++;
        break;
    }
  }

  return options;
}

// =============================================================================
// PROGRESS DISPLAY
// =============================================================================

function showProgress(current: number, total: number): void {
  process.stdout.write(`\r  Progress: ${current}/${total}`);
}

function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (dir && dir !== "." && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// =============================================================================
// COMMANDS
// =============================================================================

async function runQuickCommand(options: CliOptions): Promise<void> {
  console.log(
    `\nRunning ${options.runs} quick duels (${options.bots} bots, ${options.maxTurns} turns)...`
  );

  const results: GameResult[] = [];
  const baseSeed = options.seed ?? Date.now();

  for (let i = 0; i < options.runs; i++) {
    const seed = baseSeed + i;
    const harness = new GameHarness({
      botCount: options.bots,
      maxTurns: options.maxTurns,
      seed,
      debug: options.debug,
    });

    const result = await harness.runGame();
    results.push(result);

    if (!options.debug) {
      showProgress(i + 1, options.runs);
    }
  }

  console.log("\n");

  // Use new metrics system
  const aggregator = new MetricsAggregator();
  aggregator.addGames(results);
  const stats = aggregator.getAggregatedStats();

  // Print console report
  console.log(generateConsoleReport(stats));

  // Optionally save markdown report
  if (options.output) {
    const report = generateMarkdownReport(stats, {
      title: `Quick Duel Report (${options.runs} games)`,
    });
    ensureDirectoryExists(options.output);
    fs.writeFileSync(options.output, report);
    console.log(`\nReport saved to: ${options.output}`);
  }
}

async function runMatchupsCommand(options: CliOptions): Promise<void> {
  const archetypes: BotArchetype[] = [
    "warlord",
    "diplomat",
    "merchant",
    "schemer",
    "turtle",
    "blitzkrieg",
    "tech_rush",
    "opportunist",
  ];

  // Generate all unique pairs
  const matchups: Array<[BotArchetype, BotArchetype]> = [];
  for (let i = 0; i < archetypes.length; i++) {
    for (let j = i + 1; j < archetypes.length; j++) {
      matchups.push([archetypes[i]!, archetypes[j]!]);
    }
  }

  const totalGames = matchups.length * options.runs;
  console.log(
    `\nRunning ${matchups.length} matchups × ${options.runs} runs = ${totalGames} games...`
  );

  const results: GameResult[] = [];
  const baseSeed = options.seed ?? Date.now();
  let gameNum = 0;

  for (const [arch1, arch2] of matchups) {
    for (let i = 0; i < options.runs; i++) {
      const seed = baseSeed + gameNum;
      const result = await runMatchup(arch1, arch2, 50, seed);
      results.push(result);
      gameNum++;

      if (!options.debug) {
        showProgress(gameNum, totalGames);
      }
    }
  }

  console.log("\n");

  // Use new metrics system
  const aggregator = new MetricsAggregator();
  aggregator.addGames(results);
  const stats = aggregator.getAggregatedStats();

  // Print console report
  console.log(generateConsoleReport(stats));

  // Optionally save markdown report with matchup matrix
  if (options.output) {
    const report = generateMarkdownReport(stats, {
      title: `Matchup Analysis Report (${totalGames} games)`,
      includeMatchups: true,
    });
    ensureDirectoryExists(options.output);
    fs.writeFileSync(options.output, report);
    console.log(`\nReport saved to: ${options.output}`);
  }
}

async function runBalanceCommand(options: CliOptions): Promise<void> {
  console.log("\n=== BALANCE TEST SUITE ===\n");

  const aggregator = new MetricsAggregator();
  const baseSeed = options.seed ?? Date.now();

  // Phase 1: Quick duels (warmup)
  console.log("Phase 1: Quick Duels (4 bots, 30 turns)");
  for (let i = 0; i < 50; i++) {
    const result = await runQuickGame(4, 30, baseSeed + i);
    aggregator.addGame(result);
    showProgress(i + 1, 50);
  }
  console.log(" ✓");

  // Phase 2: Standard games (main test)
  console.log("Phase 2: Standard Games (10 bots, 100 turns)");
  for (let i = 0; i < 100; i++) {
    const harness = new GameHarness({
      botCount: 10,
      maxTurns: 100,
      seed: baseSeed + 1000 + i,
      archetypeDistribution: "balanced",
    });
    const result = await harness.runGame();
    aggregator.addGame(result);
    showProgress(i + 1, 100);
  }
  console.log(" ✓");

  // Phase 3: Archetype matchups
  console.log("Phase 3: 1v1 Matchups");
  const archetypes: BotArchetype[] = [
    "warlord",
    "diplomat",
    "merchant",
    "schemer",
    "turtle",
    "blitzkrieg",
    "tech_rush",
    "opportunist",
  ];

  let matchupNum = 0;
  const totalMatchups = 28 * 5; // 28 pairs × 5 runs

  for (let i = 0; i < archetypes.length; i++) {
    for (let j = i + 1; j < archetypes.length; j++) {
      for (let k = 0; k < 5; k++) {
        const result = await runMatchup(
          archetypes[i]!,
          archetypes[j]!,
          50,
          baseSeed + 2000 + matchupNum
        );
        aggregator.addGame(result);
        matchupNum++;
        showProgress(matchupNum, totalMatchups);
      }
    }
  }
  console.log(" ✓");

  // Generate stats
  const stats = aggregator.getAggregatedStats();
  console.log(`\nTotal games: ${stats.totalGames}`);

  // Print console report
  console.log(generateConsoleReport(stats));

  // Check for balance issues
  const criticalIssues = stats.balanceIssues.filter(
    (i) => i.type === "overpowered" || i.type === "underpowered"
  );

  if (criticalIssues.length > 0) {
    console.log("\n❌ CRITICAL BALANCE ISSUES DETECTED:");
    for (const issue of criticalIssues) {
      console.log(`   ${issue.message}`);
    }
  } else {
    console.log("\n✅ No critical balance issues detected");
  }

  // Save report if output specified
  if (options.output) {
    const report = generateMarkdownReport(stats, {
      title: "Full Balance Test Report",
      includeMatchups: true,
      includeArchetypeDetails: true,
    });
    ensureDirectoryExists(options.output);
    fs.writeFileSync(options.output, report);
    console.log(`\nReport saved to: ${options.output}`);
  }
}

async function runReportCommand(options: CliOptions): Promise<void> {
  if (!options.output) {
    console.log("Error: --output (-o) is required for report command");
    console.log("Usage: npx tsx tests/playthrough/runner.ts report -o report.md --runs 100");
    return;
  }

  console.log(`\nGenerating balance report (${options.runs} games)...`);

  const results: GameResult[] = [];
  const baseSeed = options.seed ?? Date.now();

  for (let i = 0; i < options.runs; i++) {
    const harness = new GameHarness({
      botCount: options.bots,
      maxTurns: options.maxTurns,
      seed: baseSeed + i,
      archetypeDistribution: "balanced",
    });

    const result = await harness.runGame();
    results.push(result);
    showProgress(i + 1, options.runs);
  }

  console.log("\n");

  const aggregator = new MetricsAggregator();
  aggregator.addGames(results);
  const stats = aggregator.getAggregatedStats();

  // Generate and save markdown report
  const report = generateMarkdownReport(stats, {
    title: `Balance Report (${options.runs} games, ${options.bots} bots)`,
    includeMatchups: false,
    includeArchetypeDetails: true,
  });

  ensureDirectoryExists(options.output);
  fs.writeFileSync(options.output, report);
  console.log(`Report saved to: ${options.output}`);

  // Also print summary to console
  console.log(generateConsoleReport(stats));
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const options = parseArgs();

  console.log("═".repeat(70));
  console.log("  PLAYTHROUGH TEST SYSTEM");
  console.log("═".repeat(70));

  switch (options.command) {
    case "quick":
      await runQuickCommand(options);
      break;

    case "matchups":
      await runMatchupsCommand(options);
      break;

    case "balance":
      await runBalanceCommand(options);
      break;

    case "report":
      await runReportCommand(options);
      break;

    case "help":
    default:
      console.log(`
Usage: npx tsx tests/playthrough/runner.ts <command> [options]

Commands:
  quick      Run quick duels (default)
  matchups   Run all archetype 1v1 matchups
  balance    Run full balance test suite
  report     Generate markdown report

Options:
  -r, --runs <n>     Number of runs (default: 10)
  -s, --seed <n>     Random seed for reproducibility
  -b, --bots <n>     Number of bots (default: 4)
  -t, --turns <n>    Max turns per game (default: 30)
  -o, --output <f>   Save report to file (markdown)
  -d, --debug        Enable debug output

Examples:
  npx tsx tests/playthrough/runner.ts quick --runs 20
  npx tsx tests/playthrough/runner.ts matchups --runs 5 -o matchups.md
  npx tsx tests/playthrough/runner.ts balance -o balance-report.md
  npx tsx tests/playthrough/runner.ts report -o report.md --runs 500 --bots 8
`);
  }
}

main().catch(console.error);
